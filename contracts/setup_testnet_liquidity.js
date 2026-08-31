const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("Setting up Creditcoin Testnet On-Chain Environment");
  console.log("Deployer / Signer:", signer.address);
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Native CTC Balance:", ethers.utils.formatEther(balance));
  console.log("==================================================");

  // 1. MockERC20 & VaultLending
  const mockERC20Addr = "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714";
  const vaultLendingAddr = "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5";

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockERC20 = MockERC20.attach(mockERC20Addr);

  console.log("1. Funding VaultLending contract with MockUSDC liquidity...");
  const fundAmount = ethers.utils.parseUnits("1000000", 18); // 1,000,000 USDC
  const mintTx = await mockERC20.mint(vaultLendingAddr, fundAmount);
  await mintTx.wait();
  console.log("-> Minted 1,000,000 MockUSDC to VaultLending:", vaultLendingAddr);

  // Mint tokens to deployer
  const deployerMintTx = await mockERC20.mint(signer.address, ethers.utils.parseUnits("100000", 18));
  await deployerMintTx.wait();
  console.log("-> Minted 100,000 MockUSDC to Deployer:", signer.address);

  // Verify balances
  const vaultBal = await mockERC20.balanceOf(vaultLendingAddr);
  console.log("-> Verified VaultLending MockUSDC Balance:", ethers.utils.formatUnits(vaultBal, 18), "USDC");

  // 2. Deploy AccessRegistry
  console.log("\n2. Deploying AccessRegistry on Creditcoin Testnet...");
  const AccessRegistry = await ethers.getContractFactory("AccessRegistry");
  const accessRegistry = await AccessRegistry.deploy();
  await accessRegistry.deployed();
  console.log("-> AccessRegistry deployed to:", accessRegistry.address);

  // 3. Deploy StreakBadge & StreakVerifier
  console.log("\n3. Deploying StreakBadge & StreakVerifier on Creditcoin Testnet...");
  const StreakBadge = await ethers.getContractFactory("StreakBadge");
  const streakBadge = await StreakBadge.deploy();
  await streakBadge.deployed();
  console.log("-> StreakBadge deployed to:", streakBadge.address);

  const verifierPrecompile = "0x0000000000000000000000000000000000000FD2";
  const StreakVerifier = await ethers.getContractFactory("StreakVerifier");
  const streakVerifier = await StreakVerifier.deploy(verifierPrecompile, streakBadge.address);
  await streakVerifier.deployed();
  console.log("-> StreakVerifier deployed to:", streakVerifier.address);

  // Authorize StreakVerifier
  const authTx = await streakBadge.setMinterStatus(streakVerifier.address, true);
  await authTx.wait();
  console.log("-> StreakVerifier authorized to mint StreakBadges");

  console.log("\n==================================================");
  console.log("CREDITCOIN TESTNET DEPLOYMENT SUMMARY:");
  console.log("MockERC20 (USDC):", mockERC20Addr);
  console.log("VaultLending:", vaultLendingAddr);
  console.log("AccessRegistry:", accessRegistry.address);
  console.log("StreakBadge:", streakBadge.address);
  console.log("StreakVerifier:", streakVerifier.address);
  console.log("==================================================");
}

main().catch(console.error);
