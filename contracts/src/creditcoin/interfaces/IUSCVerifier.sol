// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUSCVerifier {
    // Verifies a single transaction proof on-chain
    // Returns true if verification succeeds, false otherwise
    function verifySingle(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) external returns (bool);

    // Verifies a batch of transaction proofs on-chain using a shared continuity proof
    // Returns true if all verifications succeed, false otherwise
    function verifyBatch(
        uint256 chainKey,
        uint256[] calldata heights,
        bytes[] calldata encodedTransactions,
        bytes[] calldata merkleProofs,
        bytes calldata sharedProof
    ) external returns (bool);
}