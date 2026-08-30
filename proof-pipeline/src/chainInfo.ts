import { PrecompileChainInfoProvider } from "@gluwa/usc-sdk/dist/chain-info";
import { ethers } from "ethers";

/**
 * Resolves the Sepolia chainKey using PrecompileChainInfoProvider
 * @param creditcoinProvider Ethereum provider for Creditcoin network (to query chainInfo precompile)
 * @returns Promise resolving to the chainKey for Sepolia
 */
export async function getSepoliaChainKey(creditcoinProvider: ethers.JsonRpcProvider): Promise<number> {
  const chainInfoProvider = new PrecompileChainInfoProvider(creditcoinProvider);
  const supportedChains = await chainInfoProvider.getSupportedChains();

  // Find Sepolia (chainId 11155111) in the supported chains
  const sepoliaChainInfo = supportedChains.find(
    (chain) => chain.chainId === 11155111
  );

  if (!sepoliaChainInfo) {
    // Available chains for debugging
    const chainInfo = supportedChains.map(c => ({
      chainKey: c.chainKey,
      chainId: c.chainId,
      chainName: c.chainName
    }));
    throw new Error(`Sepolia chain info not found in supported chains. Available chains: ${JSON.stringify(chainInfo)}`);
  }

  return sepoliaChainInfo.chainKey;
}

// Alternative export for direct use with a provider instance
export async function resolveSepoliaChainKey(
  creditcoinRpcUrl: string
): Promise<number> {
  const provider = new ethers.JsonRpcProvider(creditcoinRpcUrl);
  return await getSepoliaChainKey(provider);
}