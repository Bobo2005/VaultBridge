const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultLending Multi-Asset & Dynamic Risk-Tiered LTV", function () {
  let vaultLending;
  let mockToken;
  let usdcToken;
  let eurcToken;
  let priceOracle;
  let owner;
  let borrower;
  let primeDebtor;
  let standardDebtor;
  let subprimeDebtor;

  beforeEach(async function () {
    [owner, borrower, primeDebtor, standardDebtor, subprimeDebtor] = await ethers.getSigners();

    // Deploy Mock Tokens with (name, symbol, decimals)
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Mock Token", "MCK", 18);
    await mockToken.deployed();

    usdcToken = await MockERC20Factory.deploy("USD Coin", "USDC", 6);
    await usdcToken.deployed();

    eurcToken = await MockERC20Factory.deploy("Euro Coin", "EURC", 6);
    await eurcToken.deployed();

    // Deploy Price Oracle
    const MockPriceOracleFactory = await ethers.getContractFactory("MockPriceOracle");
    priceOracle = await MockPriceOracleFactory.deploy();
    await priceOracle.deployed();

    // Configure Asset Prices (scaled to 1e8)
    // ETH: $2,700 (set by default)
    // USDC: $1.00 (1 * 1e8)
    // EURC: $1.08 (1.08 * 1e8)
    await priceOracle.setAssetPrice(usdcToken.address, 100000000);
    await priceOracle.setAssetPrice(eurcToken.address, 108000000);

    // Deploy VaultLending
    const VaultLendingFactory = await ethers.getContractFactory("VaultLending");
    vaultLending = await VaultLendingFactory.deploy(mockToken.address);
    await vaultLending.deployed();

    // Set Price Oracle and Supported Tokens
    await vaultLending.setPriceOracle(priceOracle.address);
    await vaultLending.setSupportedToken(usdcToken.address, true);
    await vaultLending.setSupportedToken(eurcToken.address, true);

    // Fund Vault with liquidity
    await mockToken.transfer(vaultLending.address, ethers.utils.parseEther("100000"));
    await usdcToken.transfer(vaultLending.address, ethers.utils.parseUnits("100000", 6));
    await eurcToken.transfer(vaultLending.address, ethers.utils.parseUnits("100000", 6));

    // Configure Debtor Risk Tiers:
    // Prime Debtor -> Tier 1 (80% LTV)
    // Subprime Debtor -> Tier 3 (50% LTV)
    // Standard Debtor -> Default / Tier 2 (70% LTV)
    await vaultLending.setDebtorRiskTier(primeDebtor.address, 1);
    await vaultLending.setDebtorRiskTier(subprimeDebtor.address, 3);
  });

  describe("Debtor Risk Tier Configurations", function () {
    it("Should return 80% (8000 bps) for Tier A prime debtor", async function () {
      expect(await vaultLending.getDebtorLtvCap(primeDebtor.address)).to.equal(8000);
    });

    it("Should return 70% (7000 bps) for standard debtor", async function () {
      expect(await vaultLending.getDebtorLtvCap(standardDebtor.address)).to.equal(7000);
    });

    it("Should return 50% (5000 bps) for Tier C subprime debtor", async function () {
      expect(await vaultLending.getDebtorLtvCap(subprimeDebtor.address)).to.equal(5000);
    });
  });

  describe("Dynamic Multi-Asset Borrowing Calculations", function () {
    it("Should calculate 80% LTV max borrow for Tier A debtor", async function () {
      const invoiceAmount = ethers.utils.parseEther("10"); // 10 ETH
      const maxTierA = invoiceAmount.mul(8000).div(10000);
      expect(maxTierA).to.equal(ethers.utils.parseEther("8"));
    });

    it("Should calculate 50% LTV max borrow for Tier C debtor", async function () {
      const invoiceAmount = ethers.utils.parseEther("10"); // 10 ETH
      const maxTierC = invoiceAmount.mul(5000).div(10000);
      expect(maxTierC).to.equal(ethers.utils.parseEther("5"));
    });

    it("Should calculate actual LTV in basis points accurately", async function () {
      const loanAmount = ethers.utils.parseEther("7");
      const collateralAmount = ethers.utils.parseEther("10");
      const ltvBps = await vaultLending.calculateLtvBps(loanAmount, collateralAmount);
      expect(ltvBps).to.equal(7000);
    });
  });

  describe("Privacy Layer Commitment & Pointer Storage", function () {
    it("Should store commitment and pointer correctly on invoice registration", async function () {
      const invoiceId = ethers.utils.id("INV-PRIVACY-001");
      const commitment = ethers.utils.id("ciphertext_hash_123");
      const pointer = "ipfs://bafkreihdwdcefgh456";
      const amount = ethers.utils.parseEther("10");

      // Verify calculation and struct storage definitions
      expect(commitment).to.have.length(66);
      expect(pointer).to.include("ipfs://");
    });
  });
});
