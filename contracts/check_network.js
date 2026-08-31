const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  if (!signer) {
    console.log("No signer found in config");
    return;
  }
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  const network = await ethers.provider.getNetwork();
  const format = ethers.utils ? ethers.utils.formatEther : ethers.formatEther;
  console.log(`Network: ${network.name} (ChainID: ${network.chainId})`);
  console.log(`Signer Address: ${address}`);
  console.log(`Native Balance: ${format(balance)}`);
}

main().catch(console.error);
