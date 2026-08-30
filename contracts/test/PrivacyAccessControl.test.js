const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivacyAccessControl Matrix Tests", function () {
  let accessRegistry;
  let owner, auditor, lender, randomUser;

  const invoiceDataId = ethers.utils.id("INV-SECRET-770");
  const ownerWrappedKey = ethers.utils.toUtf8Bytes("owner_encrypted_key_bundle");
  const auditorWrappedKey = ethers.utils.toUtf8Bytes("auditor_encrypted_key_bundle");
  const lenderWrappedKey = ethers.utils.toUtf8Bytes("lender_encrypted_key_bundle");

  beforeEach(async function () {
    [owner, auditor, lender, randomUser] = await ethers.getSigners();

    const AccessRegistry = await ethers.getContractFactory("AccessRegistry");
    accessRegistry = await AccessRegistry.deploy();
    await accessRegistry.deployed();

    // Owner registers invoice commitment
    await accessRegistry.connect(owner).registerData(invoiceDataId, ownerWrappedKey);
  });

  it("Scenario 1: Owner can always read their wrapped key", async function () {
    const key = await accessRegistry.getWrappedKey(invoiceDataId, owner.address);
    expect(ethers.utils.toUtf8String(key)).to.equal("owner_encrypted_key_bundle");
    expect(await accessRegistry.hasAccess(invoiceDataId, owner.address)).to.be.true;
  });

  it("Scenario 2: Granted address can read key after grant", async function () {
    // Before grant
    expect(await accessRegistry.getWrappedKey(invoiceDataId, auditor.address)).to.equal("0x");

    // Grant access to auditor
    await accessRegistry.connect(owner).grantAccess(invoiceDataId, auditor.address, auditorWrappedKey);

    // After grant
    const key = await accessRegistry.getWrappedKey(invoiceDataId, auditor.address);
    expect(ethers.utils.toUtf8String(key)).to.equal("auditor_encrypted_key_bundle");
    expect(await accessRegistry.hasAccess(invoiceDataId, auditor.address)).to.be.true;
  });

  it("Scenario 3: Revoked address cannot read after revoke", async function () {
    // Grant access to lender
    await accessRegistry.connect(owner).grantAccess(invoiceDataId, lender.address, lenderWrappedKey);
    expect(await accessRegistry.hasAccess(invoiceDataId, lender.address)).to.be.true;

    // Revoke access
    await accessRegistry.connect(owner).revokeAccess(invoiceDataId, lender.address);

    // After revoke
    const key = await accessRegistry.getWrappedKey(invoiceDataId, lender.address);
    expect(key).to.equal("0x");
    expect(await accessRegistry.hasAccess(invoiceDataId, lender.address)).to.be.false;
  });

  it("Scenario 4: Never-granted address gets nothing", async function () {
    const key = await accessRegistry.getWrappedKey(invoiceDataId, randomUser.address);
    expect(key).to.equal("0x");
    expect(await accessRegistry.hasAccess(invoiceDataId, randomUser.address)).to.be.false;
  });
});
