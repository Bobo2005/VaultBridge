// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../StreakVerifier.sol";
import "../StreakBadge.sol";
import "../MockStreakPrecompile.sol";

/**
 * @title StreakVerifierTest
 * @notice Solidity test suite for StreakVerifier.sol
 */
contract StreakVerifierTest {
    StreakVerifier internal streakVerifier;
    StreakBadge internal streakBadge;
    MockStreakPrecompile internal mockVerifier;

    bytes32 internal streakId = keccak256("streak-solidity-100");
    address internal testUser = address(0x1234);

    function setUp() public {
        mockVerifier = new MockStreakPrecompile();
        streakBadge = new StreakBadge();
        streakVerifier = new StreakVerifier(address(mockVerifier), address(streakBadge));
        streakBadge.setMinterStatus(address(streakVerifier), true);
    }

    function testSuccessfulCheckIn() public {
        streakVerifier.registerCheckIn(
            1,
            100,
            "0x",
            "0x",
            "0x",
            streakId,
            0,
            testUser
        );

        StreakVerifier.StreakState memory state = streakVerifier.getStreak(streakId);
        assertTrue(state.active);
        assertEq(state.currentCount, 1);
        assertEq(state.longestCount, 1);
        assertEq(state.lastCheckInDay, 0);
    }

    function testSuccessfulBreakOnMissedDay() public {
        // First check in on day 0
        streakVerifier.registerCheckIn(1, 100, "0x", "0x", "0x", streakId, 0, testUser);

        // Break on missed day 1
        streakVerifier.breakStreakIfMissed(1, 110, "0x", "0x", "0x", streakId, 1);

        StreakVerifier.StreakState memory state = streakVerifier.getStreak(streakId);
        assertEq(state.currentCount, 0);
        assertEq(state.longestCount, 1); // Longest preserved
    }

    function testBlockedBreakWhenCheckInExists() public {
        // Check in on day 0
        streakVerifier.registerCheckIn(1, 100, "0x", "0x", "0x", streakId, 0, testUser);

        // Attempting to break on day 0 (which was checked in) must revert
        try streakVerifier.breakStreakIfMissed(1, 110, "0x", "0x", "0x", streakId, 0) {
            revert("Expected break on existing check-in to fail");
        } catch Error(string memory reason) {
            assertEq(reason, "StreakVerifier: Check-in exists for this day");
        }
    }

    // Helper assertions
    function assertTrue(bool condition) internal pure {
        require(condition, "AssertTrue failed");
    }

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, "AssertEq uint256 failed");
    }

    function assertEq(string memory a, string memory b) internal pure {
        require(keccak256(bytes(a)) == keccak256(bytes(b)), "AssertEq string failed");
    }
}
