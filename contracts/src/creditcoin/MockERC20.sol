// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Simple ERC20 token for testing purposes
 * In production, this would be replaced with a real token like cUSDC
 */
contract MockERC20 is ERC20 {
    uint8 private _customDecimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) {
        _customDecimals = decimals_;
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10 ** uint256(decimals_)); // 1 million tokens
    }

    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    // Function to mint additional tokens (for testing)
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Public faucet method allowing users to claim testnet tokens
    function faucet(address to, uint256 amount) external {
        uint256 maxAmount = 10000 * (10 ** uint256(decimals()));
        require(amount <= maxAmount, "Faucet limit exceeded (max 10,000 tokens)");
        _mint(to, amount);
    }
}