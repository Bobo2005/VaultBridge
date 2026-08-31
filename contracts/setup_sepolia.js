const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("Checking Ethereum Sepolia On-Chain Environment");
  console.log("Deployer / Signer:", signer.address);
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Native Sepolia ETH Balance:", ethers.utils.formatEther(balance));
  console.log("==================================================");

  // 1. InvoiceRegistrar
  console.log("\n1. Deploying InvoiceRegistrar on Sepolia...");
  const InvoiceRegistrar = await ethers.getContractFactory("InvoiceRegistrar");
  const invoiceRegistrar = await InvoiceRegistrar.deploy();
  await invoiceRegistrar.deployed();
  console.log("-> InvoiceRegistrar deployed to:", invoiceRegistrar.address);

  // 2. StreakRegistry
  console.log("\n2. Deploying StreakRegistry on Sepolia...");
  const StreakRegistry = await ethers.getContractFactory("StreakRegistry");
  const streakRegistry = await StreakRegistry.deploy();
  await streakRegistry.deployed();
  console.log("-> StreakRegistry deployed to:", streakRegistry.address);

  console.log("\n==================================================");
  console.log("SEPOLIA TESTNET DEPLOYMENT SUMMARY:");
  console.log("InvoiceRegistrar:", invoiceRegistrar.address);
  console.log("StreakRegistry:", streakRegistry.address);
  console.log("==================================================");
}

main().catch(console.error);
