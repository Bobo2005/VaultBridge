import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import {
  submitStreakCheckInProof,
  submitStreakAbsenceBreakProof,
  STREAK_VERIFIER_ABI,
} from "../src/submitStreakProof";
import { generateStreakAbsenceProof } from "../src/generateStreakAbsenceProof";

describe("StreakChain Full End-to-End Integration (Milestones S1–S3)", () => {
  let userWallet: any;
  let hunterWallet: any;

  const streakId = ethers.id(`e2e-streak-${Date.now()}`);

  // Mock contract simulating Creditcoin StreakVerifier state
  let streakState = {
    streakId,
    user: "",
    currentCount: 0,
    longestCount: 0,
    lastCheckInDay: 0,
    lastCheckInBlock: 0,
    active: false,
  };

  const checkedInDays = new Set<number>();

  const mockCreditcoinVerifier = {
    registerCheckIn: jest.fn().mockImplementation(
      async (chainKey, height, txBytes, merkle, continuity, id, day, user) => {
        if (!streakState.active) {
          streakState.active = true;
          streakState.streakId = id;
          streakState.user = user;
        }

        if (checkedInDays.has(day)) {
          throw new Error("StreakVerifier: Day already checked in");
        }
        checkedInDays.add(day);

        if (streakState.currentCount === 0) {
          streakState.currentCount = 1;
        } else if (day === streakState.lastCheckInDay + 1) {
          streakState.currentCount += 1;
        }

        streakState.lastCheckInDay = day;
        streakState.lastCheckInBlock = height;
        if (streakState.currentCount > streakState.longestCount) {
          streakState.longestCount = streakState.currentCount;
        }

        return {
          hash: "0xcreditcoin_tx_checkin_hash_12345",
          wait: async () => ({ hash: "0xcreditcoin_tx_checkin_hash_12345", status: 1 }),
        };
      }
    ),
    breakStreakIfMissed: jest.fn().mockImplementation(
      async (chainKey, height, txBytes, merkle, continuity, id, missedDay) => {
        if (!streakState.active || streakState.currentCount === 0) {
          throw new Error("StreakVerifier: Streak already at zero");
        }
        if (checkedInDays.has(missedDay)) {
          throw new Error("StreakVerifier: Check-in exists for this day");
        }

        streakState.currentCount = 0;

        return {
          hash: "0xcreditcoin_tx_break_hash_67890",
          wait: async () => ({ hash: "0xcreditcoin_tx_break_hash_67890", status: 1 }),
        };
      }
    ),
    getStreak: jest.fn().mockImplementation(async () => streakState),
  };

  beforeAll(() => {
    userWallet = ethers.Wallet.createRandom();
    hunterWallet = ethers.Wallet.createRandom();
    streakState.user = userWallet.address;
  });

  it("Step 1: Check in on Day 0 and confirm currentCount = 1 on Creditcoin", async () => {
    console.log(`[E2E] Step 1: Submitting Day 0 check-in for streak ${streakId}...`);

    const receipt = await mockCreditcoinVerifier.registerCheckIn(
      1,
      1000,
      "0x",
      "0x",
      "0x",
      streakId,
      0,
      userWallet.address
    );
    const tx = await receipt.wait();
    expect(tx.status).toBe(1);

    const state = await mockCreditcoinVerifier.getStreak(streakId);
    expect(state.active).toBe(true);
    expect(state.currentCount).toBe(1);
    expect(state.longestCount).toBe(1);
    expect(state.lastCheckInDay).toBe(0);
    console.log(`[E2E] Step 1 Passed: currentCount = ${state.currentCount}`);
  });

  it("Step 2: Check in on consecutive Day 1 and confirm currentCount = 2 on Creditcoin", async () => {
    console.log(`[E2E] Step 2: Submitting Day 1 check-in...`);

    const receipt = await mockCreditcoinVerifier.registerCheckIn(
      1,
      1050,
      "0x",
      "0x",
      "0x",
      streakId,
      1,
      userWallet.address
    );
    const tx = await receipt.wait();
    expect(tx.status).toBe(1);

    const state = await mockCreditcoinVerifier.getStreak(streakId);
    expect(state.currentCount).toBe(2);
    expect(state.longestCount).toBe(2);
    expect(state.lastCheckInDay).toBe(1);
    console.log(`[E2E] Step 2 Passed: consecutive currentCount = ${state.currentCount}`);
  });

  it("Step 3: Confirm break attempt on a checked-in day (Day 1) is blocked/reverted while active", async () => {
    console.log(`[E2E] Step 3: Verifying break attempt on checked-in Day 1 fails...`);

    await expect(
      mockCreditcoinVerifier.breakStreakIfMissed(
        1,
        1050,
        "0x",
        "0x",
        "0x",
        streakId,
        1 // Day 1 was actually checked in!
      )
    ).rejects.toThrow(/StreakVerifier: Check-in exists for this day/);

    console.log(`[E2E] Step 3 Passed: Invalid break attempt successfully rejected!`);
  });

  it("Step 4: Simulate missed Day 2, generate absence proof, and break streak", async () => {
    console.log(`[E2E] Step 4: Generating absence proof for missed Day 2...`);

    // Mock contract with 0 check-ins on Day 2
    const mockSepoliaContract = {
      filters: { CheckedIn: jest.fn().mockReturnValue({}) },
      queryFilter: jest.fn().mockResolvedValue([]),
    };

    const absenceProof = await generateStreakAbsenceProof(
      "https://rpc.sepolia.org",
      "https://rpc.cc3-testnet.creditcoin.network",
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      streakId,
      2, // missed Day 2
      1100,
      1150,
      "https://prover.cc3-testnet.creditcoin.network",
      1000,
      mockSepoliaContract
    );

    expect(absenceProof.success).toBe(true);
    expect(absenceProof.dayIndex).toBe(2);

    console.log(`[E2E] Step 4: Submitting absence break proof to Creditcoin...`);
    const breakReceipt = await mockCreditcoinVerifier.breakStreakIfMissed(
      absenceProof.chainKey,
      absenceProof.headerNumber,
      absenceProof.txBytes,
      absenceProof.merkleProof.root,
      absenceProof.continuityProof,
      streakId,
      2
    );
    const breakTx = await breakReceipt.wait();
    expect(breakTx.status).toBe(1);

    const stateAfterBreak = await mockCreditcoinVerifier.getStreak(streakId);
    expect(stateAfterBreak.currentCount).toBe(0); // Reset to zero!
    expect(stateAfterBreak.longestCount).toBe(2); // Longest streak preserved!
    console.log(`[E2E] Step 4 Passed: currentCount reset to 0 (longestCount preserved = 2)`);
  });
});
