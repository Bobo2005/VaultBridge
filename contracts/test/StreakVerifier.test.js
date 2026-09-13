const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StreakVerifier & StreakBadge (Milestone S3)", function () {
  let streakVerifier, streakBadge, mockVerifier;
  let owner, user1, user2, hunter;

  beforeEach(async function () {
    [owner, user1, user2, hunter] = await ethers.getSigners();

    // Deploy Mock Precompile
    const MockPrecompile = await ethers.getContractFactory("MockStreakPrecompile");
    mockVerifier = await MockPrecompile.deploy();
    await mockVerifier.deployed();

    // Deploy StreakBadge NFT
    const StreakBadge = await ethers.getContractFactory("StreakBadge");
    streakBadge = await StreakBadge.deploy();
    await streakBadge.deployed();

    // Deploy StreakVerifier
    const StreakVerifier = await ethers.getContractFactory("StreakVerifier");
    streakVerifier = await StreakVerifier.deploy(mockVerifier.address, streakBadge.address);
    await streakVerifier.deployed();

    // Authorize StreakVerifier to mint badges
    await streakBadge.setMinterStatus(streakVerifier.address, true);
  });

  it("should successfully verify positive check-in and increment streak count", async function () {
    const streakId = ethers.utils.id("streak-workout-100");

    const tx = await streakVerifier.connect(user1).registerCheckIn(
      1,
      1000,
      "0x",
      "0x",
      "0x",
      streakId,
      0, // day 0
      user1.address
    );
    const receipt = await tx.wait();

    const event = receipt.events.find((e) => e.event === "CheckInVerified");
    expect(event).to.not.be.undefined;
    expect(event.args.streakId).to.equal(streakId);
    expect(event.args.user).to.equal(user1.address);
    expect(event.args.dayIndex).to.equal(0);
    expect(event.args.currentCount).to.equal(1);

    const state = await streakVerifier.getStreak(streakId);
    expect(state.active).to.be.true;
    expect(state.currentCount).to.equal(1);
    expect(state.longestCount).to.equal(1);
    expect(state.lastCheckInDay).to.equal(0);
  });

  it("should increment streak on consecutive days", async function () {
    const streakId = ethers.utils.id("streak-consecutive");

    // Day 0
    await streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address);

    // Day 1
    await streakVerifier.registerCheckIn(1, 1010, "0x", "0x", "0x", streakId, 1, user1.address);

    const state = await streakVerifier.getStreak(streakId);
    expect(state.currentCount).to.equal(2);
    expect(state.longestCount).to.equal(2);
    expect(state.lastCheckInDay).to.equal(1);
  });

  it("should REJECT duplicate check-in on the same day", async function () {
    const streakId = ethers.utils.id("streak-duplicate-prevention");

    await streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address);

    await expect(
      streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address)
    ).to.be.revertedWith("StreakVerifier: Day already checked in");
  });

  it("should successfully break streak on a real missed day (permissionlessly by hunter)", async function () {
    const streakId = ethers.utils.id("streak-break-test");

    // User checks in on day 0
    await streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address);
    let state = await streakVerifier.getStreak(streakId);
    expect(state.currentCount).to.equal(1);

    // Bounty hunter proves day 1 was missed with absence proof
    const tx = await streakVerifier.connect(hunter).breakStreakIfMissed(
      1,
      1050,
      "0x",
      "0x",
      "0x",
      streakId,
      1 // missed day 1
    );
    const receipt = await tx.wait();

    const event = receipt.events.find((e) => e.event === "StreakBroken");
    expect(event).to.not.be.undefined;
    expect(event.args.streakId).to.equal(streakId);
    expect(event.args.user).to.equal(user1.address);
    expect(event.args.missedDayIndex).to.equal(1);
    expect(event.args.breaker).to.equal(hunter.address);

    state = await streakVerifier.getStreak(streakId);
    expect(state.currentCount).to.equal(0);
    expect(state.longestCount).to.equal(1); // Longest streak preserved
  });

  it("should BLOCK break attempt when check-in actually exists for that day", async function () {
    const streakId = ethers.utils.id("streak-blocked-break");

    // User checks in on day 0
    await streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address);

    // Attemping to break on day 0 must revert because check-in exists
    await expect(
      streakVerifier.connect(hunter).breakStreakIfMissed(
        1,
        1000,
        "0x",
        "0x",
        "0x",
        streakId,
        0 // Day 0 actually has check-in
      )
    ).to.be.revertedWith("StreakVerifier: Check-in exists for this day");
  });

  it("should award milestone NFT badges when reaching 7, 30, and 100 days", async function () {
    const streakId = ethers.utils.id("streak-milestone-thresholds");

    // Fast-forward 7 daily check-ins -> Milestone 7
    for (let day = 0; day < 7; day++) {
      await streakVerifier.registerCheckIn(
        1,
        1000 + day * 10,
        "0x",
        "0x",
        "0x",
        streakId,
        day,
        user1.address
      );
    }
    expect(await streakBadge.balanceOf(user1.address)).to.equal(1);

    // Fast-forward to day 30 -> Milestone 30
    for (let day = 7; day < 30; day++) {
      await streakVerifier.registerCheckIn(
        1,
        1000 + day * 10,
        "0x",
        "0x",
        "0x",
        streakId,
        day,
        user1.address
      );
    }
    expect(await streakBadge.balanceOf(user1.address)).to.equal(2);

    // Assert that the user cannot transfer their earned milestone badge to user2
    await expect(
      streakBadge.connect(user1).transferFrom(user1.address, user2.address, 0)
    ).to.be.revertedWith("StreakBadge: Soulbound badge is non-transferable");
  });

  it("should succeed for border check-ins at 23:59:45 UTC without causing duplicate reverts or broken streaks", async function () {
    const streakId = ethers.utils.id("streak-border-transition");

    // Day 0 Check-In at 12:00:00 UTC
    await streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address);
    let state = await streakVerifier.getStreak(streakId);
    expect(state.currentCount).to.equal(1);
    expect(state.lastCheckInDay).to.equal(0);

    // Day 1 Check-In occurring near midnight boundary (e.g. 23:59:45 UTC)
    await streakVerifier.registerCheckIn(1, 1050, "0x", "0x", "0x", streakId, 1, user1.address);
    state = await streakVerifier.getStreak(streakId);
    expect(state.currentCount).to.equal(2);
    expect(state.lastCheckInDay).to.equal(1);

    // Verify duplicate check-in on Day 1 is still strictly blocked
    await expect(
      streakVerifier.registerCheckIn(1, 1051, "0x", "0x", "0x", streakId, 1, user1.address)
    ).to.be.revertedWith("StreakVerifier: Day already checked in");

    // Consecutive Day 2 succeeds smoothly
    await streakVerifier.registerCheckIn(1, 1100, "0x", "0x", "0x", streakId, 2, user1.address);
    state = await streakVerifier.getStreak(streakId);
    expect(state.currentCount).to.equal(3);
    expect(state.lastCheckInDay).to.equal(2);
  });

  it("should BLOCK premature future day slashing", async function () {
    const streakId = ethers.utils.id("streak-premature-slashing");
    await streakVerifier.registerCheckIn(1, 1000, "0x", "0x", "0x", streakId, 0, user1.address);

    // Attempting to slash day 5 when user is only at day 0 must revert
    await expect(
      streakVerifier.connect(hunter).breakStreakIfMissed(
        1,
        1200,
        "0x",
        "0x",
        "0x",
        streakId,
        5
      )
    ).to.be.revertedWith("StreakVerifier: Premature future day slashing");
  });
});
