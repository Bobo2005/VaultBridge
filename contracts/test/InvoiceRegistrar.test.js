const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("InvoiceRegistrar", function () {
  let invoiceRegistrar;
  let debtorAddress;
  const INVOICE_ID = ethers.utils.id("test-invoice-id"); // 0x1234... style bytes32
  const AMOUNT = ethers.utils.parseEther("1000"); // 1000 tokens
  const DUE_DATE_BLOCK = 1000;

  beforeEach(async function () {
    // Get a random address for debtor
    const wallet = ethers.Wallet.createRandom();
    debtorAddress = wallet.address;

    const InvoiceRegistrar = await ethers.getContractFactory("InvoiceRegistrar");
    invoiceRegistrar = await InvoiceRegistrar.deploy();
    await invoiceRegistrar.deployed();
  });

  describe("Issue Invoice", function () {
    it("Should issue an invoice with correct parameters", async function () {
      await expect(invoiceRegistrar.issueInvoice(INVOICE_ID, AMOUNT, debtorAddress, DUE_DATE_BLOCK))
        .to.emit(invoiceRegistrar, "InvoiceIssued")
        .withArgs(
          INVOICE_ID,
          AMOUNT,
          debtorAddress,
          DUE_DATE_BLOCK,
          anyValue // sourceChainTxHash - we can't predict the exact value but it shouldn't be zero
        );

      const invoice = await invoiceRegistrar.invoices(INVOICE_ID);
      expect(invoice.amount).to.equal(AMOUNT);
      expect(invoice.debtor).to.equal(debtorAddress);
      expect(invoice.dueDateBlock).to.equal(DUE_DATE_BLOCK);
      expect(invoice.paid).to.be.false;
      // sourceChainTxHash will be set to something non-zero in the contract
      expect(invoice.sourceChainTxHash).to.not.equal("0x00000000000000000000000000000000000000000000000000000000000000000");
    });

    it("Should revert when issuing invoice with zero amount", async function () {
      await expect(
        invoiceRegistrar.issueInvoice(INVOICE_ID, 0, debtorAddress, DUE_DATE_BLOCK)
      ).to.be.rejectedWith("Amount must be greater than zero");
    });

    it("Should revert when issuing invoice with zero debtor", async function () {
      await expect(
        invoiceRegistrar.issueInvoice(INVOICE_ID, AMOUNT, "0x0000000000000000000000000000000000000000", DUE_DATE_BLOCK)
      ).to.be.rejectedWith("Debtor cannot be zero address");
    });

    it("Should revert when issuing invoice with zero ID", async function () {
      await expect(
        invoiceRegistrar.issueInvoice("0x0000000000000000000000000000000000000000000000000000000000000000", AMOUNT, debtorAddress, DUE_DATE_BLOCK)
      ).to.be.rejectedWith("Invoice ID cannot be zero");
    });

    it("Should revert when reissuing the same invoice ID", async function () {
      await invoiceRegistrar.issueInvoice(INVOICE_ID, AMOUNT, debtorAddress, DUE_DATE_BLOCK);
      await expect(
        invoiceRegistrar.issueInvoice(INVOICE_ID, AMOUNT, debtorAddress, DUE_DATE_BLOCK)
      ).to.be.rejectedWith("Invoice already exists");
    });
  });

  describe("Pay Invoice", function () {
    beforeEach(async function () {
      await invoiceRegistrar.issueInvoice(INVOICE_ID, AMOUNT, debtorAddress, DUE_DATE_BLOCK);
    });

    it("Should pay an invoice and mark it as paid", async function () {
      await expect(invoiceRegistrar.payInvoice(INVOICE_ID))
        .to.emit(invoiceRegistrar, "InvoicePaid")
        .withArgs(
          INVOICE_ID,
          anyValue // sourceChainTxHash - we can't predict the exact value
        );

      const invoice = await invoiceRegistrar.invoices(INVOICE_ID);
      expect(invoice.paid).to.be.true;
      expect(invoice.sourceChainTxHash).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    it("Should revert when paying an already paid invoice", async function () {
      await invoiceRegistrar.payInvoice(INVOICE_ID);
      await expect(
        invoiceRegistrar.payInvoice(INVOICE_ID)
      ).to.be.rejectedWith("Invoice already paid");
    });
  });
});