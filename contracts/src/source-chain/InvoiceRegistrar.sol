// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InvoiceRegistrar {
    // Event for invoice issuance
    event InvoiceIssued(
        bytes32 indexed invoiceId,
        uint256 amount,
        address debtor,
        uint256 dueDateBlock,
        bytes32 sourceChainTxHash
    );

    // Event for invoice payment
    event InvoicePaid(
        bytes32 indexed invoiceId,
        bytes32 sourceChainTxHash
    );

    // Storage for invoices
    struct Invoice {
        uint256 amount;
        address debtor;
        uint256 dueDateBlock;
        bool paid;
        bytes32 sourceChainTxHash; // Hash of the transaction that issued or paid the invoice
    }

    mapping(bytes32 => Invoice) public invoices;

    /**
     * @dev Issue a new invoice
     * @param invoiceId Unique identifier for the invoice (bytes32)
     * @param amount Amount of the invoice (in wei or token units)
     * @param debtor Address of the debtor
     * @param dueDateBlock Block number by which the invoice should be paid
     */
    function issueInvoice(
        bytes32 invoiceId,
        uint256 amount,
        address debtor,
        uint256 dueDateBlock
    ) external {
        require(invoiceId != bytes32(0), "Invoice ID cannot be zero");
        require(amount > 0, "Amount must be greater than zero");
        require(debtor != address(0), "Debtor cannot be zero address");
        require(invoices[invoiceId].amount == 0, "Invoice already exists");

        // Store invoice details
        invoices[invoiceId] = Invoice({
            amount: amount,
            debtor: debtor,
            dueDateBlock: dueDateBlock,
            paid: false,
            sourceChainTxHash: blockhash(block.number - 1) // Use previous block hash as a simplified tx hash for PoC
        });

        emit InvoiceIssued(invoiceId, amount, debtor, dueDateBlock, invoices[invoiceId].sourceChainTxHash);
    }

    /**
     * @dev Pay an invoice
     * @param invoiceId Unique identifier for the invoice (bytes32)
     */
    function payInvoice(bytes32 invoiceId) external {
        require(invoiceId != bytes32(0), "Invoice ID cannot be zero");
        require(invoices[invoiceId].amount > 0, "Invoice does not exist");
        require(!invoices[invoiceId].paid, "Invoice already paid");

        // Mark invoice as paid and store the payment transaction hash
        invoices[invoiceId].paid = true;
        invoices[invoiceId].sourceChainTxHash = blockhash(block.number - 1); // Simplified tx hash

        emit InvoicePaid(invoiceId, invoices[invoiceId].sourceChainTxHash);
    }
}