import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StreakBadge and StreakVerifier on Creditcoin USC Testnet...");

  const StreakBadge = await ethers.getContractFactory("StreakBadge");
  const streakBadge = await StreakBadge.deploy();
  await streakBadge.deployed();
  console.log("StreakBadge deployed to:", streakBadge.address);

  const verifierPrecompile = "0x0000000000000000000000000000000000000FD2";
  const StreakVerifier = await ethers.getContractFactory("StreakVerifier");
  const streakVerifier = await StreakVerifier.deploy(verifierPrecompile, streakBadge.address);
  await streakVerifier.deployed();
  console.log("StreakVerifier deployed to:", streakVerifier.address);

  // Authorize StreakVerifier to mint milestone badges
  await streakBadge.setMinterStatus(streakVerifier.address, true);
  console.log("StreakVerifier authorized on StreakBadge successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
