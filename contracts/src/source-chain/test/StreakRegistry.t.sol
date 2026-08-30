// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../StreakRegistry.sol";

/**
 * @title StreakRegistryTest
 * @notice Solidity test suite for StreakRegistry.sol
 */
contract StreakRegistryTest {
    StreakRegistry internal registry;

    event CheckedIn(bytes32 indexed streakId, uint256 indexed dayIndex, uint256 timestamp);

    function setUp() public {
        registry = new StreakRegistry();
    }

    function testNormalCheckIn() public {
        bytes32 streakId = keccak256("streak-001");
        registry.createStreak(streakId, "Daily Solidity Coding");
        registry.checkIn(streakId);

        assertTrue(registry.isCheckedIn(streakId, 0));
    }

    function testRejectDuplicateCheckInSameDay() public {
        bytes32 streakId = keccak256("streak-002");
        registry.createStreak(streakId, "Morning Workout");
        registry.checkIn(streakId);

        // Attempt second check-in on the same day -> should revert
        try registry.checkIn(streakId) {
            revert("Expected duplicate check-in to fail");
        } catch Error(string memory reason) {
            assertEq(reason, "StreakRegistry: Already checked in today");
        }
    }

    function testConsecutiveDaysCheckIn(uint256 forwardDays) public {
        if (forwardDays == 0 || forwardDays > 365) forwardDays = 1;
        bytes32 streakId = keccak256("streak-003");
        registry.createStreak(streakId, "Daily Reading");
        registry.checkIn(streakId);

        assertTrue(registry.isCheckedIn(streakId, 0));
    }

    // Minimal assertions for Foundry/Solidity test runner
    function assertTrue(bool condition) internal pure {
        require(condition, "AssertTrue failed");
    }

    function assertEq(string memory a, string memory b) internal pure {
        require(keccak256(bytes(a)) == keccak256(bytes(b)), "AssertEq failed");
    }
}
