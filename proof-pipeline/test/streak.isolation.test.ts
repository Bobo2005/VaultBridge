import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { generateStreakAbsenceProof } from "../src/generateStreakAbsenceProof";

describe("StreakChain Absence Proof Pipeline (Milestone S2)", () => {
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
  const creditcoinRpcUrl = process.env.CREDITCOIN_RPC_URL || "https://rpc.cc3-testnet.creditcoin.network";
  const proofBuilderUrl = process.env.CREDITCOIN_PROOF_BUILDER_URL || "https://prover.cc3-testnet.creditcoin.network";
  const streakRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const testStreakId = ethers.id(`streak-test-${Date.now()}`);

  it("should SUCCEED generating absence proof for a day with NO check-in", async () => {
    const unCheckedDayIndex = 5;
    const startBlock = 1000;
    const endBlock = 1050;

    console.log(`Testing absence proof on day without check-in (day ${unCheckedDayIndex})...`);

    // Mock contract that returns 0 events for day 5
    const mockEmptyContract = {
      filters: {
        CheckedIn: jest.fn().mockReturnValue({}),
      },
      queryFilter: jest.fn().mockResolvedValue([]),
    };

    const result = await generateStreakAbsenceProof(
      sepoliaRpcUrl,
      creditcoinRpcUrl,
      streakRegistryAddress,
      testStreakId,
      unCheckedDayIndex,
      startBlock,
      endBlock,
      proofBuilderUrl,
      2000,
      mockEmptyContract
    );

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.streakId).toBe(testStreakId);
    expect(result.dayIndex).toBe(unCheckedDayIndex);
    expect(result.headerNumber).toBe(endBlock);
    expect(result.continuityProof).toBeDefined();
    expect(result.merkleProof).toBeDefined();
  });

  it("should FAIL to find absence (revert/throw) when a CheckedIn event exists for that day", async () => {
    const checkedDayIndex = 0;
    const startBlock = 0;
    const endBlock = 500;

    // Mock contract simulating a real check-in on day 0
    const mockCheckedContract = {
      filters: {
        CheckedIn: jest.fn().mockReturnValue({}),
      },
      queryFilter: jest.fn().mockResolvedValue([
        {
          transactionHash: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca200112233445566778899aabb",
          blockNumber: 120,
        },
      ]),
    };

    await expect(
      generateStreakAbsenceProof(
        sepoliaRpcUrl,
        creditcoinRpcUrl,
        streakRegistryAddress,
        testStreakId,
        checkedDayIndex,
        startBlock,
        endBlock,
        proofBuilderUrl,
        2000,
        mockCheckedContract
      )
    ).rejects.toThrow(/Streak check-in transaction.*found for streak/);
  });
});
