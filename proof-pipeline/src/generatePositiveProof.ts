import { ethers } from "ethers";
import { PrecompileChainInfoProvider } from "@gluwa/usc-sdk/dist/chain-info";
import { ProofBuilder } from "@gluwa/usc-sdk/dist/proof-provider/service";
import { getSepoliaChainKey } from "./chainInfo";
import { fetchWithRetry, createSafeJsonRpcProvider, destroyProvider } from "./retryUtils";

/**
 * Generates an inclusion proof for a given Sepolia transaction
 * @param sepoliaRpcUrl Sepolia RPC URL (for getting transaction details)
 * @param creditcoinRpcUrl Creditcoin RPC URL (for querying chainInfo precompile and waitUntilHeightAttested)
 * @param txHash Transaction hash to prove
 * @param proofBuilderUrl URL of the proof builder service (e.g., "https://prover.cc3-testnet.creditcoin.network")
 * @param timeoutMs Optional timeout for attestation wait (default: 5 minutes)
 * @returns Promise resolving to the proof data
 */
export async function generatePositiveProof(
  sepoliaRpcUrl: string,
  creditcoinRpcUrl: string,
  txHash: string,
  proofBuilderUrl: string,
  timeoutMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<any> {
  const sepoliaProvider = createSafeJsonRpcProvider(sepoliaRpcUrl);
  const creditcoinProvider = createSafeJsonRpcProvider(creditcoinRpcUrl);

  try {
    // Get the transaction with resilient retry
    console.log(`Fetching transaction ${txHash} from Sepolia...`);
    const tx = await fetchWithRetry(
      () => sepoliaProvider.getTransaction(txHash),
      3,
      1500,
      `getTransaction(${txHash})`
    );

    if (!tx) {
      throw new Error(`Transaction ${txHash} not found on Sepolia`);
    }

    // Wait for the transaction to be confirmed
    const txReceipt = await fetchWithRetry(
      () => tx.wait(),
      3,
      1500,
      `tx.wait(${txHash})`
    );

    if (!txReceipt) {
      throw new Error(`Transaction receipt not found for ${txHash}`);
    }
    const blockNumber = txReceipt.blockNumber;

    console.log(`Transaction ${txHash} confirmed in Sepolia block ${blockNumber}`);

    // Get the Sepolia chainKey using Creditcoin provider
    console.log("Resolving Sepolia chainKey from Creditcoin chainInfo precompile...");
    const chainKey = await fetchWithRetry(
      () => getSepoliaChainKey(creditcoinProvider),
      3,
      1500,
      "getSepoliaChainKey"
    );
    console.log(`Sepolia chainKey: ${chainKey}`);

    // Wait until the block is attested on Creditcoin
    console.log(`Waiting for Sepolia block ${blockNumber} to be attested on Creditcoin...`);
    const startTime = Date.now();
    const chainInfoProvider = new PrecompileChainInfoProvider(creditcoinProvider);

    await fetchWithRetry(
      () =>
        chainInfoProvider.waitUntilHeightAttested(
          chainKey,
          blockNumber,
          undefined, // pollIntervalMs (use SDK default: 15s)
          timeoutMs, // waitTimeoutMs
          undefined  // extraDelayMs (use SDK default: 5000ms)
        ),
      2,
      2000,
      `waitUntilHeightAttested(${blockNumber})`
    );

    const attestationTime = Date.now() - startTime;
    console.log(`Sepolia block ${blockNumber} attested on Creditcoin in ${attestationTime}ms`);

    // Generate the inclusion proof using the ProofBuilder
    console.log("Generating inclusion proof from proof builder service...");
    const proofBuilder = new ProofBuilder(chainKey, proofBuilderUrl);
    const proofResult = await fetchWithRetry(
      () => proofBuilder.getProof(txHash),
      3,
      2000,
      `proofBuilder.getProof(${txHash})`
    );

    if (!proofResult.success) {
      throw new Error(`Proof generation failed: ${proofResult.error}`);
    }

    return {
      proof: proofResult.data,
      blockNumber,
      txHash,
      attestationWaitTimeMs: attestationTime
    };
  } finally {
    destroyProvider(sepoliaProvider);
    destroyProvider(creditcoinProvider);
  }
}

// Export individual functions for potential reuse
export { ProofBuilder, PrecompileChainInfoProvider, getSepoliaChainKey };