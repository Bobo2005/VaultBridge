const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("Minting Massive MockUSDC Liquidity on Creditcoin");
  console.log("Signer / Admin:", signer.address);
  console.log("==================================================");

  const mockERC20Addr = "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714";
  const vaultLendingAddr = "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5";
  const userTestAddress = "0xe5Fa8f2f4152b51a4Ef9659D8f9b7811a17C9676";

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = MockERC20.attach(mockERC20Addr);

  // 1. Mint 50,000,000 MockUSDC to VaultLending Pool
  console.log("1. Minting 50,000,000 MockUSDC to VaultLending Contract...");
  const poolAmount = ethers.utils.parseUnits("50000000", 18);
  const tx1 = await mockERC20.mint(vaultLendingAddr, poolAmount);
  await tx1.wait();
  console.log("✓ Minted 50,000,000 MockUSDC to VaultLending:", vaultLendingAddr);

  // 2. Mint 5,000,000 MockUSDC to Deployer
  console.log("2. Minting 5,000,000 MockUSDC to Admin / Deployer...");
  const adminAmount = ethers.utils.parseUnits("5000000", 18);
  const tx2 = await mockERC20.mint(signer.address, adminAmount);
  await tx2.wait();
  console.log("✓ Minted 5,000,000 MockUSDC to Deployer:", signer.address);

  // 3. Mint 5,000,000 MockUSDC to User Test Address
  console.log("3. Minting 5,000,000 MockUSDC to User Test Address...");
  const userAmount = ethers.utils.parseUnits("5000000", 18);
  const tx3 = await mockERC20.mint(userTestAddress, userAmount);
  await tx3.wait();
  console.log("✓ Minted 5,000,000 MockUSDC to User Address:", userTestAddress);

  // 4. Verify on-chain pool balance
  const vaultBal = await mockERC20.balanceOf(vaultLendingAddr);
  console.log("==================================================");
  console.log("TOTAL VAULTLENDING POOL BALANCE:", ethers.utils.formatUnits(vaultBal, 18), "USDC");
  console.log("==================================================");
}

main().catch(console.error);
