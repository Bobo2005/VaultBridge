import http from "http";
import app from "../src/index";
import { telemetry } from "../src/telemetry";
import { inspectMerkleProof } from "../src/merkleInspector";
import { LiquidationKeeper } from "../src/keeper";

describe("Phase 2: Autonomous Watchtower, SSE Telemetry & Proof Inspector Suite", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    // Spin up ephemeral test server
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("1. Telemetry Manager & Circular Buffer Retention", () => {
    it("should broadcast events, retain the last 50, and compute aggregated metrics", () => {
      telemetry.broadcast({
        type: "InclusionProofGenerated",
        title: "Test Inclusion Event",
        description: "Testing telemetry broadcast",
        sourceChain: "Ethereum Sepolia",
        executionChain: "Creditcoin Testnet",
        latencyMs: 250,
        gasConsumed: 28500,
        gasSavedPercent: 45.2,
      });

      const history = telemetry.getHistory();
      expect(history.totalTracked).toBeGreaterThanOrEqual(1);
      expect(history.totalTracked).toBeLessThanOrEqual(50);
      expect(history.avgLatencyMs).toBeGreaterThan(0);
      expect(history.totalGasSavedUnits).toBeGreaterThan(0);

      const latest = history.events[0];
      expect(latest.type).toBe("InclusionProofGenerated");
      expect(latest.latencyMs).toBe(250);
    });

    it("should maintain circular buffer boundary without overflowing 50 items", () => {
      for (let i = 0; i < 60; i++) {
        telemetry.broadcast({
          type: "Heartbeat",
          title: `Heartbeat #${i}`,
          description: "Routine scan",
          sourceChain: "Ethereum Sepolia",
          executionChain: "Creditcoin Testnet",
          latencyMs: 100 + i,
        });
      }

      const history = telemetry.getHistory();
      expect(history.totalTracked).toBe(50);
      expect(history.events.length).toBe(50);
      expect(history.events[0].title).toBe("Heartbeat #59");
    });
  });

  describe("2. Cryptographic Merkle Patricia Trie Inspector", () => {
    it("should disassemble raw Merkle proofs and provide accurate Precompile 0x0FD2 gas efficiency", () => {
      const mockTxHash = "0x892a78f16b23d5678901234567890abcdef1234567890abcdef1234567890abc";
      const result = inspectMerkleProof({
        txHash: mockTxHash,
        height: 7219482,
        chainKey: 1,
      });

      expect(result.isValid).toBe(true);
      expect(result.chainKey).toBe(1);
      expect(result.blockHeight).toBe(7219482);
      expect(result.roots.transactionsRoot).toBeDefined();
      expect(result.trieLayers.length).toBe(4);
      expect(result.trieLayers[0].nodeType).toBe("Root");
      expect(result.trieLayers[3].nodeType).toBe("Leaf");

      // Gas benchmark validation
      expect(result.precompileDisassembly.targetAddress).toBe(
        "0x0000000000000000000000000000000000000FD2"
      );
      expect(result.precompileDisassembly.gasEfficiency.nativePrecompileGas).toBe(28500);
      expect(result.precompileDisassembly.gasEfficiency.traditionalBridgeGas).toBe(52000);
      expect(result.precompileDisassembly.gasEfficiency.gasSavedPercent).toBe(45.2);
    });
  });

  describe("3. Express API Endpoints", () => {
    it("GET /health should return 200 with service health status", async () => {
      const res = await fetch(`${baseUrl}/health`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe("ok");
      expect(data.service).toBe("vaultbridge-proof-pipeline");
    });

    it("GET /api/status should return attestation and relayer metrics", async () => {
      const res = await fetch(`${baseUrl}/api/status`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.precompileAddress).toBe(
        "0x0000000000000000000000000000000000000FD2"
      );
    });

    it("GET /api/attestations/history should return circular buffer and telemetry stats", async () => {
      const res = await fetch(`${baseUrl}/api/attestations/history`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.events)).toBe(true);
      expect(data.data.totalTracked).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/proof/inspect should accept inspection payload and return trie disassembly", async () => {
      const res = await fetch(`${baseUrl}/api/proof/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          height: 11566330,
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.trieLayers).toHaveLength(4);
      expect(data.data.precompileDisassembly.gasEfficiency.gasSavedPercent).toBe(45.2);
    });
  });

  describe("4. Autonomous Watchtower Daemon Lifecycle", () => {
    it("should instantiate and execute heartbeat scans without throwing", async () => {
      const keeper = new LiquidationKeeper();
      expect(keeper).toBeDefined();

      // Trigger single heartbeat scan
      await expect(keeper.heartbeatScan()).resolves.not.toThrow();

      // Stub attemptLiquidation to avoid live network delay
      const liquidationSpy = jest
        .spyOn(keeper as any, "attemptLiquidation")
        .mockImplementation(async () => {});

      await expect(keeper.checkOverdueInvoices()).resolves.not.toThrow();
      expect(liquidationSpy).toHaveBeenCalled();
    });
  });
});
