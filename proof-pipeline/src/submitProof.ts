import { ethers } from "ethers";
import { generatePositiveProof } from "./generatePositiveProof";
import { generateAbsenceProof } from "./generateAbsenceProof";

/**
 * Submits a proof to the VaultLending contract on Creditcoin
 * @param sepoliaRpcUrl Sepolia RPC URL
 * @param creditcoinRpcUrl Creditcoin RPC URL
 * @param vaultLendingAddress Address of the deployed VaultLending.sol contract on Creditcoin
 * @param mockERC20Address Address of the deployed mock ERC20 token on Creditcoin
 * @param privateKey Private key for signing transactions
 * @param proofType Type of proof to submit: 'positive' or 'absence'
 * @param proofParams Parameters specific to the proof type
 *   For 'positive': { invoiceId, amount, debtor, dueDateBlock, txHash }
 *   For 'absence': { invoiceId, dueDateBlock }
 * @returns Promise resolving to the transaction receipt
 */
export async function submitProof(
  sepoliaRpcUrl: string,
  creditcoinRpcUrl: string,
  vaultLendingAddress: string,
  mockERC20Address: string,
  privateKey: string,
  proofType: 'positive' | 'absence',
  proofParams: any
): Promise<any> {
  // Create providers and wallet for Creditcoin
  const creditcoinProvider = new ethers.JsonRpcProvider(creditcoinRpcUrl);
  const wallet = new ethers.Wallet(privateKey, creditcoinProvider);

  // Load VaultLending contract ABI
  const vaultLendingABI = [
    "function registerInvoice(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash) external",
    "function borrow(bytes32 invoiceId, uint256 amount) external returns (bytes32 loanId)",
    "function repay(bytes32 loanId) external",
    "function releaseOnPayment(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, bytes32 sourceChainTxHash) external",
    "function liquidateOnDefault(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 dueDateBlock) external"
  ];

  const contract = new ethers.Contract(vaultLendingAddress, vaultLendingABI, wallet);

  let tx: any = null;

  if (proofType === 'positive') {
    const { invoiceId, amount, debtor, dueDateBlock, txHash } = proofParams;

    // First generate the positive proof for the transaction
    const proofResult = await generatePositiveProof(
      sepoliaRpcUrl,
      creditcoinRpcUrl,
      txHash,
      "https://prover.cc3-testnet.creditcoin.network", // proof builder URL
      15 * 60 * 1000 // 15 minutes timeout
    );

    if (!proofResult || !proofResult.proof) {
      throw new Error(`Proof generation failed: invalid proof result`);
    }

    const proofData = proofResult.proof;

    const chainKey = proofData.chainKey;
    const height = proofData.headerNumber;

    let encodedTransaction = "0x";
    let merkleProof = "0x";

    if (proofData.merkleProofs && proofData.merkleProofs.size > 0) {
      const firstEntry = proofData.merkleProofs.entries().next().value;
      if (firstEntry) {
        const [_headerNumber, proofsMap] = firstEntry;
        const firstProofEntry = proofsMap.entries().next().value;
        if (firstProofEntry) {
          const [_txIndex, proofEntry] = firstProofEntry;
          encodedTransaction = proofEntry.txBytes || "0x";
          merkleProof = proofEntry.merkleProof || "0x";
        }
      }
    }

    const continuityProof = proofData.continuityProof || "0x";

    tx = await contract.registerInvoice(
      chainKey,
      height,
      encodedTransaction,
      merkleProof,
      continuityProof,
      invoiceId,
      amount,
      debtor,
      dueDateBlock,
      txHash
    );
  } else if (proofType === 'absence') {
    const { invoiceId, dueDateBlock } = proofParams;

    const proofResult = await generateAbsenceProof(
      sepoliaRpcUrl,
      creditcoinRpcUrl,
      invoiceId,
      dueDateBlock,
      "https://prover.cc3-testnet.creditcoin.network",
      15 * 60 * 1000
    );

    if (!proofResult.success) {
      throw new Error(`Absence proof generation failed`);
    }

    const chainKey = proofResult.chainKey;
    const height = proofResult.headerNumber;
    const encodedTransaction = proofResult.txBytes;
    const continuityProof = proofResult.continuityProof;
    const merkleProof = proofResult.merkleProof?.root || "0x";

    tx = await contract.liquidateOnDefault(
      chainKey,
      height,
      encodedTransaction,
      merkleProof,
      continuityProof,
      invoiceId,
      dueDateBlock
    );
  }

  if (tx === null) {
    throw new Error('Invalid proof type or failed to create transaction');
  }

  console.log(`Submitting ${proofType} proof to VaultLending at ${vaultLendingAddress}...`);
  const receipt = await tx.wait();
  console.log(`Proof submitted successfully in transaction ${receipt.hash}`);

  return receipt;
}