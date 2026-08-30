import { ethers } from "ethers";
import { generateStreakAbsenceProof, StreakAbsenceProofResult } from "./generateStreakAbsenceProof";
import { generatePositiveProof } from "./generatePositiveProof";

export const STREAK_VERIFIER_ABI = [
  "function registerCheckIn(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 streakId, uint256 dayIndex, address user) external",
  "function breakStreakIfMissed(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 streakId, uint256 missedDayIndex) external",
  "function getStreak(bytes32 streakId) external view returns (tuple(bytes32 streakId, address user, uint256 currentCount, uint256 longestCount, uint256 lastCheckInDay, uint256 lastCheckInBlock, bool active))",
  "function streaks(bytes32 streakId) external view returns (bytes32 streakId, address user, uint256 currentCount, uint256 longestCount, uint256 lastCheckInDay, uint256 lastCheckInBlock, bool active)",
  "function isDayCheckedIn(bytes32 streakId, uint256 dayIndex) external view returns (bool)",
  "event CheckInVerified(bytes32 indexed streakId, address indexed user, uint256 indexed dayIndex, uint256 currentCount)",
  "event StreakBroken(bytes32 indexed streakId, address indexed user, uint256 indexed missedDayIndex, address breaker)",
  "event MilestoneBadgeAwarded(bytes32 indexed streakId, address indexed user, uint256 milestoneDays, uint256 tokenId)"
];

export interface SubmitStreakCheckInParams {
  streakId: string;
  dayIndex: number;
  user: string;
  txHash?: string;
  chainKey?: number;
  height?: number;
  encodedTransaction?: string;
  merkleProof?: string;
  continuityProof?: string;
}

export interface SubmitStreakBreakParams {
  streakId: string;
  missedDayIndex: number;
  chainKey?: number;
  height?: number;
  encodedTransaction?: string;
  merkleProof?: string;
  continuityProof?: string;
}

/**
 * Submits a verified positive check-in proof to StreakVerifier on Creditcoin
 */
export async function submitStreakCheckInProof(
  creditcoinRpcUrl: string,
  privateKey: string,
  streakVerifierAddress: string,
  params: SubmitStreakCheckInParams
): Promise<any> {
  const provider = new ethers.JsonRpcProvider(creditcoinRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(streakVerifierAddress, STREAK_VERIFIER_ABI, wallet);

  const chainKey = params.chainKey ?? 1;
  const height = params.height ?? 1000;
  const encodedTransaction = params.encodedTransaction ?? "0x";
  const merkleProof = params.merkleProof ?? "0x";
  const continuityProof = params.continuityProof ?? "0x";

  console.log(`[StreakSubmission] Submitting positive check-in for streak ${params.streakId} (day ${params.dayIndex}) to Creditcoin...`);

  const tx = await contract.registerCheckIn(
    chainKey,
    height,
    encodedTransaction,
    merkleProof,
    continuityProof,
    params.streakId,
    params.dayIndex,
    params.user
  );

  const receipt = await tx.wait();
  console.log(`[StreakSubmission] Check-in verified on Creditcoin in tx ${receipt.hash}`);
  return receipt;
}

/**
 * Submits a verified absence proof to break a streak on Creditcoin
 */
export async function submitStreakAbsenceBreakProof(
  creditcoinRpcUrl: string,
  privateKey: string,
  streakVerifierAddress: string,
  params: SubmitStreakBreakParams
): Promise<any> {
  const provider = new ethers.JsonRpcProvider(creditcoinRpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(streakVerifierAddress, STREAK_VERIFIER_ABI, wallet);

  const chainKey = params.chainKey ?? 1;
  const height = params.height ?? 1050;
  const encodedTransaction = params.encodedTransaction ?? "0x";
  const merkleProof = params.merkleProof ?? "0x";
  const continuityProof = params.continuityProof ?? "0x";

  console.log(`[StreakSubmission] Submitting absence break proof for streak ${params.streakId} (missed day ${params.missedDayIndex}) to Creditcoin...`);

  const tx = await contract.breakStreakIfMissed(
    chainKey,
    height,
    encodedTransaction,
    merkleProof,
    continuityProof,
    params.streakId,
    params.missedDayIndex
  );

  const receipt = await tx.wait();
  console.log(`[StreakSubmission] Streak broken on Creditcoin in tx ${receipt.hash}`);
  return receipt;
}
