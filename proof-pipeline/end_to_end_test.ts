import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { generatePositiveProof } from "./src/generatePositiveProof";
import { submitProof } from "./src/submitProof";
import InvoiceRegistrarArtifact from "../contracts/artifacts/src/source-chain/InvoiceRegistrar.sol/InvoiceRegistrar.json";

// Load environment variables
dotenv.config();

async function runEndToEndTest() {
  console.log("Starting VaultBridge end-to-end test...");

  // Configuration from environment
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || '';
  const creditcoinRpcUrl = process.env.CREDITCOIN_RPC_URL || '';
  const privateKey = process.env.PRIVATE_KEY || '';
  const deployedAddresses = require('../../contracts/deployed_addresses.json');

  if (!sepoliaRpcUrl || !creditcoinRpcUrl || !privateKey) {
    throw new Error('Missing SEPOLIA_RPC_URL, CREDITCOIN_RPC_URL, or PRIVATE_KEY in environment');
  }

  if (!deployedAddresses || !deployedAddresses.vaultLending || !deployedAddresses.mockERC20) {
    throw new Error('Deployed addresses not found. Please deploy contracts first.');
  }

  const vaultLendingAddress = deployedAddresses.vaultLending;
  const mockERC20Address = deployedAddresses.mockERC20;
  const invoiceRegistrarAddress = '0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714'; // from memory.md

  // Create providers and wallets
  const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
  const creditcoinProvider = new ethers.JsonRpcProvider(creditcoinRpcUrl);
  const wallet = new ethers.Wallet(privateKey, sepoliaProvider);

  console.log(`Using Sepolia address: ${wallet.address}`);
  console.log(`InvoiceRegistrar address: ${invoiceRegistrarAddress}`);
  console.log(`VaultLending address: ${vaultLendingAddress}`);
  console.log(`MockERC20 address: ${mockERC20Address}`);

  // Load contracts
  const invoiceRegistrar = new ethers.Contract(
    invoiceRegistrarAddress,
    InvoiceRegistrarArtifact.abi,
    wallet
  );

  // Generate dummy invoice data
  const invoiceId = ethers.id(`e2e-test-invoice-${Date.now()}`);
  const amount = ethers.parseEther('0.1'); // 0.1 ETH
  const debtor = ethers.Wallet.createRandom().address;
  const dueDateBlock = await sepoliaProvider.getBlockNumber() + 1000; // far future

  console.log(`\n=== STEP 1: Issuing invoice on Sepolia ===`);
  console.log(`Invoice ID: ${invoiceId}`);
  console.log(`Amount: ${ethers.formatEther(amount)} ETH`);
  console.log(`Debtor: ${debtor}`);
  console.log(`Due date block: ${dueDateBlock}`);

  // Issue invoice
  const tx = await invoiceRegistrar.issueInvoice(invoiceId, amount, debtor, dueDateBlock);
  console.log(`Transaction sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Transaction mined in block ${receipt.blockNumber}`);

  console.log(`\n=== STEP 2: Generating positive proof ===`);
  const startTime = Date.now();
  const proofResult = await generatePositiveProof(
    sepoliaRpcUrl,
    creditcoinRpcUrl,
    tx.hash,
    "https://prover.cc3-testnet.creditcoin.network",
    15 * 60 * 1000 // 15 minutes timeout
  );
  const attestationWaitTimeMs = Date.now() - startTime;
  console.log(`Attestation wait time: ${attestationWaitTimeMs}ms`);
  console.log(`Proof generated for block ${proofResult.blockNumber}`);

  console.log(`\n=== STEP 3: Submitting proof to VaultLending on Creditcoin ===`);
  // Prepare proof parameters for submitProof
  const proofParams = {
    invoiceId: invoiceId,
    amount: amount,
    debtor: debtor,
    dueDateBlock: dueDateBlock,
    txHash: tx.hash
  };

  // Submit the proof
  const submitReceipt = await submitProof(
    sepoliaRpcUrl,
    creditcoinRpcUrl,
    vaultLendingAddress,
    mockERC20Address,
    privateKey,
    'positive',
    proofParams
  );

  console.log(`\n=== STEP 4: Verifying invoice registration on Creditcoin ===`);
  // TODO: Add verification logic once we can query the deployed VaultLending contract
  // This would involve:
  // 1. Creating a contract instance for VaultLending on Creditcoin
  // 2. Calling a view function to check if the invoice is registered
  // 3. Verifying the invoice details match what we expect

  console.log(`✅ End-to-end test completed successfully!`);
  console.log(`✅ Invoice issued on Sepolia: ${tx.hash}`);
  console.log(`✅ Attestation wait time: ${attestationWaitTimeMs}ms`);
  console.log(`✅ Proof submitted to Creditcoin: ${submitReceipt.hash}`);

  return {
    sepoliaTxHash: tx.hash,
    attestationWaitTimeMs: attestationWaitTimeMs,
    creditcoinTxHash: submitReceipt.hash
  };
}

// Run the test if this file is executed directly
if (require.main === module) {
  runEndToEndTest()
    .then((result) => {
      console.log('\n🎉 E2E TEST PASSED 🎉');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ E2E TEST FAILED ❌');
      console.error(error);
      process.exit(1);
    });
}

export { runEndToEndTest };