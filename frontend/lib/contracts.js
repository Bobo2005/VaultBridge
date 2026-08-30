"use strict";
/**
 * VaultBridge Smart Contract Addresses, ABIs, and Block Explorer Helpers
 * Deployed on Ethereum Sepolia and Creditcoin USC Testnet
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAULT_LENDING_ABI = exports.INVOICE_REGISTRAR_ABI = exports.EXPLORER_HELPERS = exports.CONTRACT_ADDRESSES = void 0;
exports.CONTRACT_ADDRESSES = {
    sepolia: {
        chainId: 11155111,
        chainKey: 1,
        invoiceRegistrar: process.env.NEXT_PUBLIC_INVOICE_REGISTRAR_ADDRESS ||
            "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714",
        explorerUrl: "https://sepolia.etherscan.io",
    },
    creditcoin: {
        chainId: 102031,
        vaultLending: process.env.NEXT_PUBLIC_VAULT_LENDING_ADDRESS ||
            "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5",
        mockERC20: process.env.NEXT_PUBLIC_MOCK_ERC20_ADDRESS ||
            "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714",
        verifierPrecompile: "0x0000000000000000000000000000000000000FD2",
        chainInfoPrecompile: "0x0000000000000000000000000000000000000FD3",
        explorerUrl: "https://creditcoin-testnet.blockscout.com",
    },
};
exports.EXPLORER_HELPERS = {
    getSepoliaTxUrl: (txHash) => `https://sepolia.etherscan.io/tx/${txHash}`,
    getSepoliaAddressUrl: (address) => `https://sepolia.etherscan.io/address/${address}`,
    getCreditcoinTxUrl: (txHash) => `https://creditcoin-testnet.blockscout.com/tx/${txHash}`,
    getCreditcoinAddressUrl: (address) => `https://creditcoin-testnet.blockscout.com/address/${address}`,
};
exports.INVOICE_REGISTRAR_ABI = [
    "function issueInvoice(bytes32 invoiceId, uint256 amount, address debtor, uint256 dueDateBlock) external",
    "function payInvoice(bytes32 invoiceId) external payable",
    "function invoices(bytes32 invoiceId) external view returns (bytes32 id, uint256 amount, address debtor, uint256 dueDateBlock, bool isPaid)",
    "event InvoiceIssued(bytes32 indexed invoiceId, uint256 amount, address indexed debtor, uint256 dueDateBlock)",
    "event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, uint256 amount)",
];
exports.VAULT_LENDING_ABI = [
    "function registerInvoice(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash) external",
    "function borrow(bytes32 invoiceId, uint256 amount) external returns (bytes32 loanId)",
    "function repay(bytes32 loanId) external",
    "function releaseOnPayment(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, bytes32 sourceChainTxHash) external",
    "function liquidateOnDefault(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 dueDateBlock) external",
    "function invoices(bytes32 invoiceId) external view returns (bytes32 id, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash, uint8 status, bool active)",
    "function loans(bytes32 loanId) external view returns (bytes32 invoiceId, address borrower, uint256 principal, uint256 ltvBps, uint8 status, bool active)",
    "function invoiceIdToLoanId(bytes32 invoiceId) external view returns (bytes32)",
    "event InvoiceRegistered(bytes32 indexed invoiceId, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash)",
    "event LoanCreated(bytes32 indexed loanId, bytes32 indexed invoiceId, address borrower, uint256 principal, uint256 ltvBps)",
    "event LoanRepaid(bytes32 indexed loanId)",
    "event LoanLiquidated(bytes32 indexed loanId)",
    "event InvoicePaid(bytes32 indexed invoiceId)",
    "event InvoiceDefaulted(bytes32 indexed invoiceId)",
];
