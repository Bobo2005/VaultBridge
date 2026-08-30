import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function main() {
  console.log("Deploying VaultLending to Creditcoin USC testnet...");

  // Get network configuration
  const creditcoinRpcUrl = process.env.CREDITCOIN_RPC_URL || "";
  if (!creditcoinRpcUrl) {
    throw new Error("CREDITCOIN_RPC_URL is not set in .env file");
  }

  // Deploy MockERC20 token for testing
  // In production, this would be a real token like cUSDC
  const MockERC20 = await ethers.getContractFactory("src/creditcoin/MockERC20.sol:MockERC20");
  const mockERC20 = await MockERC20.deploy("Mock Token", "MTK", 18);
  await mockERC20.deployed();

  console.log("MockERC20 deployed to:", mockERC20.address);

  // Now deploy VaultLending with the mock ERC20 address
  const VaultLending = await ethers.getContractFactory("src/creditcoin/VaultLending.sol:VaultLending");
  const vaultLending = await VaultLending.deploy(mockERC20.address);
  await vaultLending.deployed();

  console.log("VaultLending deployed to:", vaultLending.address);

  // Also mint some tokens to the deployer for testing (though constructor already mints)
  const deployer = await ethers.getSigner();
  const balance = await mockERC20.balanceOf(deployer.address);
  console.log(`Deployer MTK balance: ${ethers.utils.formatEther(balance)}`);

  // Save addresses to a temporary file for use in other scripts
  const fs = require("fs");
  const addresses = {
    mockERC20: mockERC20.address,
    vaultLending: vaultLending.address,
    network: "creditcoin_usc_testnet",
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    `${__dirname}/../deployed_addresses.json`,
    JSON.stringify(addresses, null, 2)
  );
  console.log("Addresses saved to deployed_addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});