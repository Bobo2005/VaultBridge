import { ethers } from "ethers";

/**
 * Default fallback RPC endpoints for Sepolia and Creditcoin USC
 */
export const SEPOLIA_FALLBACK_RPCS = [
  "https://rpc.sepolia.org",
  "https://1rpc.io/sepolia",
  "https://ethereum-sepolia-rpc.publicnode.com",
];

export const CREDITCOIN_FALLBACK_RPCS = [
  "https://rpc.cc3-testnet.creditcoin.network",
];

/**
 * Executes a network call with exponential backoff, jitter, and automatic retry.
 * 
 * @param fn Async function to execute
 * @param maxRetries Maximum retry attempts (default: 3)
 * @param delayMs Base delay in milliseconds (default: 1500ms)
 * @param description Label for debugging logs
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1500,
  description: string = "network operation"
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit =
        error?.status === 429 ||
        error?.code === 429 ||
        (error?.message && (error.message.includes("429") || error.message.includes("rate limit") || error.message.includes("Too Many Requests")));
      const isTimeout =
        error?.status === 504 ||
        error?.code === "TIMEOUT" ||
        (error?.message && (error.message.includes("504") || error.message.includes("timeout") || error.message.includes("ECONNRESET")));

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter: delay * 2^(attempt - 1) + [0, 500ms]
      const backoff = delayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 500);
      const totalWait = backoff + jitter;

      console.warn(
        `[RetryUtils] ${description} attempt ${attempt}/${maxRetries} failed (${isRateLimit ? "429 RateLimit" : isTimeout ? "Timeout" : error?.message || "error"}). Retrying in ${totalWait}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, totalWait));
    }
  }

  throw lastError;
}

/**
 * Creates an ethers.JsonRpcProvider with graceful socket teardown.
 */
export function createSafeJsonRpcProvider(url: string): ethers.JsonRpcProvider {
  const provider = new ethers.JsonRpcProvider(url, undefined, {
    staticNetwork: true,
    batchMaxCount: 1,
  });

  return provider;
}

/**
 * Safely closes provider background keepalive sockets or timers.
 */
export function destroyProvider(provider: ethers.JsonRpcProvider | any): void {
  if (!provider) return;
  try {
    if (typeof provider.destroy === "function") {
      provider.destroy();
    }
  } catch {
    // Ignore teardown errors
  }
}
