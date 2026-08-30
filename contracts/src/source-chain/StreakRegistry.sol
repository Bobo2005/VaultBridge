// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StreakRegistry
 * @notice Source chain (Ethereum Sepolia) registrar recording daily habit check-ins for StreakChain.
 * Emits CheckedIn(streakId, dayIndex, timestamp) which the Creditcoin relayer and precompile 0x0FD2 attest trustlessly per VaultBridge V2 Architecture §3.2.
 */
contract StreakRegistry {
    // Events
    event StreakCreated(bytes32 indexed streakId, address indexed creator, string title, uint256 startTimestamp);
    event CheckedIn(bytes32 indexed streakId, uint256 indexed dayIndex, uint256 timestamp);

    // Structs
    struct Streak {
        bytes32 id;
        address owner;
        string title;
        uint256 startTimestamp;
        uint256 lastCheckInDay;
        uint256 totalCheckIns;
        bool active;
    }

    // Mappings: streakId => dayIndex => hasCheckedIn
    mapping(bytes32 => mapping(uint256 => bool)) public hasCheckedIn;
    mapping(bytes32 => Streak) public streaks;

    /**
     * @notice Registers a new habit streak
     * @param streakId Unique identifier for the habit streak
     * @param title Title/description of the habit (e.g. "100 Days of Solidity")
     */
    function createStreak(bytes32 streakId, string calldata title) external {
        require(streakId != bytes32(0), "StreakRegistry: Invalid streak ID");
        require(!streaks[streakId].active, "StreakRegistry: Streak already exists");

        streaks[streakId] = Streak({
            id: streakId,
            owner: msg.sender,
            title: title,
            startTimestamp: block.timestamp,
            lastCheckInDay: 0,
            totalCheckIns: 0,
            active: true
        });

        emit StreakCreated(streakId, msg.sender, title, block.timestamp);
    }

    /**
     * @notice Daily habit check-in for a streak
     * @param streakId Unique identifier for the habit streak
     */
    function checkIn(bytes32 streakId) external {
        Streak storage streak = streaks[streakId];
        // If streak not registered yet, auto-register it with caller as owner
        if (!streak.active) {
            streak.id = streakId;
            streak.owner = msg.sender;
            streak.title = "Daily Habit Streak";
            streak.startTimestamp = block.timestamp;
            streak.active = true;
            emit StreakCreated(streakId, msg.sender, "Daily Habit Streak", block.timestamp);
        }

        uint256 dayIndex = (block.timestamp - streak.startTimestamp) / 1 days;

        require(!hasCheckedIn[streakId][dayIndex], "StreakRegistry: Already checked in today");

        hasCheckedIn[streakId][dayIndex] = true;
        streak.lastCheckInDay = dayIndex;
        streak.totalCheckIns += 1;

        emit CheckedIn(streakId, dayIndex, block.timestamp);
    }

    /**
     * @notice Checks if a streak has checked in on a specific day
     */
    function isCheckedIn(bytes32 streakId, uint256 dayIndex) external view returns (bool) {
        return hasCheckedIn[streakId][dayIndex];
    }
}
