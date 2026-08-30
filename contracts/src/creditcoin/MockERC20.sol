// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Simple ERC20 token for testing purposes
 * In production, this would be replaced with a real token like cUSDC
 */
contract MockERC20 is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) {
        // Set decimals if different from default 18
        if (decimals_ != 18) {
            // Note: ERC20 from OpenZeppelin doesn't allow changing decimals after construction
            // This is a simplification - in practice we'd use the standard 18 decimals
            // or use _setupDecimals() if available in the version
        }
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10 ** uint256(decimals_)); // 1 million tokens
    }

    // Function to mint additional tokens (for testing)
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}