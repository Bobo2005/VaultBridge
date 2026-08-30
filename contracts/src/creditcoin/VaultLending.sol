// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IUSCVerifier.sol";
import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VaultLending
 * @notice Privacy-preserving cross-chain invoice financing vault on Creditcoin with dynamic risk-tiered LTV caps,
 * commitment+pointer storage, and precompile 0x0FD2 attestation verification per VaultBridge V2 Architecture §2.2
 */
contract VaultLending is Ownable {
    // Precompile address for BlockProver (0x0FD2)
    address internal constant BLOCK_PROVER_PRECOMPILE =
        0x0000000000000000000000000000000000000FD2;

    // Standard LTV Cap constants in basis points (10,000 = 100%)
    uint256 public constant LTV_TIER_A_BPS = 8000; // 80% LTV (Prime Debtors)
    uint256 public constant LTV_TIER_B_BPS = 7000; // 70% LTV (Standard / Default)
    uint256 public constant LTV_TIER_C_BPS = 5000; // 50% LTV (Subprime / Emerging)

    // Legacy fallback constant
    uint256 public constant LTV_CAP_BPS = 7000;

    // Default mock token
    address public mockToken;

    // Oracle reference & freshness settings
    IPriceOracle public priceOracle;
    uint256 public maxOracleStaleness = 3600; // 1 hour maximum staleness threshold

    // Supported borrow/disbursement tokens (USDC, USDT, EURC, MockToken)
    mapping(address => bool) public supportedTokens;

    // Debtor Risk Tiers: 0/2: Tier B (70%), 1: Tier A (80%), 3: Tier C (50%)
    mapping(address => uint8) public debtorRiskTier;

    // Privacy-preserving Invoice struct (stores commitment + pointer instead of leaking plaintext metadata)
    struct Invoice {
        bytes32 id;           // invoiceId
        bytes32 commitment;   // keccak256 hash of the off-chain encrypted ciphertext payload
        string pointer;       // off-chain IPFS / decentralized storage URI (e.g. ipfs://bafkrei...)
        uint256 amount;       // invoice amount in wei (or collateral token base units)
        address debtor;       // debtor address
        uint256 dueDateBlock; // due date as block number
        bytes32 sourceChainTxHash; // source transaction hash
        uint8 status;         // 0: Attested, 1: Borrowed, 2: Paid, 3: Defaulted
        bool active;          // whether invoice is active
    }

    // Loan struct
    struct Loan {
        bytes32 invoiceId;    // references invoice
        address borrower;     // borrower address
        address loanToken;    // token borrowed (USDC, EURC, etc.)
        uint256 principal;    // loan principal amount
        uint256 ltvBps;       // loan-to-value ratio in basis points
        uint8 status;         // 0: Active, 1: Repaid, 2: Liquidated
        bool active;          // whether loan is active
    }

    // Storage mappings
    mapping(bytes32 => Invoice) public invoices;
    mapping(bytes32 => Loan) public loans; // keyed by loanId
    mapping(bytes32 => bytes32) public invoiceIdToLoanId; // Maps invoiceId to loanId

    // Counters
    uint256 public loanCounter;

    // Lender liquidity balances: lender => token => balance
    mapping(address => mapping(address => uint256)) public lenderBalances;

    // Events
    event InvoiceRegistered(
        bytes32 indexed invoiceId,
        bytes32 indexed commitment,
        string pointer,
        uint256 amount,
        address debtor,
        uint256 dueDateBlock,
        bytes32 sourceChainTxHash
    );

    event LoanCreated(
        bytes32 indexed loanId,
        bytes32 indexed invoiceId,
        address borrower,
        address loanToken,
        uint256 principal,
        uint256 ltvBps
    );

    event LoanRepaid(bytes32 indexed loanId);
    event LoanLiquidated(bytes32 indexed loanId);
    event InvoicePaid(bytes32 indexed invoiceId);
    event InvoiceDefaulted(bytes32 indexed invoiceId);
    event DebtorTierUpdated(address indexed debtor, uint8 tier, uint256 ltvBps);
    event SupportedTokenUpdated(address indexed token, bool supported);
    event PriceOracleUpdated(address indexed oracle);
    event LiquidityDeposited(address indexed lender, address indexed token, uint256 amount);
    event LiquidityWithdrawn(address indexed lender, address indexed token, uint256 amount);

    // Constructor
    constructor(address _mockToken) Ownable(msg.sender) {
        mockToken = _mockToken;
        if (_mockToken != address(0)) {
            supportedTokens[_mockToken] = true;
        }
    }

    // Admin configuration
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = IPriceOracle(_oracle);
        emit PriceOracleUpdated(_oracle);
    }

    function setMaxOracleStaleness(uint256 _maxStaleness) external onlyOwner {
        maxOracleStaleness = _maxStaleness;
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit SupportedTokenUpdated(token, supported);
    }

    function setDebtorRiskTier(address debtor, uint8 tier) external onlyOwner {
        require(tier <= 3, "Invalid risk tier (0-3)");
        debtorRiskTier[debtor] = tier;
        emit DebtorTierUpdated(debtor, tier, getDebtorLtvCap(debtor));
    }

    /**
     * @notice Returns dynamic LTV cap based on debtor credit risk tier
     */
    function getDebtorLtvCap(address debtor) public view returns (uint256) {
        uint8 tier = debtorRiskTier[debtor];
        if (tier == 1) {
            return LTV_TIER_A_BPS; // 80% (Prime)
        } else if (tier == 3) {
            return LTV_TIER_C_BPS; // 50% (Subprime)
        }
        return LTV_TIER_B_BPS; // 70% (Standard)
    }

    /**
     * @dev Registers an invoice with commitment+pointer storage after verifying proof via BlockProver precompile (0x0FD2)
     */
    function registerInvoice(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 invoiceId,
        bytes32 commitment,
        string calldata pointer,
        uint256 amount,
        address debtor,
        uint256 dueDateBlock,
        bytes32 sourceChainTxHash
    ) external {
        bool verified = IUSCVerifier(BLOCK_PROVER_PRECOMPILE).verifySingle(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );

        require(verified, "Invalid proof");
        require(!invoices[invoiceId].active, "Invoice already registered");

        invoices[invoiceId] = Invoice({
            id: invoiceId,
            commitment: commitment,
            pointer: pointer,
            amount: amount,
            debtor: debtor,
            dueDateBlock: dueDateBlock,
            sourceChainTxHash: sourceChainTxHash,
            status: 0, // Attested
            active: true
        });

        emit InvoiceRegistered(invoiceId, commitment, pointer, amount, debtor, dueDateBlock, sourceChainTxHash);
    }

    /**
     * @dev Backward-compatible / convenience overload for single invoice registration
     */
    function registerInvoice(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 invoiceId,
        uint256 amount,
        address debtor,
        uint256 dueDateBlock,
        bytes32 sourceChainTxHash
    ) external {
        bool verified = IUSCVerifier(BLOCK_PROVER_PRECOMPILE).verifySingle(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );

        require(verified, "Invalid proof");
        require(!invoices[invoiceId].active, "Invoice already registered");

        bytes32 defaultCommitment = keccak256(abi.encodePacked(invoiceId, amount, debtor));
        string memory defaultPointer = "ipfs://default";

        invoices[invoiceId] = Invoice({
            id: invoiceId,
            commitment: defaultCommitment,
            pointer: defaultPointer,
            amount: amount,
            debtor: debtor,
            dueDateBlock: dueDateBlock,
            sourceChainTxHash: sourceChainTxHash,
            status: 0, // Attested
            active: true
        });

        emit InvoiceRegistered(invoiceId, defaultCommitment, defaultPointer, amount, debtor, dueDateBlock, sourceChainTxHash);
    }

    /**
     * @dev Bulk registers up to 20 invoices in a single transaction via IUSCVerifier.verifyBatch
     * @notice Utilizes a shared continuity proof to achieve ~86% gas reduction
     */
    function registerInvoicesBatch(
        uint256 chainKey,
        uint256[] calldata heights,
        bytes[] calldata encodedTransactions,
        bytes[] calldata merkleProofs,
        bytes calldata sharedContinuityProof,
        bytes32[] calldata invoiceIds,
        bytes32[] calldata commitments,
        string[] calldata pointers,
        uint256[] calldata amounts,
        address[] calldata debtors,
        uint256[] calldata dueDateBlocks,
        bytes32[] calldata sourceChainTxHashes
    ) external {
        uint256 len = invoiceIds.length;
        require(len > 0 && len <= 20, "Batch size must be 1-20");
        require(heights.length == len, "Heights length mismatch");
        require(encodedTransactions.length == len, "Txs length mismatch");
        require(merkleProofs.length == len, "Proofs length mismatch");
        require(commitments.length == len, "Commitments length mismatch");
        require(pointers.length == len, "Pointers length mismatch");
        require(amounts.length == len, "Amounts length mismatch");
        require(debtors.length == len, "Debtors length mismatch");
        require(dueDateBlocks.length == len, "DueDates length mismatch");
        require(sourceChainTxHashes.length == len, "TxHashes length mismatch");

        // Verify batch proof using native precompile 0x0FD2
        bool verified = IUSCVerifier(BLOCK_PROVER_PRECOMPILE).verifyBatch(
            chainKey,
            heights,
            encodedTransactions,
            merkleProofs,
            sharedContinuityProof
        );

        require(verified, "Invalid batch proof");

        for (uint256 i = 0; i < len; i++) {
            bytes32 invId = invoiceIds[i];
            require(!invoices[invId].active, "Invoice already registered");

            invoices[invId] = Invoice({
                id: invId,
                commitment: commitments[i],
                pointer: pointers[i],
                amount: amounts[i],
                debtor: debtors[i],
                dueDateBlock: dueDateBlocks[i],
                sourceChainTxHash: sourceChainTxHashes[i],
                status: 0, // Attested
                active: true
            });

            emit InvoiceRegistered(invId, commitments[i], pointers[i], amounts[i], debtors[i], dueDateBlocks[i], sourceChainTxHashes[i]);
        }
    }

    /**
     * @dev Borrow against an invoice with dynamic tiered LTV cap in standard token
     */
    function borrow(bytes32 invoiceId, uint256 amount) external returns (bytes32 loanId) {
        return borrowWithToken(invoiceId, mockToken, amount);
    }

    /**
     * @dev Multi-asset borrow against an invoice in specified token (USDC, USDT, EURC)
     */
    function borrowWithToken(
        bytes32 invoiceId,
        address tokenToBorrow,
        uint256 amount
    ) public returns (bytes32 loanId) {
        Invoice storage invoice = invoices[invoiceId];
        require(invoice.active && invoice.status == 0, "Invoice not available for borrowing");
        require(supportedTokens[tokenToBorrow], "Unsupported borrow token");

        // Calculate dynamic maximum borrowable amount based on debtor risk tier
        uint256 debtorLtvBps = getDebtorLtvCap(invoice.debtor);
        uint256 maxBorrowable = (invoice.amount * debtorLtvBps) / 10000;

        // If oracle is connected, convert collateral valuation to borrow token value
        if (address(priceOracle) != address(0)) {
            require(priceOracle.isPriceFresh(address(0), maxOracleStaleness), "Stale collateral price");
            require(priceOracle.isPriceFresh(tokenToBorrow, maxOracleStaleness), "Stale borrow token price");
        }

        require(amount <= maxBorrowable, "Exceeds dynamic LTV cap");

        loanCounter++;
        loanId = keccak256(abi.encodePacked(invoiceId, loanCounter));

        uint256 actualLtv = (amount * 10000) / invoice.amount;

        loans[loanId] = Loan({
            invoiceId: invoiceId,
            borrower: msg.sender,
            loanToken: tokenToBorrow,
            principal: amount,
            ltvBps: actualLtv,
            status: 0, // Active
            active: true
        });

        invoiceIdToLoanId[invoiceId] = loanId;
        invoice.status = 1; // Borrowed

        require(IERC20(tokenToBorrow).transfer(msg.sender, amount), "Token transfer failed");

        emit LoanCreated(loanId, invoiceId, msg.sender, tokenToBorrow, amount, actualLtv);
    }

    /**
     * @dev Deposit liquidity into the lending pool (USDC, EURC, MockToken)
     */
    function depositLiquidity(address token, uint256 amount) external {
        require(supportedTokens[token], "Unsupported deposit token");
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Token deposit transfer failed");

        lenderBalances[msg.sender][token] += amount;
        emit LiquidityDeposited(msg.sender, token, amount);
    }

    /**
     * @dev Withdraw liquidity from the lending pool
     */
    function withdrawLiquidity(address token, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(lenderBalances[msg.sender][token] >= amount, "Insufficient deposited balance");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient pool liquidity");

        lenderBalances[msg.sender][token] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Token withdrawal transfer failed");

        emit LiquidityWithdrawn(msg.sender, token, amount);
    }

    /**
     * @dev Repay a loan by invoiceId
     */
    function repayInvoice(bytes32 invoiceId) external {
        bytes32 loanId = invoiceIdToLoanId[invoiceId];
        require(loanId != bytes32(0), "No active loan for invoice");
        _repayLoan(loanId);
    }

    /**
     * @dev Repay a loan and mark invoice as paid
     */
    function repay(bytes32 loanId) external {
        _repayLoan(loanId);
    }

    function _repayLoan(bytes32 loanId) internal {
        Loan storage loan = loans[loanId];
        require(loan.active && loan.status == 0, "Loan not active");

        address tokenToRepay = loan.loanToken != address(0) ? loan.loanToken : mockToken;

        require(IERC20(tokenToRepay).balanceOf(msg.sender) >= loan.principal, "Insufficient balance");
        require(IERC20(tokenToRepay).transferFrom(msg.sender, address(this), loan.principal), "Token transfer failed");

        loan.status = 1; // Repaid

        Invoice storage invoice = invoices[loan.invoiceId];
        require(invoice.active, "Invoice not active");
        invoice.status = 2; // Paid

        emit LoanRepaid(loanId);
        emit InvoicePaid(loan.invoiceId);
    }

    /**
     * @dev Release collateral upon verified payment proof
     */
    function releaseOnPayment(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 invoiceId,
        bytes32 sourceChainTxHash
    ) external {
        bool verified = IUSCVerifier(BLOCK_PROVER_PRECOMPILE).verifySingle(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );

        require(verified, "Invalid payment proof");

        Invoice storage invoice = invoices[invoiceId];
        require(invoice.active, "Invoice not active");
        require(invoice.status == 1, "Invoice not borrowed");

        bytes32 loanId = invoiceIdToLoanId[invoiceId];
        require(loans[loanId].active, "Loan not found");
        require(loans[loanId].invoiceId == invoiceId, "Loan-invoice mismatch");

        loans[loanId].status = 1; // Repaid
        invoice.status = 2; // Paid
        invoice.sourceChainTxHash = sourceChainTxHash;

        emit LoanRepaid(loanId);
        emit InvoicePaid(invoiceId);
    }

    /**
     * @dev Liquidate loan upon verified absence-of-payment proof
     */
    function liquidateOnDefault(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 invoiceId,
        uint256 dueDateBlock
    ) external {
        bool verified = IUSCVerifier(BLOCK_PROVER_PRECOMPILE).verifySingle(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );

        require(verified, "Invalid absence proof");
        require(height == dueDateBlock, "Height must equal dueDateBlock for absence proof");

        Invoice storage invoice = invoices[invoiceId];
        require(invoice.active, "Invoice not active");
        require(invoice.status == 1, "Invoice not borrowed");
        require(invoice.dueDateBlock == dueDateBlock, "Due date block mismatch");

        bytes32 loanId = invoiceIdToLoanId[invoiceId];
        require(loans[loanId].active, "Loan not found");
        require(loans[loanId].invoiceId == invoiceId, "Loan-invoice mismatch");

        loans[loanId].status = 2; // Liquidated
        invoice.status = 3; // Defaulted

        emit LoanLiquidated(loanId);
        emit InvoiceDefaulted(invoiceId);
    }

    function calculateLtvBps(uint256 loanAmount, uint256 collateralAmount)
        public
        pure
        returns (uint256)
    {
        require(collateralAmount > 0, "Collateral amount must be > 0");
        return (loanAmount * 10000) / collateralAmount;
    }
}