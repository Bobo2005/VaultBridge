// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IUSCVerifier.sol";

/**
 * @title MockStreakPrecompile
 * @notice Mock implementation of Precompile 0x0FD2 for unit tests
 */
contract MockStreakPrecompile is IUSCVerifier {
    bool public shouldPass = true;

    function setShouldPass(bool _pass) external {
        shouldPass = _pass;
    }

    function verifySingle(
        uint256,
        uint256,
        bytes calldata,
        bytes calldata,
        bytes calldata
    ) external view override returns (bool) {
        return shouldPass;
    }

    function verifyBatch(
        uint256,
        uint256[] calldata,
        bytes[] calldata,
        bytes[] calldata,
        bytes calldata
    ) external view override returns (bool) {
        return shouldPass;
    }
}
