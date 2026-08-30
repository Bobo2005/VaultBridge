// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AccessRegistry.sol";

/**
 * @title PrivacyAccessControlTest
 * @notice Solidity test contract verifying privacy access control matrix
 */
contract PrivacyAccessControlTest {
    AccessRegistry internal registry;

    function setUp() public {
        registry = new AccessRegistry();
    }

    function testPrivacyAccessMatrix() public {
        bytes32 dataId = keccak256(abi.encodePacked("INV-PRIVACY-001"));
        address owner = address(this);
        address grantee = address(0x456);
        address randomUser = address(0x789);

        // 1. Owner registers
        registry.registerData(dataId, bytes("ownerSecretKey"));
        require(registry.getWrappedKey(dataId, owner).length > 0, "Owner cannot read");

        // 2. Random user gets nothing
        require(registry.getWrappedKey(dataId, randomUser).length == 0, "Random user got access");

        // 3. Grant access to grantee
        registry.grantAccess(dataId, grantee, bytes("granteeSecretKey"));
        require(registry.getWrappedKey(dataId, grantee).length > 0, "Grantee cannot read");

        // 4. Revoke access
        registry.revokeAccess(dataId, grantee);
        require(registry.getWrappedKey(dataId, grantee).length == 0, "Grantee still has access after revoke");
    }
}
