// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AccessRegistry.sol";

/**
 * @title AccessRegistryTest
 * @notice Solidity test contract for AccessRegistry.sol
 */
contract AccessRegistryTest {
    AccessRegistry internal registry;

    function setUp() public {
        registry = new AccessRegistry();
    }

    function testOwnerCanRegisterAndRead() public {
        bytes32 dataId = keccak256(abi.encodePacked("INV-TEST-001"));
        bytes memory key = bytes("ownerKey");

        registry.registerData(dataId, key);
        bytes memory retrieved = registry.getWrappedKey(dataId, address(this));
        require(keccak256(retrieved) == keccak256(key), "Key mismatch");
    }

    function testGrantAndRevoke() public {
        bytes32 dataId = keccak256(abi.encodePacked("INV-TEST-002"));
        address grantee = address(0x123);
        bytes memory granteeKey = bytes("granteeKey");

        registry.registerData(dataId, bytes("ownerKey"));
        registry.grantAccess(dataId, grantee, granteeKey);

        bytes memory retrieved = registry.getWrappedKey(dataId, grantee);
        require(keccak256(retrieved) == keccak256(granteeKey), "Grantee key mismatch");

        registry.revokeAccess(dataId, grantee);
        bytes memory afterRevoke = registry.getWrappedKey(dataId, grantee);
        require(afterRevoke.length == 0, "Access was not revoked");
    }
}
