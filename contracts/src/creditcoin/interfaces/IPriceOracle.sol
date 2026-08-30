// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IPriceOracle
 * @notice Interface for flash-loan-resistant multi-asset price feed adapter with freshness validation
 */
interface IPriceOracle {
    /**
     * @notice Returns asset price in USD scaled to 8 decimals
     * @param asset The address of the asset (or address(0) for native ETH)
     * @return price Price scaled to 1e8 (e.g., $2700.00 = 270000000000)
     * @return updatedAt Timestamp when the price was last updated
     */
    function getAssetPrice(address asset) external view returns (uint256 price, uint256 updatedAt);

    /**
     * @notice Checks if the price is fresh within a given staleness threshold
     * @param asset The address of the asset
     * @param maxStaleness Maximum allowable time elapsed since update (in seconds)
     */
    function isPriceFresh(address asset, uint256 maxStaleness) external view returns (bool);
}
