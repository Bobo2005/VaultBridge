require('dotenv').config();

import { ethers } from 'ethers';
import { getSepoliaChainKey } from '../src/chainInfo';
import { generatePositiveProof } from '../src/generatePositiveProof';
import InvoiceRegistrarArtifact from '../../contracts/artifacts/src/source-chain/InvoiceRegistrar.sol/InvoiceRegistrar.json';
import { strict as assert } from 'assert';

// Test configuration
const sepoliaRpc = process.env.SEPOLIA_RPC_URL || '';
const privateKey = process.env.PRIVATE_KEY || '';
const creditcoinRpc = process.env.CREDITCOIN_RPC_URL || '';
const proofBuilderUrl = process.env.CREDITCOIN_PROOF_BUILDER_URL || '';
const invoiceRegistrarAddress = '0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714'; // from memory.md

if (!sepoliaRpc || !privateKey || !creditcoinRpc || !proofBuilderUrl) {
  throw new Error('Missing SEPOLIA_RPC_URL, PRIVATE_KEY, CREDITCOIN_RPC_URL, or CREDITCOIN_PROOF_BUILDER_URL in environment');
}

async function runIsolationTest() {
  console.log('Starting proof pipeline isolation test...');

  const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRpc);
  const creditcoinProvider = new ethers.JsonRpcProvider(creditcoinRpc);
  const wallet = new ethers.Wallet(privateKey, sepoliaProvider);
  const invoiceRegistrar = new ethers.Contract(
    invoiceRegistrarAddress,
    InvoiceRegistrarArtifact.abi,
    wallet
  );

  // Generate dummy invoice data
  const invoiceId = ethers.id(`dummy-invoice-${Date.now()}`);
  const amount = ethers.parseEther('0.1'); // 0.1 ETH
  const debtor = ethers.Wallet.createRandom().address;
  const dueDateBlock = await sepoliaProvider.getBlockNumber() + 1000; // far future

  console.log('Issuing dummy invoice...');
  const tx = await invoiceRegistrar.issueInvoice(invoiceId, amount, debtor, dueDateBlock);
  console.log(`Transaction sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Transaction mined in block ${receipt.blockNumber}`);

  // Generate positive proof with extended timeout (15 minutes) to capture actual attestation time
  console.log('Generating positive proof...');
  const startTime = Date.now();
  const result = await generatePositiveProof(
    sepoliaRpc,
    creditcoinRpc,
    tx.hash,
    proofBuilderUrl,
    15 * 60 * 1000 // 15 minutes timeout
  );
  const attestationWaitTimeMs = Date.now() - startTime;

  console.log(`Attestation wait time: ${attestationWaitTimeMs}ms`);
  console.log(`Proof generated for block ${result.blockNumber}`);

  // Basic assertions
  assert.ok(result, 'Result should be defined');
  assert.ok(result.proof, 'Proof should be defined');
  assert.strictEqual(result.txHash, tx.hash, 'Transaction hash should match');
  assert.strictEqual(result.blockNumber, receipt.blockNumber, 'Block number should match');
  assert.ok(result.attestationWaitTimeMs > 0, 'Attestation wait time should be greater than 0');

  console.log('✅ Isolation test passed!');
  return {
    attestationWaitTimeMs,
    blockNumber: result.blockNumber,
    txHash: tx.hash
  };
}

describe('Proof Pipeline Isolation Test', () => {
  it('should run proof pipeline isolation test', async () => {
    await runIsolationTest();
  }, 15 * 60 * 1000);
});

// Run the test if this file is executed directly
if (require.main === module) {
  runIsolationTest().catch((error) => {
    console.error('❌ Isolation test failed:', error);
    process.exit(1);
  });
}