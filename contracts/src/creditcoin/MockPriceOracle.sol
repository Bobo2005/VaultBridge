// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPriceOracle
 * @dev Mock oracle price feed adapter with freshness checks and configurable decimals
 */
contract MockPriceOracle is IPriceOracle, Ownable {
    struct PriceData {
        uint256 price; // Scaled to 1e8
        uint256 updatedAt;
    }

    mapping(address => PriceData) public prices;
    uint256 public defaultStalenessPeriod = 3600; // 1 hour

    event PriceUpdated(address indexed asset, uint256 price, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        // Set default ETH price to $2,700 (8 decimals: 2700 * 1e8)
        prices[address(0)] = PriceData({
            price: 2700 * 1e8,
            updatedAt: block.timestamp
        });
    }

    function setAssetPrice(address asset, uint256 price) external onlyOwner {
        require(price > 0, "Price must be > 0");
        prices[asset] = PriceData({
            price: price,
            updatedAt: block.timestamp
        });
        emit PriceUpdated(asset, price, block.timestamp);
    }

    function setAssetPriceWithTimestamp(address asset, uint256 price, uint256 timestamp) external onlyOwner {
        prices[asset] = PriceData({
            price: price,
            updatedAt: timestamp
        });
        emit PriceUpdated(asset, price, timestamp);
    }

    function getAssetPrice(address asset) external view override returns (uint256 price, uint256 updatedAt) {
        PriceData memory data = prices[asset];
        require(data.price > 0, "Price feed not found");
        return (data.price, data.updatedAt);
    }

    function isPriceFresh(address asset, uint256 maxStaleness) public view override returns (bool) {
        PriceData memory data = prices[asset];
        if (data.price == 0) return false;
        return (block.timestamp - data.updatedAt) <= maxStaleness;
    }
}
