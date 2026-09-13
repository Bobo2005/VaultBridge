const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("VaultLending Game Theory, Economics & EIP-712 Rigor", function () {
  let vaultLending, accessRegistry;
  let mockToken, usdcToken;
  let mockVerifier;
  let owner, borrower, keeper, auditor, primeDebtor, subprimeDebtor;

  beforeEach(async function () {
    [owner, borrower, keeper, auditor, primeDebtor, subprimeDebtor] = await ethers.getSigners();

    // 1. Deploy Mock Precompile
    const MockPrecompile = await ethers.getContractFactory("MockStreakPrecompile");
    mockVerifier = await MockPrecompile.deploy();
    await mockVerifier.deployed();

    const code = await ethers.provider.getCode(mockVerifier.address);
    await ethers.provider.send("hardhat_setCode", [
      "0x0000000000000000000000000000000000000FD2",
      code,
    ]);

    // 2. Deploy Mock Tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Mock Token", "MCK", 18);
    await mockToken.deployed();

    usdcToken = await MockERC20Factory.deploy("USD Coin", "USDC", 6);
    await usdcToken.deployed();

    // 3. Deploy VaultLending & AccessRegistry
    const VaultLendingFactory = await ethers.getContractFactory("VaultLending");
    vaultLending = await VaultLendingFactory.deploy(mockToken.address);
    await vaultLending.deployed();

    const AccessRegistryFactory = await ethers.getContractFactory("AccessRegistry");
    accessRegistry = await AccessRegistryFactory.deploy();
    await accessRegistry.deployed();

    // 4. Configure verifier, tokens & debtor risk tiers
    await vaultLending.setVerifier(mockVerifier.address);
    await vaultLending.setSupportedToken(usdcToken.address, true);
    await vaultLending.setDebtorRiskTier(primeDebtor.address, 1); // Tier A: 80% LTV, 4.0% APR
    await vaultLending.setDebtorRiskTier(subprimeDebtor.address, 3); // Tier C: 50% LTV, 6.5% APR

    // 5. Mint tokens for vault liquidity and participants
    await usdcToken.mint(vaultLending.address, ethers.utils.parseUnits("10000000", 6));
    await usdcToken.mint(borrower.address, ethers.utils.parseUnits("1000000", 6));
    await usdcToken.mint(owner.address, ethers.utils.parseUnits("1000000", 6));
  });

  describe("1. Liquidator Keeper Bounty (5% on Absence Proof Liquidation)", function () {
    it("Should reward the keeper with exact 5% bounty upon verified absence-of-payment proof", async function () {
      const invoiceId = ethers.utils.id("INV-BOUNTY-001");
      const commitment = ethers.utils.id("commitment-001");
      const pointer = "ipfs://bafkreihdwdcefgh001";
      const invoiceAmount = ethers.utils.parseUnits("100000", 6); // $100k USDC
      const dueDateBlock = 5000;

      // Register Invoice
      await vaultLending.connect(borrower)["registerInvoice(uint256,uint256,bytes,bytes,bytes,bytes32,bytes32,string,uint256,address,uint256,bytes32)"](
        1,
        1000,
        "0x",
        "0x",
        "0x",
        invoiceId,
        commitment,
        pointer,
        invoiceAmount,
        primeDebtor.address, // Tier A (80% LTV)
        dueDateBlock,
        ethers.utils.id("txhash-001")
      );

      // Borrow $50,000 USDC against the invoice
      const borrowAmount = ethers.utils.parseUnits("50000", 6);
      await vaultLending.connect(borrower).borrowWithToken(invoiceId, usdcToken.address, borrowAmount);

      const keeperInitialBalance = await usdcToken.balanceOf(keeper.address);

      // Liquidate via Keeper calling liquidateOnDefault with Absence Proof
      const tx = await vaultLending.connect(keeper).liquidateOnDefault(
        1,
        dueDateBlock, // height == dueDateBlock for absence proof
        "0x",
        "0x",
        "0x",
        invoiceId,
        dueDateBlock
      );
      const receipt = await tx.wait();

      // Expected 5% bounty on $50,000 loan principal = $2,500 USDC
      const expectedBounty = borrowAmount.mul(500).div(10000);
      expect(expectedBounty).to.equal(ethers.utils.parseUnits("2500", 6));

      // Verify LoanLiquidatedWithBounty event
      const bountyEvent = receipt.events.find((e) => e.event === "LoanLiquidatedWithBounty");
      expect(bountyEvent).to.not.be.undefined;
      expect(bountyEvent.args.liquidator).to.equal(keeper.address);
      expect(bountyEvent.args.bountyAmount).to.equal(expectedBounty);

      // Verify Keeper received the bounty
      const keeperFinalBalance = await usdcToken.balanceOf(keeper.address);
      expect(keeperFinalBalance.sub(keeperInitialBalance)).to.equal(expectedBounty);

      // Verify Invoice & Loan statuses
      const invoice = await vaultLending.invoices(invoiceId);
      expect(invoice.status).to.equal(3); // Defaulted
    });
  });

  describe("2. Dynamic APR & Continuous Interest Accrual", function () {
    it("Should accurately accrue interest over time based on debtor tier APR", async function () {
      const invoiceId = ethers.utils.id("INV-INTEREST-001");
      const invoiceAmount = ethers.utils.parseUnits("100000", 6);
      const dueDateBlock = 8000;

      await vaultLending.connect(borrower)["registerInvoice(uint256,uint256,bytes,bytes,bytes,bytes32,bytes32,string,uint256,address,uint256,bytes32)"](
        1,
        1000,
        "0x",
        "0x",
        "0x",
        invoiceId,
        ethers.utils.id("commit-interest"),
        "ipfs://test",
        invoiceAmount,
        primeDebtor.address, // Tier A = 4.0% APR (400 bps)
        dueDateBlock,
        ethers.utils.id("txhash-int")
      );

      const borrowAmount = ethers.utils.parseUnits("10000", 6); // $10,000 USDC
      const borrowTx = await vaultLending.connect(borrower).borrowWithToken(invoiceId, usdcToken.address, borrowAmount);
      const receipt = await borrowTx.wait();
      const loanCreatedEvent = receipt.events.find((e) => e.event === "LoanCreated");
      const loanId = loanCreatedEvent.args.loanId;

      // Advance time by 182.5 days (approx half a year = 15,768,000 seconds)
      const halfYearSeconds = 182.5 * 24 * 60 * 60;
      await network.provider.send("evm_increaseTime", [halfYearSeconds]);
      await network.provider.send("evm_mine");

      // Accrued interest on $10,000 at 4.0% for 0.5 year = ~$200 USDC
      const accruedInterest = await vaultLending.calculateAccruedInterest(loanId);
      expect(accruedInterest).to.be.closeTo(ethers.utils.parseUnits("200", 6), ethers.utils.parseUnits("2", 6));

      // Fund borrower to repay loan + interest
      const totalRepay = borrowAmount.add(accruedInterest).add(ethers.utils.parseUnits("10", 6));
      await usdcToken.mint(borrower.address, totalRepay);
      await usdcToken.connect(borrower).approve(vaultLending.address, totalRepay);

      const repayTx = await vaultLending.connect(borrower).repay(loanId);
      const repayReceipt = await repayTx.wait();

      const repaidInterestEvent = repayReceipt.events.find((e) => e.event === "LoanRepaidWithInterest");
      expect(repaidInterestEvent).to.not.be.undefined;
      expect(repaidInterestEvent.args.principal).to.equal(borrowAmount);
    });

    it("Should compute dynamic pool utilization and dynamic lender APY", async function () {
      // Deposit 100,000 USDC
      const depositAmount = ethers.utils.parseUnits("100000", 6);
      await usdcToken.connect(borrower).approve(vaultLending.address, depositAmount);
      await vaultLending.connect(borrower).depositLiquidity(usdcToken.address, depositAmount);

      // Register and Borrow
      const invoiceId = ethers.utils.id("INV-POOL-001");
      await vaultLending.connect(borrower)["registerInvoice(uint256,uint256,bytes,bytes,bytes,bytes32,bytes32,string,uint256,address,uint256,bytes32)"](
        1,
        1000,
        "0x",
        "0x",
        "0x",
        invoiceId,
        ethers.utils.id("commit-pool"),
        "ipfs://pool",
        ethers.utils.parseUnits("100000", 6),
        primeDebtor.address,
        9999,
        ethers.utils.id("txhash-pool")
      );

      // Borrow $50,000 (50% utilization of the $100,000 pool deposit)
      await vaultLending.connect(borrower).borrowWithToken(invoiceId, usdcToken.address, ethers.utils.parseUnits("50000", 6));

      const [utilizationBps, apyBps] = await vaultLending.getPoolUtilizationAndApy(usdcToken.address);
      expect(utilizationBps).to.be.gt(0);
      expect(apyBps).to.be.gt(0);
    });
  });

  describe("3. Partial Repayments & Milestone Invoicing", function () {
    it("Should allow partial repayment and update active loan principal", async function () {
      const invoiceId = ethers.utils.id("INV-PARTIAL-001");
      const invoiceAmount = ethers.utils.parseUnits("50000", 6);
      const dueDateBlock = 9000;

      await vaultLending.connect(borrower)["registerInvoice(uint256,uint256,bytes,bytes,bytes,bytes32,bytes32,string,uint256,address,uint256,bytes32)"](
        1,
        1000,
        "0x",
        "0x",
        "0x",
        invoiceId,
        ethers.utils.id("commit-partial"),
        "ipfs://partial",
        invoiceAmount,
        primeDebtor.address,
        dueDateBlock,
        ethers.utils.id("txhash-partial")
      );

      const borrowAmount = ethers.utils.parseUnits("20000", 6); // $20,000 USDC
      const borrowTx = await vaultLending.connect(borrower).borrowWithToken(invoiceId, usdcToken.address, borrowAmount);
      const receipt = await borrowTx.wait();
      const loanId = receipt.events.find((e) => e.event === "LoanCreated").args.loanId;

      // Partial Repayment of $8,000 USDC
      const partialAmount = ethers.utils.parseUnits("8000", 6);
      await usdcToken.connect(borrower).approve(vaultLending.address, partialAmount);

      const partialTx = await vaultLending.connect(borrower).repayPartial(loanId, partialAmount);
      const partialReceipt = await partialTx.wait();

      const partialEvent = partialReceipt.events.find((e) => e.event === "LoanPartialRepaid");
      expect(partialEvent).to.not.be.undefined;
      expect(partialEvent.args.amountRepaid).to.equal(partialAmount);
      expect(partialEvent.args.remainingPrincipal).to.be.closeTo(
        ethers.utils.parseUnits("12000", 6),
        ethers.utils.parseUnits("1", 6)
      );

      const loan = await vaultLending.loans(loanId);
      expect(loan.principal).to.be.closeTo(
        ethers.utils.parseUnits("12000", 6),
        ethers.utils.parseUnits("1", 6)
      );
      expect(loan.status).to.equal(0); // Still Active
    });
  });

  describe("4. EIP-712 Gasless Borrowing (borrowWithPermit)", function () {
    it("Should allow a borrower to sign typed data and have a relayer execute gasless borrow", async function () {
      const invoiceId = ethers.utils.id("INV-EIP712-001");
      const invoiceAmount = ethers.utils.parseUnits("80000", 6);
      const dueDateBlock = 12000;

      await vaultLending.connect(borrower)["registerInvoice(uint256,uint256,bytes,bytes,bytes,bytes32,bytes32,string,uint256,address,uint256,bytes32)"](
        1,
        1000,
        "0x",
        "0x",
        "0x",
        invoiceId,
        ethers.utils.id("commit-eip712"),
        "ipfs://eip712",
        invoiceAmount,
        primeDebtor.address,
        dueDateBlock,
        ethers.utils.id("txhash-eip712")
      );

      const borrowAmount = ethers.utils.parseUnits("25000", 6);
      const nonce = await vaultLending.nonces(borrower.address);
      const currentBlock = await ethers.provider.getBlock("latest");
      const deadline = currentBlock.timestamp + 3600; // 1 hour relative to current block

      const domain = {
        name: "VaultLending",
        version: "2",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: vaultLending.address,
      };

      const types = {
        Borrow: [
          { name: "invoiceId", type: "bytes32" },
          { name: "tokenToBorrow", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "borrower", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        invoiceId: invoiceId,
        tokenToBorrow: usdcToken.address,
        amount: borrowAmount,
        borrower: borrower.address,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await borrower._signTypedData(domain, types, value);
      const sig = ethers.utils.splitSignature(signature);

      const borrowerInitialBalance = await usdcToken.balanceOf(borrower.address);

      // Relayer (keeper) submits the transaction on behalf of borrower
      await vaultLending.connect(keeper).borrowWithPermit(
        invoiceId,
        usdcToken.address,
        borrowAmount,
        borrower.address,
        deadline,
        sig.v,
        sig.r,
        sig.s
      );

      const borrowerFinalBalance = await usdcToken.balanceOf(borrower.address);
      expect(borrowerFinalBalance.sub(borrowerInitialBalance)).to.equal(borrowAmount);
    });

    it("Should reject expired EIP-712 permit signatures", async function () {
      const invoiceId = ethers.utils.id("INV-EXPIRED");
      const currentBlock = await ethers.provider.getBlock("latest");
      const expiredDeadline = currentBlock.timestamp - 100;

      await expect(
        vaultLending.connect(keeper).borrowWithPermit(
          invoiceId,
          usdcToken.address,
          1000,
          borrower.address,
          expiredDeadline,
          27,
          ethers.constants.HashZero,
          ethers.constants.HashZero
        )
      ).to.be.revertedWith("VaultLending: Permit signature expired");
    });
  });

  describe("5. EIP-712 Gasless Access Delegation on AccessRegistry", function () {
    it("Should allow data owner to delegate access gaslessly via grantAccessWithPermit", async function () {
      const dataId = ethers.utils.id("DATA-PRIVACY-712");
      const wrappedKey = ethers.utils.toUtf8Bytes("encrypted-symmetric-key-bytes-for-auditor");
      const nonce = await accessRegistry.nonces(owner.address);
      const currentBlock = await ethers.provider.getBlock("latest");
      const deadline = currentBlock.timestamp + 3600;

      const domain = {
        name: "AccessRegistry",
        version: "2",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: accessRegistry.address,
      };

      const types = {
        GrantAccess: [
          { name: "dataId", type: "bytes32" },
          { name: "grantee", type: "address" },
          { name: "wrappedKeyForGrantee", type: "bytes" },
          { name: "owner", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        dataId: dataId,
        grantee: auditor.address,
        wrappedKeyForGrantee: wrappedKey,
        owner: owner.address,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await owner._signTypedData(domain, types, value);
      const sig = ethers.utils.splitSignature(signature);

      // Relayer (keeper) submits permit to grant access to auditor
      const tx = await accessRegistry.connect(keeper).grantAccessWithPermit(
        dataId,
        auditor.address,
        wrappedKey,
        owner.address,
        deadline,
        sig.v,
        sig.r,
        sig.s
      );
      const receipt = await tx.wait();

      const permitEvent = receipt.events.find((e) => e.event === "AccessGrantedWithPermit");
      expect(permitEvent).to.not.be.undefined;
      expect(permitEvent.args.dataId).to.equal(dataId);
      expect(permitEvent.args.grantee).to.equal(auditor.address);
      expect(permitEvent.args.relayer).to.equal(keeper.address);

      // Verify auditor has access
      expect(await accessRegistry.hasAccess(dataId, auditor.address)).to.be.true;
      const storedKey = await accessRegistry.getWrappedKey(dataId, auditor.address);
      expect(storedKey).to.equal(ethers.utils.hexlify(wrappedKey));
    });
  });

  describe("6. Emergency Circuit Breaker (Pausable)", function () {
    it("Should allow owner to pause and unpause financial operations", async function () {
      expect(await vaultLending.paused()).to.be.false;

      // Pause contract
      await vaultLending.connect(owner).pause();
      expect(await vaultLending.paused()).to.be.true;

      // Operations should revert when paused
      await expect(
        vaultLending.connect(borrower).depositLiquidity(usdcToken.address, ethers.utils.parseUnits("100", 6))
      ).to.be.revertedWithCustomError(vaultLending, "EnforcedPause");

      // Non-owner cannot unpause
      await expect(
        vaultLending.connect(borrower).unpause()
      ).to.be.revertedWithCustomError(vaultLending, "OwnableUnauthorizedAccount");

      // Owner unpauses
      await vaultLending.connect(owner).unpause();
      expect(await vaultLending.paused()).to.be.false;
    });
  });
});
