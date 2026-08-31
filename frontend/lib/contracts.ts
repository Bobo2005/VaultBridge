/**
 * VaultBridge Smart Contract Addresses, ABIs, and Block Explorer Helpers
 * Deployed on Ethereum Sepolia and Creditcoin USC Testnet
 */

export const CONTRACT_ADDRESSES = {
  sepolia: {
    chainId: 11155111,
    chainKey: 1,
    invoiceRegistrar:
      process.env.NEXT_PUBLIC_INVOICE_REGISTRAR_ADDRESS ||
      "0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021",
    streakRegistry:
      process.env.NEXT_PUBLIC_STREAK_REGISTRY_ADDRESS ||
      "0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce",
    explorerUrl: "https://sepolia.etherscan.io",
  },
  creditcoin: {
    chainId: 102031,
    vaultLending:
      process.env.NEXT_PUBLIC_VAULT_LENDING_ADDRESS ||
      "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5",
    accessRegistry:
      process.env.NEXT_PUBLIC_ACCESS_REGISTRY_ADDRESS ||
      "0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe",
    streakVerifier:
      process.env.NEXT_PUBLIC_STREAK_VERIFIER_ADDRESS ||
      "0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A",
    streakBadge:
      process.env.NEXT_PUBLIC_STREAK_BADGE_ADDRESS ||
      "0xfa41181596515986C87A969F51daD5af597eB3b7",
    mockERC20:
      process.env.NEXT_PUBLIC_MOCK_ERC20_ADDRESS ||
      "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714",
    mockPriceOracle:
      process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS ||
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    verifierPrecompile: "0x0000000000000000000000000000000000000FD2",
    chainInfoPrecompile: "0x0000000000000000000000000000000000000FD3",
    explorerUrl: "https://creditcoin-testnet.blockscout.com",
  },
} as const;

