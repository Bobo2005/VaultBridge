// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/Vm.sol";
import "../VaultLending.sol";
import "../interfaces/IUSCVerifier.sol";

// Mock ERC20 for testing
interface MockERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

// Mock precompile contract for testing
interface MockBlockProver {
    function verifySingle(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) external returns (bool);
}

contract VaultLendingTest is Test {
    VaultLending public vaultLending;
    MockERC20 public mockToken;
    MockBlockProver public mockPrecompile;

    bytes32 public constant TEST_INVOICE_ID = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    address public constant TEST_DEBTOR = 0xAaBbCcDdEeFf00112233445566778899aAbBcCdD;
    address public constant TEST_BORROWER = 0xBbCcDdEeFf00112233445566778899aAbBcCdDeE;
    uint256 public constant TEST_AMOUNT = 1 ether; // 1 ETH in wei
    uint256 public constant TEST_HEIGHT = 100;
    uint256 public constant TEST_CHAIN_KEY = 1; // Sepolia

    function setUp() public {
        // Deploy mock token
        address mockTokenAddress = address(new MockToken());
        mockToken = MockERC20(mockTokenAddress);

        // Deploy mock precompile
        address mockPrecompileAddress = address(new MockBlockProverImpl());
        mockPrecompile = MockBlockProver(mockPrecompileAddress);

        // Deploy VaultLending with mock token
        vaultLending = new VaultLending(mockTokenAddress);

        // Give some tokens to test accounts for testing
        mockToken.mint(address(this), 1000 ether);
        mockToken.mint(TEST_BORROWER, 100 ether);
    }

    function testRegisterInvoiceSuccess() public {
        // Mock the precompile to return true for verification
        vm.addressPrank(mockPrecompileAddress);
        // In a real test, we'd set up expectations on the mock

        // For simplicity in this example, we'll directly test the function
        // assuming the mock is set up to return true

        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.prank(address(0xFD2)); // Pretend to be the precompile
        // Actually, we'll just test that the function executes without reverting
        // when the mock is properly configured

        // Since we're using a mock, we need to set it up to return true
        // This is a simplified test - in practice we'd use a proper mocking framework
        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100, // due date block
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Check that invoice was registered
        assertTrue(vaultLending.invoices(TEST_INVOICE_ID).active);
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).amount, TEST_AMOUNT);
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).debtor, TEST_DEBTOR);
    }

    function testBorrowSuccess() public {
        // First register an invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100,
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Now borrow against it (50% LTV - should succeed)
        uint256 borrowAmount = 0.5 ether; // 0.5 ETH

        vm.prank(TEST_BORROWER);
        // Approve the contract to borrow tokens on behalf of borrower
        vm.prank(address(this));
        mockToken.approve(address(vaultLending), borrowAmount);

        bytes32 loanId = vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);

        // Check that loan was created
        assertTrue(vaultLending.loans(loanId).active);
        assertEq(vaultLending.loans(loanId).principal, borrowAmount);
        assertEq(vaultLending.loans(loanId).borrower, TEST_BORROWER);

        // Check that invoice status updated to Borrowed
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).status, 1); // Borrowed
    }

    function testBorrowExceedsLTVFails() public {
        // First register an invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100,
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Try to borrow more than 70% LTV (should fail)
        uint256 borrowAmount = 0.8 ether; // 80% LTV

        vm.prank(TEST_BORROWER);
        vm.expectRevert("Exceeds LTV cap");
        vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);
    }

    function testRepaySuccess() public {
        // Register invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100,
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Borrow against it
        uint256 borrowAmount = 0.5 ether;

        vm.prank(TEST_BORROWER);
        vm.prank(address(this));
        mockToken.approve(address(vaultLending), borrowAmount);

        bytes32 loanId = vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);

        // Now repay the loan
        // First, borrower needs to approve contract to take tokens
        vm.prank(TEST_BORROWER);
        mockToken.approve(address(vaultLending), borrowAmount);

        vm.prank(TEST_BORROWER);
        vaultLending.repay(loanId);

        // Check loan status
        assertEq(vaultLending.loans(loanId).status, 1); // Repaid

        // Check invoice status
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).status, 2); // Paid
    }

    function testReleaseOnPaymentSuccess() public {
        // Register invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100,
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Borrow against it
        uint256 borrowAmount = 0.5 ether;

        vm.prank(TEST_BORROWER);
        vm.prank(address(this));
        mockToken.approve(address(vaultLending), borrowAmount);

        bytes32 loanId = vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);

        // Verify initial states
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).status, 1); // Borrowed
        assertEq(vaultLending.loans(loanId).status, 0); // Active

        // Now simulate payment on Sepolia and release payment on Creditcoin
        bytes memory paymentTx = hex"0x"; // dummy payment transaction
        bytes memory paymentProof = hex"0x"; // dummy proof
        bytes32 paymentTxHash = keccak256(abi.encodePacked("payment-tx"));

        // Mock the precompile to return true for payment verification
        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT + 50, // payment happened at this height
                paymentTx,
                paymentProof,
                paymentProof
            )
            .andReturn(true);

        vm.prank(address(0x123)); // Any caller can release payment (permissionless)
        vaultLending.releaseOnPayment(
            TEST_CHAIN_KEY,
            TEST_HEIGHT + 50,
            paymentTx,
            paymentProof,
            paymentProof,
            TEST_INVOICE_ID,
            paymentTxHash
        );

        // Check that loan is now repaid
        assertEq(vaultLending.loans(loanId).status, 1); // Repaid

        // Check that invoice is now paid
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).status, 2); // Paid
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).sourceChainTxHash, paymentTxHash);
    }

    function testLiquidateOnDefaultSuccess() public {
        // Register invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100, // due date block
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Borrow against it
        uint256 borrowAmount = 0.5 ether;

        vm.prank(TEST_BORROWER);
        vm.prank(address(this));
        mockToken.approve(address(vaultLending), borrowAmount);

        bytes32 loanId = vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);

        // Verify initial states
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).status, 1); // Borrowed
        assertEq(vaultLending.loans(loanId).status, 0); // Active

        // Now simulate absence of payment and liquidate on default
        // Wait until after due date block is attested on Creditcoin
        bytes memory dummyEncodedTx = hex"0x"; // placeholder for absence proof
        bytes memory dummyMerkleProof = hex"0x"; // placeholder for absence proof
        bytes memory continuityProof = hex"0x"; // continuity proof for range [0, dueDateBlock]

        // Mock the precompile to return true for absence verification
        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT + 100, // height = dueDateBlock
                dummyEncodedTx,
                dummyMerkleProof,
                continuityProof
            )
            .andReturn(true);

        vm.prank(address(0x456)); // Any caller can liquidate (permissionless)
        vaultLending.liquidateOnDefault(
            TEST_CHAIN_KEY,
            TEST_HEIGHT + 100, // height
            dummyEncodedTx,
            dummyMerkleProof,
            continuityProof,
            TEST_INVOICE_ID,
            TEST_HEIGHT + 100 // dueDateBlock
        );

        // Check that loan is now liquidated
        assertEq(vaultLending.loans(loanId).status, 2); // Liquidated

        // Check that invoice is now defaulted
        assertEq(vaultLending.invoices(TEST_INVOICE_ID).status, 3); // Defaulted
    }

    function testLiquidateOnDefaultFailsBeforeDueDate() public {
        // Register invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100, // due date block
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Borrow against it
        uint256 borrowAmount = 0.5 ether;

        vm.prank(TEST_BORROWER);
        vm.prank(address(this));
        mockToken.approve(address(vaultLending), borrowAmount);

        bytes32 loanId = vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);

        // Try to liquidate before due date - should fail
        bytes memory dummyEncodedTx = hex"0x";
        bytes memory dummyMerkleProof = hex"0x";
        bytes memory continuityProof = hex"0x";

        // Mock the precompile to return true (proof verification passes)
        // But we expect it to fail due to height != dueDateBlock check
        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT + 50, // height before due date
                dummyEncodedTx,
                dummyMerkleProof,
                continuityProof
            )
            .andReturn(true);

        vm.expectRevert("Height must equal dueDateBlock for absence proof");
        vm.prank(address(0x789));
        vaultLending.liquidateOnDefault(
            TEST_CHAIN_KEY,
            TEST_HEIGHT + 50, // height before due date
            dummyEncodedTx,
            dummyMerkleProof,
            continuityProof,
            TEST_INVOICE_ID,
            TEST_HEIGHT + 100 // dueDateBlock
        );
    }

    function testLiquidateOnDefaultFailsWhenPaymentExists() public {
        // Register invoice
        bytes memory dummyTx = hex"0x";
        bytes memory dummyProof = hex"0x";

        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT,
                dummyTx,
                dummyProof,
                dummyProof
            )
            .andReturn(true);

        vaultLending.registerInvoice(
            TEST_CHAIN_KEY,
            TEST_HEIGHT,
            dummyTx,
            dummyProof,
            dummyProof,
            TEST_INVOICE_ID,
            TEST_AMOUNT,
            TEST_DEBTOR,
            TEST_HEIGHT + 100, // due date block
            keccak256(abi.encodePacked("dummy-tx"))
        );

        // Borrow against it
        uint256 borrowAmount = 0.5 ether;

        vm.prank(TEST_BORROWER);
        vm.prank(address(this));
        mockToken.approve(address(vaultLending), borrowAmount);

        bytes32 loanId = vaultLending.borrow(TEST_INVOICE_ID, borrowAmount);

        // Simulate that a payment EXISTS (so liquidation should fail)
        // For absence proof, if payment exists, the proof verification should fail
        bytes memory dummyEncodedTx = hex"0x";
        bytes memory dummyMerkleProof = hex"0x";
        bytes memory continuityProof = hex"0x";

        // Mock the precompile to return FALSE (payment exists, so absence proof invalid)
        vm.expectCall(address(mockPrecompile))
            .withArgs(
                TEST_CHAIN_KEY,
                TEST_HEIGHT + 100, // height = dueDateBlock
                dummyEncodedTx,
                dummyMerkleProof,
                continuityProof
            )
            .andReturn(false); // Proof verification fails because payment exists

        vm.expectRevert("Invalid absence proof");
        vm.prank(address(0xabc));
        vaultLending.liquidateOnDefault(
            TEST_CHAIN_KEY,
            TEST_HEIGHT + 100, // height
            dummyEncodedTx,
            dummyMerkleProof,
            continuityProof,
            TEST_INVOICE_ID,
            TEST_HEIGHT + 100 // dueDateBlock
        );
    }
}

// Simple mock ERC20 implementation for testing

// Simple mock ERC20 implementation for testing
contract MockToken is MockERC20 {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    uint256 public totalSupply_;
    string public name = "Mock Token";
    string public symbol = "MTK";
    uint8 public decimals = 18;

    function mint(address to, uint256 amount) public {
        balances[to] += amount;
        totalSupply_ += amount;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(balances[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            balances[msg.sender] -= amount;
            balances[recipient] += amount;
        }
        return true;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(balances[sender] >= amount, "ERC20: transfer amount exceeds balance");
        require(allowances[sender][msg.sender] >= amount, "ERC20: transfer amount exceeds allowance");

        unchecked {
            balances[sender] -= amount;
            balances[recipient] += amount;
            allowances[sender][msg.sender] -= amount;
        }
        return true;
    }
}

// Mock BlockProver implementation for testing
contract MockBlockProverImpl is MockBlockProver {
    // We'll use a simple storage variable to control the return value
    bool public verifySingleResult;

    function setVerifySingleResult(bool result) public {
        verifySingleResult = result;
    }

    function verifySingle(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) public view override returns (bool) {
        return verifySingleResult;
    }
}