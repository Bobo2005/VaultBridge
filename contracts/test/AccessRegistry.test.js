const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessRegistry Contract Tests", function () {
  let accessRegistry;
  let owner, grantee1, grantee2, attacker;

  const dataId = ethers.utils.id("INV-2026-001");
  const ownerKeyBytes = ethers.utils.toUtf8Bytes("wrappedKeyForOwner123");
  const grantee1KeyBytes = ethers.utils.toUtf8Bytes("wrappedKeyForGrantee1");

  beforeEach(async function () {
    [owner, grantee1, grantee2, attacker] = await ethers.getSigners();

    const AccessRegistryFactory = await ethers.getContractFactory("AccessRegistry");
    accessRegistry = await AccessRegistryFactory.deploy();
    await accessRegistry.deployed();
  });

  describe("Registration & Ownership", function () {
    it("should allow data owner to register data with initial wrapped key", async function () {
      await expect(accessRegistry.connect(owner).registerData(dataId, ownerKeyBytes))
        .to.emit(accessRegistry, "DataRegistered")
        .withArgs(dataId, owner.address);

      expect(await accessRegistry.dataOwners(dataId)).to.equal(owner.address);
      const retrieved = await accessRegistry.getWrappedKey(dataId, owner.address);
      expect(ethers.utils.toUtf8String(retrieved)).to.equal("wrappedKeyForOwner123");
    });

    it("should revert if re-registering an already registered dataId", async function () {
      await accessRegistry.connect(owner).registerData(dataId, ownerKeyBytes);
      await expect(
        accessRegistry.connect(attacker).registerData(dataId, ethers.utils.toUtf8Bytes("fakeKey"))
      ).to.be.revertedWith("AccessRegistry: Data already registered");
    });
  });

  describe("Grant & Revoke Access", function () {
    beforeEach(async function () {
      await accessRegistry.connect(owner).registerData(dataId, ownerKeyBytes);
    });

    it("should allow owner to grant access to a grantee", async function () {
      await expect(
        accessRegistry.connect(owner).grantAccess(dataId, grantee1.address, grantee1KeyBytes)
      )
        .to.emit(accessRegistry, "AccessGranted")
        .withArgs(dataId, owner.address, grantee1.address);

      expect(await accessRegistry.hasAccess(dataId, grantee1.address)).to.be.true;
      const key = await accessRegistry.getWrappedKey(dataId, grantee1.address);
      expect(ethers.utils.toUtf8String(key)).to.equal("wrappedKeyForGrantee1");
    });

    it("should revert if non-owner attempts to grant access", async function () {
      await expect(
        accessRegistry.connect(attacker).grantAccess(dataId, grantee2.address, ethers.utils.toUtf8Bytes("badKey"))
      ).to.be.revertedWith("AccessRegistry: Only owner can grant access");
    });

    it("should allow owner to revoke access from a grantee", async function () {
      await accessRegistry.connect(owner).grantAccess(dataId, grantee1.address, grantee1KeyBytes);
      expect(await accessRegistry.hasAccess(dataId, grantee1.address)).to.be.true;

      await expect(accessRegistry.connect(owner).revokeAccess(dataId, grantee1.address))
        .to.emit(accessRegistry, "AccessRevoked")
        .withArgs(dataId, owner.address, grantee1.address);

      expect(await accessRegistry.hasAccess(dataId, grantee1.address)).to.be.false;
      const key = await accessRegistry.getWrappedKey(dataId, grantee1.address);
      expect(key).to.equal("0x");
    });

    it("should revert if non-owner attempts to revoke access", async function () {
      await accessRegistry.connect(owner).grantAccess(dataId, grantee1.address, grantee1KeyBytes);

      await expect(
        accessRegistry.connect(attacker).revokeAccess(dataId, grantee1.address)
      ).to.be.revertedWith("AccessRegistry: Only owner can manage access");
    });

    it("should return empty bytes for never-granted address", async function () {
      const key = await accessRegistry.getWrappedKey(dataId, grantee2.address);
      expect(key).to.equal("0x");
      expect(await accessRegistry.hasAccess(dataId, grantee2.address)).to.be.false;
    });
  });
});