export const RISK_TIERS = {
  TIER_A: { id: 1, name: "Tier A (Prime)", ltvBps: 8000, ltvPercent: "80%", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  TIER_B: { id: 2, name: "Tier B (Standard)", ltvBps: 7000, ltvPercent: "70%", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  TIER_C: { id: 3, name: "Tier C (Subprime)", ltvBps: 5000, ltvPercent: "50%", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
} as const;

export const EXPLORER_HELPERS = {
  getSepoliaTxUrl: (txHash: string) => `https://sepolia.etherscan.io/tx/${txHash}`,
  getSepoliaAddressUrl: (address: string) => `https://sepolia.etherscan.io/address/${address}`,
  getCreditcoinTxUrl: (txHash: string) => `https://creditcoin-testnet.blockscout.com/tx/${txHash}`,
  getCreditcoinAddressUrl: (address: string) => `https://creditcoin-testnet.blockscout.com/address/${address}`,
};

export const INVOICE_REGISTRAR_ABI = [
  "function issueInvoice(bytes32 invoiceId, uint256 amount, address debtor, uint256 dueDateBlock) external",
  "function payInvoice(bytes32 invoiceId) external payable",
  "function invoices(bytes32 invoiceId) external view returns (bytes32 id, uint256 amount, address debtor, uint256 dueDateBlock, bool isPaid)",
  "event InvoiceIssued(bytes32 indexed invoiceId, uint256 amount, address indexed debtor, uint256 dueDateBlock)",
  "event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, uint256 amount)",
] as const;

export const ACCESS_REGISTRY_ABI = [
  "function registerData(bytes32 dataId, bytes calldata ownerWrappedKey) external",
  "function grantAccess(bytes32 dataId, address grantee, bytes calldata wrappedKeyForGrantee) external",
  "function revokeAccess(bytes32 dataId, address grantee) external",
  "function getWrappedKey(bytes32 dataId, address requester) external view returns (bytes memory)",
  "function hasAccess(bytes32 dataId, address requester) external view returns (bool)",
  "event DataRegistered(bytes32 indexed dataId, address indexed owner)",
  "event AccessGranted(bytes32 indexed dataId, address indexed owner, address indexed grantee)",
  "event AccessRevoked(bytes32 indexed dataId, address indexed owner, address indexed grantee)",
] as const;

export const VAULT_LENDING_ABI = [
  "function registerInvoice(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, bytes32 commitment, string calldata pointer, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash) external",
  "function registerInvoicesBatch(uint256 chainKey, uint256[] calldata heights, bytes[] calldata encodedTransactions, bytes[] calldata merkleProofs, bytes calldata sharedContinuityProof, bytes32[] calldata invoiceIds, bytes32[] calldata commitments, string[] calldata pointers, uint256[] calldata amounts, address[] calldata debtors, uint256[] calldata dueDateBlocks, bytes32[] calldata sourceChainTxHashes) external",
  "function borrow(bytes32 invoiceId, uint256 amount) external returns (bytes32 loanId)",
  "function borrowWithToken(bytes32 invoiceId, address tokenToBorrow, uint256 amount) external returns (bytes32 loanId)",
  "function repay(bytes32 loanId) external",
  "function repayInvoice(bytes32 invoiceId) external",
  "function depositLiquidity(address token, uint256 amount) external",
  "function withdrawLiquidity(address token, uint256 amount) external",
  "function lenderBalances(address lender, address token) external view returns (uint256)",
  "function releaseOnPayment(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, bytes32 sourceChainTxHash) external",
  "function liquidateOnDefault(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 invoiceId, uint256 dueDateBlock) external",
  "function getDebtorLtvCap(address debtor) external view returns (uint256)",
  "function debtorRiskTier(address debtor) external view returns (uint8)",
  "function setDebtorRiskTier(address debtor, uint8 tier) external",
  "function supportedTokens(address token) external view returns (bool)",
  "function invoices(bytes32 invoiceId) external view returns (bytes32 id, bytes32 commitment, string pointer, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash, uint8 status, bool active)",
  "function loans(bytes32 loanId) external view returns (bytes32 invoiceId, address borrower, address loanToken, uint256 principal, uint256 ltvBps, uint8 status, bool active)",
  "function invoiceIdToLoanId(bytes32 invoiceId) external view returns (bytes32)",
  "event InvoiceRegistered(bytes32 indexed invoiceId, bytes32 indexed commitment, string pointer, uint256 amount, address debtor, uint256 dueDateBlock, bytes32 sourceChainTxHash)",
  "event LoanCreated(bytes32 indexed loanId, bytes32 indexed invoiceId, address borrower, address loanToken, uint256 principal, uint256 ltvBps)",
  "event LoanRepaid(bytes32 indexed loanId)",
  "event LoanLiquidated(bytes32 indexed loanId)",
  "event DebtorTierUpdated(address indexed debtor, uint8 tier, uint256 ltvBps)",
  "event LiquidityDeposited(address indexed lender, address indexed token, uint256 amount)",
  "event LiquidityWithdrawn(address indexed lender, address indexed token, uint256 amount)",
] as const;

export const MOCK_ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function faucet(address to, uint256 amount) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

export const STREAK_REGISTRY_ABI = [
  "function createStreak(bytes32 streakId, string calldata title) external",
  "function checkIn(bytes32 streakId) external",
  "function isCheckedIn(bytes32 streakId, uint256 dayIndex) external view returns (bool)",
  "function hasCheckedIn(bytes32 streakId, uint256 dayIndex) external view returns (bool)",
  "function streaks(bytes32 streakId) external view returns (bytes32 id, address owner, string memory title, uint256 startTimestamp, uint256 lastCheckInDay, uint256 totalCheckIns, bool active)",
  "event StreakCreated(bytes32 indexed streakId, address indexed creator, string title, uint256 startTimestamp)",
  "event CheckedIn(bytes32 indexed streakId, uint256 indexed dayIndex, uint256 timestamp)",
] as const;

export const STREAK_VERIFIER_ABI = [
  "function registerCheckIn(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 streakId, uint256 dayIndex, address user) external",
  "function breakStreakIfMissed(uint256 chainKey, uint256 height, bytes calldata encodedTransaction, bytes calldata merkleProof, bytes calldata continuityProof, bytes32 streakId, uint256 missedDayIndex) external",
  "function getStreak(bytes32 streakId) external view returns (tuple(bytes32 streakId, address user, uint256 currentCount, uint256 longestCount, uint256 lastCheckInDay, uint256 lastCheckInBlock, bool active))",
  "function streaks(bytes32 streakId) external view returns (bytes32 streakId, address user, uint256 currentCount, uint256 longestCount, uint256 lastCheckInDay, uint256 lastCheckInBlock, bool active)",
  "function isDayCheckedIn(bytes32 streakId, uint256 dayIndex) external view returns (bool)",
  "event StreakRegistered(bytes32 indexed streakId, address indexed user)",
  "event CheckInVerified(bytes32 indexed streakId, address indexed user, uint256 indexed dayIndex, uint256 currentCount)",
  "event StreakBroken(bytes32 indexed streakId, address indexed user, uint256 indexed missedDayIndex, address breaker)",
  "event MilestoneBadgeAwarded(bytes32 indexed streakId, address indexed user, uint256 milestoneDays, uint256 tokenId)",
] as const;

export const STREAK_BADGE_ABI = [
  "function mintMilestoneBadge(address to, uint256 milestoneDays) external returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function badgeInfo(uint256 tokenId) external view returns (uint256 tokenId, address recipient, uint256 milestoneDays, uint256 mintedAt)",
  "event MilestoneBadgeMinted(address indexed recipient, uint256 indexed tokenId, uint256 milestoneDays)",
] as const;
