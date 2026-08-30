// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StreakBadge
 * @notice Non-transferable (Soulbound) ERC-721 milestone badges awarded for verifiable habit streaks on Creditcoin.
 * Enforces non-transferability via ERC-721 _update hook.
 */
contract StreakBadge is ERC721, Ownable {
    uint256 private _nextTokenId;

    mapping(address => bool) public authorizedMinters;

    struct BadgeInfo {
        uint256 tokenId;
        address recipient;
        bytes32 streakId;
        uint256 milestoneDays;
        uint256 mintedAt;
    }

    mapping(uint256 => BadgeInfo) public badgeInfo;

    event MinterStatusUpdated(address indexed minter, bool authorized);
    event MilestoneBadgeMinted(address indexed recipient, uint256 indexed tokenId, bytes32 indexed streakId, uint256 milestoneDays);

    constructor() ERC721("StreakChain Soulbound Milestone Badge", "sSTRK") Ownable(msg.sender) {
        authorizedMinters[msg.sender] = true;
    }

    function setMinterStatus(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterStatusUpdated(minter, authorized);
    }

    /**
     * @notice Mints a milestone soulbound badge for a user streak
     */
    function mintMilestoneBadge(address to, bytes32 streakId, uint256 milestoneDays) external returns (uint256) {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "StreakBadge: Not authorized minter");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        badgeInfo[tokenId] = BadgeInfo({
            tokenId: tokenId,
            recipient: to,
            streakId: streakId,
            milestoneDays: milestoneDays,
            mintedAt: block.timestamp
        });

        emit MilestoneBadgeMinted(to, tokenId, streakId, milestoneDays);
        return tokenId;
    }

    /**
     * @dev Enforces Soulbound non-transferability.
     * Allows minting (from == address(0)) and burning (to == address(0)),
     * but blocks transfers between user accounts.
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("StreakBadge: Soulbound badge is non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
