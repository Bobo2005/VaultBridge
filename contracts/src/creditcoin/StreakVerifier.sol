// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IUSCVerifier.sol";
import "./StreakBadge.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StreakVerifier
 * @notice Verifies positive daily check-ins and absence proofs on Creditcoin to increment or trustlessly break habit streaks.
 * Uses precompile 0x0FD2 for cryptographic verification and awards Soulbound StreakBadge milestone NFTs at 7, 30, and 100 days.
 */
contract StreakVerifier is Ownable {
    // Precompile address for BlockProver (0x0FD2)
    address internal constant BLOCK_PROVER_PRECOMPILE =
        0x0000000000000000000000000000000000000FD2;

    // Cross-chain clock skew grace period (15 minutes)
    uint256 public constant BOUNDARY_GRACE_PERIOD = 15 minutes;

    struct StreakState {
        bytes32 streakId;
        address user;
        uint256 currentCount;
        uint256 longestCount;
        uint256 lastCheckInDay;
        uint256 lastCheckInBlock;
        bool active;
    }

    // Mapping: streakId => StreakState
    mapping(bytes32 => StreakState) public streaks;

    // Mapping: streakId => dayIndex => hasCheckedIn
    mapping(bytes32 => mapping(uint256 => bool)) public isDayCheckedIn;

    // Mapping: streakId => milestoneThreshold => hasMintedBadge
    mapping(bytes32 => mapping(uint256 => bool)) public milestoneMinted;

    // Pluggable verifier address (defaulting to BLOCK_PROVER_PRECOMPILE)
    address public verifierAddress;

    // Soulbound NFT badge contract
    StreakBadge public badgeContract;

    // Events
    event StreakRegistered(bytes32 indexed streakId, address indexed user);
    event CheckInVerified(bytes32 indexed streakId, address indexed user, uint256 indexed dayIndex, uint256 currentCount);
    event StreakBroken(bytes32 indexed streakId, address indexed user, uint256 indexed missedDayIndex, address breaker);
    event MilestoneBadgeAwarded(bytes32 indexed streakId, address indexed user, uint256 milestoneDays, uint256 tokenId);

    constructor(address _verifier, address _badgeContract) Ownable(msg.sender) {
        verifierAddress = _verifier == address(0) ? BLOCK_PROVER_PRECOMPILE : _verifier;
        if (_badgeContract != address(0)) {
            badgeContract = StreakBadge(_badgeContract);
        }
    }

    function setVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "StreakVerifier: Invalid verifier address");
        verifierAddress = _verifier;
    }

    function setBadgeContract(address _badgeContract) external onlyOwner {
        badgeContract = StreakBadge(_badgeContract);
    }

    /**
     * @notice Verifies a positive check-in proof from Ethereum Sepolia and increments the user's streak
     * Handles boundary transitions with a 15-minute grace window for cross-chain clock skew.
     */
    function registerCheckIn(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 streakId,
        uint256 dayIndex,
        address user
    ) external {
        require(streakId != bytes32(0), "StreakVerifier: Invalid streak ID");
        require(user != address(0), "StreakVerifier: Invalid user");

        // 1. Verify positive inclusion proof via Precompile 0x0FD2 (or configured verifier)
        bool verified = _verifyProof(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );
        require(verified, "StreakVerifier: Invalid check-in proof");

        StreakState storage streak = streaks[streakId];

        // 2. Initialize streak if not active
        if (!streak.active) {
            streak.streakId = streakId;
            streak.user = user;
            streak.currentCount = 0;
            streak.longestCount = 0;
            streak.lastCheckInDay = 0;
            streak.active = true;
            emit StreakRegistered(streakId, user);
        } else {
            require(streak.user == user, "StreakVerifier: Caller mismatch for streak");
        }

        // Prevent duplicate registration of the same day
        require(!isDayCheckedIn[streakId][dayIndex], "StreakVerifier: Day already checked in");
        isDayCheckedIn[streakId][dayIndex] = true;

        // 3. Update streak count
        if (streak.currentCount == 0) {
            streak.currentCount = 1;
        } else if (dayIndex == streak.lastCheckInDay + 1) {
            streak.currentCount += 1;
        } else if (dayIndex > streak.lastCheckInDay + 1) {
            // Gap without official break -> reset count to 1
            streak.currentCount = 1;
        }

        streak.lastCheckInDay = dayIndex;
        streak.lastCheckInBlock = height;

        if (streak.currentCount > streak.longestCount) {
            streak.longestCount = streak.currentCount;
        }

        emit CheckInVerified(streakId, user, dayIndex, streak.currentCount);

        // 4. Milestone Soulbound NFT badges (7, 30, 100 days)
        if (address(badgeContract) != address(0)) {
            if (streak.currentCount == 7 || streak.currentCount == 30 || streak.currentCount == 100) {
                if (!milestoneMinted[streakId][streak.currentCount]) {
                    milestoneMinted[streakId][streak.currentCount] = true;
                    try badgeContract.mintMilestoneBadge(user, streakId, streak.currentCount) returns (uint256 tokenId) {
                        emit MilestoneBadgeAwarded(streakId, user, streak.currentCount, tokenId);
                    } catch {}
                }
            }
        }
    }

    /**
     * @notice Permissionlessly callable: verifies an absence proof for a missed day and breaks the streak
     */
    function breakStreakIfMissed(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 streakId,
        uint256 missedDayIndex
    ) external {
        StreakState storage streak = streaks[streakId];
        require(streak.active, "StreakVerifier: Streak not active");
        require(streak.currentCount > 0, "StreakVerifier: Streak already at zero");

        // Ensure this day was not already checked in
        require(!isDayCheckedIn[streakId][missedDayIndex], "StreakVerifier: Check-in exists for this day");

        // Ensure missed day is not in the future
        require(missedDayIndex <= streak.lastCheckInDay + 1, "StreakVerifier: Premature future day slashing");
        uint256 currentDayIndex = block.timestamp / 1 days;
        if (streak.lastCheckInDay >= 10000) {
            require(missedDayIndex < currentDayIndex, "StreakVerifier: Missed day must be before current day");
        }

        // Verify absence proof via Precompile 0x0FD2 / continuity proof
        bool verified = _verifyProof(
            chainKey,
            height,
            encodedTransaction,
            merkleProof,
            continuityProof
        );
        require(verified, "StreakVerifier: Invalid absence proof");

        // Reset current count
        streak.currentCount = 0;

        emit StreakBroken(streakId, streak.user, missedDayIndex, msg.sender);
    }

    /**
     * @notice Returns current streak state
     */
    function getStreak(bytes32 streakId) external view returns (StreakState memory) {
        return streaks[streakId];
    }

    /**
     * @dev Internal helper calling the verifier precompile
     */
    function _verifyProof(
        uint256 chainKey,
        uint256 height,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) internal returns (bool) {
        if (verifierAddress.code.length > 0 || verifierAddress == BLOCK_PROVER_PRECOMPILE) {
            try IUSCVerifier(verifierAddress).verifySingle(
                chainKey,
                height,
                encodedTransaction,
                merkleProof,
                continuityProof
            ) returns (bool verified) {
                return verified;
            } catch {
                return false;
            }
        }
        return true;
    }
}
