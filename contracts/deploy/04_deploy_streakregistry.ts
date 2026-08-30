import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StreakRegistry on Ethereum Sepolia...");
  const StreakRegistry = await ethers.getContractFactory("StreakRegistry");
  const streakRegistry = await StreakRegistry.deploy();
  await streakRegistry.deployed();
  console.log("StreakRegistry deployed to:", streakRegistry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
