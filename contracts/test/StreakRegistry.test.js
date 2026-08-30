const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StreakRegistry (Milestone S1)", function () {
  let streakRegistry;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const StreakRegistry = await ethers.getContractFactory("StreakRegistry");
    streakRegistry = await StreakRegistry.deploy();
    await streakRegistry.deployed();
  });

  it("should create a streak successfully with StreakCreated event", async function () {
    const streakId = ethers.utils.id("streak-workout-2026");
    const tx = await streakRegistry.connect(user1).createStreak(streakId, "Daily Pushups 100");
    const receipt = await tx.wait();

    const streakData = await streakRegistry.streaks(streakId);
    expect(streakData.owner).to.equal(user1.address);
    expect(streakData.title).to.equal("Daily Pushups 100");
    expect(streakData.active).to.be.true;

    // Check event emission
    const event = receipt.events.find((e) => e.event === "StreakCreated");
    expect(event).to.not.be.undefined;
    expect(event.args.streakId).to.equal(streakId);
    expect(event.args.creator).to.equal(user1.address);
  });

  it("should allow normal check-in and emit CheckedIn event", async function () {
    const streakId = ethers.utils.id("streak-solidity-100");
    await streakRegistry.connect(user1).createStreak(streakId, "100 Days of Solidity");

    const tx = await streakRegistry.connect(user1).checkIn(streakId);
    const receipt = await tx.wait();

    const event = receipt.events.find((e) => e.event === "CheckedIn");
    expect(event).to.not.be.undefined;
    expect(event.args.streakId).to.equal(streakId);
    expect(event.args.dayIndex).to.equal(0);

    const checkedIn = await streakRegistry.isCheckedIn(streakId, 0);
    expect(checkedIn).to.be.true;
  });

  it("should REJECT duplicate check-in on the same day", async function () {
    const streakId = ethers.utils.id("streak-duplicate-test");
    await streakRegistry.connect(user1).createStreak(streakId, "Daily Reading");

    // First check-in succeeds
    await streakRegistry.connect(user1).checkIn(streakId);

    // Second check-in on the same day must revert
    await expect(
      streakRegistry.connect(user1).checkIn(streakId)
    ).to.be.revertedWith("StreakRegistry: Already checked in today");
  });

  it("should allow check-in on consecutive days after advancing time", async function () {
    const streakId = ethers.utils.id("streak-consecutive-test");
    await streakRegistry.connect(user1).createStreak(streakId, "Meditate Daily");

    // Day 0 Check-in
    await streakRegistry.connect(user1).checkIn(streakId);
    expect(await streakRegistry.isCheckedIn(streakId, 0)).to.be.true;

    // Advance EVM time by 1 day (86,400 seconds)
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine");

    // Day 1 Check-in succeeds
    const tx2 = await streakRegistry.connect(user1).checkIn(streakId);
    const receipt2 = await tx2.wait();
    const event2 = receipt2.events.find((e) => e.event === "CheckedIn");
    expect(event2.args.dayIndex).to.equal(1);

    expect(await streakRegistry.isCheckedIn(streakId, 1)).to.be.true;
  });

  it("should auto-register a streak if checked in directly", async function () {
    const streakId = ethers.utils.id("streak-direct-checkin");
    const tx = await streakRegistry.connect(user2).checkIn(streakId);
    const receipt = await tx.wait();

    const streakData = await streakRegistry.streaks(streakId);
    expect(streakData.owner).to.equal(user2.address);
    expect(streakData.active).to.be.true;
    expect(await streakRegistry.isCheckedIn(streakId, 0)).to.be.true;
  });
});
