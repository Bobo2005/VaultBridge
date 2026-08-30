import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AccessRegistry...");
  const AccessRegistry = await ethers.getContractFactory("AccessRegistry");
  const accessRegistry = await AccessRegistry.deploy();
  await accessRegistry.waitForDeployment();
  console.log("AccessRegistry deployed to:", await accessRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
