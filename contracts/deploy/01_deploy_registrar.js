require('dotenv').config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying InvoiceRegistrar to Sepolia...");

  // We get the contract to deploy
  const InvoiceRegistrar = await hre.ethers.getContractFactory("src/source-chain/InvoiceRegistrar.sol:InvoiceRegistrar");
  const invoiceRegistrar = await InvoiceRegistrar.deploy();

  await invoiceRegistrar.deployed();

  console.log("InvoiceRegistrar deployed to:", invoiceRegistrar.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
