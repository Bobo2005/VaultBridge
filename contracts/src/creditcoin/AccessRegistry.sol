// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessRegistry
 * @notice Privacy Layer contract managing wrapped symmetric keys and address-scoped access permissions
 * per VaultBridge V2 Architecture §2.3
 */
contract AccessRegistry {
    // Events
    event DataRegistered(bytes32 indexed dataId, address indexed owner);
    event AccessGranted(bytes32 indexed dataId, address indexed owner, address indexed grantee);
    event AccessRevoked(bytes32 indexed dataId, address indexed owner, address indexed grantee);

    // Mappings: dataId => grantee => wrappedKey
    mapping(bytes32 => mapping(address => bytes)) private _wrappedKeys;
    mapping(bytes32 => address) public dataOwners;

    modifier onlyDataOwner(bytes32 dataId) {
        address owner = dataOwners[dataId];
        require(owner != address(0), "AccessRegistry: Data not registered");
        require(msg.sender == owner, "AccessRegistry: Only owner can manage access");
        _;
    }

    /**
     * @notice Registers a new dataset with the owner's initial wrapped key
     * @param dataId Unique identifier for the encrypted data (e.g. invoiceId)
     * @param ownerWrappedKey Key wrapped with owner's public key
     */
    function registerData(bytes32 dataId, bytes calldata ownerWrappedKey) external {
        require(dataId != bytes32(0), "AccessRegistry: Invalid data ID");
        require(dataOwners[dataId] == address(0), "AccessRegistry: Data already registered");
        require(ownerWrappedKey.length > 0, "AccessRegistry: Empty wrapped key");

        dataOwners[dataId] = msg.sender;
        _wrappedKeys[dataId][msg.sender] = ownerWrappedKey;

        emit DataRegistered(dataId, msg.sender);
    }

    /**
     * @notice Grants encrypted access to a grantee by storing the symmetric key wrapped for them
     * @param dataId Unique identifier for the data
     * @param grantee Address of the grantee receiving access
     * @param wrappedKeyForGrantee Key wrapped with grantee's public key
     */
    function grantAccess(
        bytes32 dataId,
        address grantee,
        bytes calldata wrappedKeyForGrantee
    ) external {
        require(dataId != bytes32(0), "AccessRegistry: Invalid data ID");
        require(grantee != address(0), "AccessRegistry: Invalid grantee address");
        require(wrappedKeyForGrantee.length > 0, "AccessRegistry: Empty wrapped key");

        // If dataId not registered yet, caller becomes the owner
        if (dataOwners[dataId] == address(0)) {
            dataOwners[dataId] = msg.sender;
            emit DataRegistered(dataId, msg.sender);
        } else {
            require(msg.sender == dataOwners[dataId], "AccessRegistry: Only owner can grant access");
        }

        _wrappedKeys[dataId][grantee] = wrappedKeyForGrantee;
        emit AccessGranted(dataId, msg.sender, grantee);
    }

    /**
     * @notice Revokes a grantee's access to the dataset
     * @param dataId Unique identifier for the data
     * @param grantee Address whose access is revoked
     */
    function revokeAccess(bytes32 dataId, address grantee) external onlyDataOwner(dataId) {
        require(grantee != address(0), "AccessRegistry: Invalid grantee address");
        require(grantee != dataOwners[dataId], "AccessRegistry: Cannot revoke owner access");
        require(_wrappedKeys[dataId][grantee].length > 0, "AccessRegistry: Grantee has no access");

        delete _wrappedKeys[dataId][grantee];
        emit AccessRevoked(dataId, msg.sender, grantee);
    }

    /**
     * @notice Retrieves the wrapped key for the requester
     * @param dataId Unique identifier for the data
     * @param requester Address requesting the wrapped key
     * @return Wrapped key bytes if authorized (owner or grantee), or empty bytes if unauthorized
     */
    function getWrappedKey(bytes32 dataId, address requester) external view returns (bytes memory) {
        return _wrappedKeys[dataId][requester];
    }

    /**
     * @notice Checks if an address currently has access to the data
     */
    function hasAccess(bytes32 dataId, address requester) external view returns (bool) {
        return _wrappedKeys[dataId][requester].length > 0;
    }
}
