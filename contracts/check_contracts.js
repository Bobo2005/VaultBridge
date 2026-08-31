const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);

  const streakVerifierAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const streakBadgeAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const codeVerifier = await ethers.provider.getCode(streakVerifierAddr);
  console.log(`StreakVerifier (${streakVerifierAddr}) code length: ${codeVerifier.length}`);

  const codeBadge = await ethers.provider.getCode(streakBadgeAddr);
  console.log(`StreakBadge (${streakBadgeAddr}) code length: ${codeBadge.length}`);
}

main().catch(console.error);
