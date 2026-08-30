const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StreakBadge Soulbound NFT (Milestone S3)", function () {
  let streakBadge;
  let owner, user1, user2, unauthorized;

  beforeEach(async function () {
    [owner, user1, user2, unauthorized] = await ethers.getSigners();

    const StreakBadge = await ethers.getContractFactory("StreakBadge");
    streakBadge = await StreakBadge.deploy();
    await streakBadge.deployed();
  });

  it("should allow owner/authorized minter to mint milestone badges", async function () {
    const streakId = ethers.utils.id("streak-reading-30");

    const tx = await streakBadge.mintMilestoneBadge(user1.address, streakId, 7);
    const receipt = await tx.wait();

    const event = receipt.events.find((e) => e.event === "MilestoneBadgeMinted");
    expect(event).to.not.be.undefined;
    expect(event.args.recipient).to.equal(user1.address);
    expect(event.args.tokenId).to.equal(0);
    expect(event.args.milestoneDays).to.equal(7);

    expect(await streakBadge.balanceOf(user1.address)).to.equal(1);
    expect(await streakBadge.ownerOf(0)).to.equal(user1.address);

    const info = await streakBadge.badgeInfo(0);
    expect(info.recipient).to.equal(user1.address);
    expect(info.milestoneDays).to.equal(7);
  });

  it("should REVERT if unauthorized account attempts to mint", async function () {
    const streakId = ethers.utils.id("streak-unauthorized");

    await expect(
      streakBadge.connect(unauthorized).mintMilestoneBadge(user2.address, streakId, 30)
    ).to.be.revertedWith("StreakBadge: Not authorized minter");
  });

  it("should BLOCK transferFrom (Soulbound Non-Transferability)", async function () {
    const streakId = ethers.utils.id("streak-soulbound-test");

    // Mint token 0 to user1
    await streakBadge.mintMilestoneBadge(user1.address, streakId, 7);
    expect(await streakBadge.ownerOf(0)).to.equal(user1.address);

    // user1 attempts to transfer token 0 to user2 -> must revert
    await expect(
      streakBadge.connect(user1).transferFrom(user1.address, user2.address, 0)
    ).to.be.revertedWith("StreakBadge: Soulbound badge is non-transferable");
  });

  it("should BLOCK safeTransferFrom (Soulbound Non-Transferability)", async function () {
    const streakId = ethers.utils.id("streak-safetransfer-test");

    // Mint token 0 to user1
    await streakBadge.mintMilestoneBadge(user1.address, streakId, 30);

    // user1 attempts safeTransferFrom to user2 -> must revert
    await expect(
      streakBadge.connect(user1)["safeTransferFrom(address,address,uint256)"](
        user1.address,
        user2.address,
        0
      )
    ).to.be.revertedWith("StreakBadge: Soulbound badge is non-transferable");
  });
});
