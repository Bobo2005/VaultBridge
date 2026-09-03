// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AccessRegistry
 * @notice Privacy Layer contract managing wrapped symmetric keys and address-scoped access permissions
 * with native EIP-712 gasless delegation support per VaultBridge V2 Architecture §2.3
 */
contract AccessRegistry is EIP712 {
    // EIP-712 TypeHash for gasless access delegation
    bytes32 public constant GRANT_ACCESS_TYPEHASH =
        keccak256("GrantAccess(bytes32 dataId,address grantee,bytes wrappedKeyForGrantee,address owner,uint256 nonce,uint256 deadline)");

    // Events
    event DataRegistered(bytes32 indexed dataId, address indexed owner);
    event AccessGranted(bytes32 indexed dataId, address indexed owner, address indexed grantee);
    event AccessRevoked(bytes32 indexed dataId, address indexed owner, address indexed grantee);
    event AccessGrantedWithPermit(bytes32 indexed dataId, address indexed owner, address indexed grantee, address relayer);

    // Mappings: dataId => grantee => wrappedKey
    mapping(bytes32 => mapping(address => bytes)) private _wrappedKeys;
    mapping(bytes32 => address) public dataOwners;

    // Nonces for EIP-712 permit delegation: owner => nonce
    mapping(address => uint256) public nonces;

    modifier onlyDataOwner(bytes32 dataId) {
        address owner = dataOwners[dataId];
        require(owner != address(0), "AccessRegistry: Data not registered");
        require(msg.sender == owner, "AccessRegistry: Only owner can manage access");
        _;
    }

    constructor() EIP712("AccessRegistry", "2") {}

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
     * @notice Grants encrypted access gaslessly via EIP-712 typed signature delegation
     * @param dataId Unique identifier for the data
     * @param grantee Address of the grantee receiving access
     * @param wrappedKeyForGrantee Key wrapped with grantee's public key
     * @param owner Address of the data owner who signed the permit
     * @param deadline Unix timestamp deadline until which the permit signature is valid
     * @param v ECDSA recovery byte
     * @param r ECDSA output r
     * @param s ECDSA output s
     */
    function grantAccessWithPermit(
        bytes32 dataId,
        address grantee,
        bytes calldata wrappedKeyForGrantee,
        address owner,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp <= deadline, "AccessRegistry: Signature expired");
        require(dataId != bytes32(0), "AccessRegistry: Invalid data ID");
        require(grantee != address(0), "AccessRegistry: Invalid grantee address");
        require(owner != address(0), "AccessRegistry: Invalid owner address");
        require(wrappedKeyForGrantee.length > 0, "AccessRegistry: Empty wrapped key");

        bytes32 structHash = keccak256(
            abi.encode(
                GRANT_ACCESS_TYPEHASH,
                dataId,
                grantee,
                keccak256(wrappedKeyForGrantee),
                owner,
                nonces[owner]++,
                deadline
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == owner, "AccessRegistry: Invalid permit signature");

        // If dataId not registered yet, signed owner becomes the data owner
        if (dataOwners[dataId] == address(0)) {
            dataOwners[dataId] = owner;
            emit DataRegistered(dataId, owner);
        } else {
            require(owner == dataOwners[dataId], "AccessRegistry: Only owner can grant access");
        }

        _wrappedKeys[dataId][grantee] = wrappedKeyForGrantee;
        emit AccessGranted(dataId, owner, grantee);
        emit AccessGrantedWithPermit(dataId, owner, grantee, msg.sender);
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
