// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {IncoTest} from "../../node_modules/@inco/lightning/src/test/IncoTest.sol";
import {PrivateWealth} from "../../contracts/PrivateWealth.sol";
import {euint256} from "@inco/lightning/src/Lib.sol";
import "forge-std/console.sol";

contract PrivateWealthTest is IncoTest {
    PrivateWealth pvtW;

    function setUp() public override {
        super.setUp();
        pvtW = new PrivateWealth();
    }

    function _submitWealth(address participant, uint256 amount) internal {
        vm.prank(participant);
        bytes memory cipAmount = fakePrepareEuint256Ciphertext(amount);
        pvtW.submitWealth(cipAmount);
        processAllOperations();
        vm.stopPrank();
    }

    function test_AllEqualWealth() public {
        _submitWealth(alice, 200);
        _submitWealth(bob, 200);
        _submitWealth(eve, 200);

        pvtW.richest();
        processAllOperations();

        address[] memory winners = pvtW.getWinners();
        assertEq(winners.length, 3, "Should have 3 winners with equal wealth");
        assertEq(winners[0], alice, "Alice should be a winner");
        assertEq(winners[1], bob, "Bob should be a winner");
        assertEq(winners[2], eve, "Eve should be a winner");
    }

    function test_DifferentWealth() public {
        _submitWealth(alice, 300);
        _submitWealth(bob, 200);
        _submitWealth(eve, 100);

        pvtW.richest();
        processAllOperations();

        address[] memory winners = pvtW.getWinners();
        assertEq(winners.length, 1, "Should have 1 winner");
        assertEq(
            winners[0],
            alice,
            "Alice should be the winner with highest wealth"
        );
    }

    function test_TwoEqualHighest() public {
        _submitWealth(alice, 300);
        _submitWealth(bob, 300);
        _submitWealth(eve, 100);

        pvtW.richest();
        processAllOperations();

        address[] memory winners = pvtW.getWinners();
        assertEq(winners.length, 2, "Should have 2 winners");
        assertTrue(
            (winners[0] == alice && winners[1] == bob) ||
                (winners[0] == bob && winners[1] == alice),
            "Alice and Bob should be the winners"
        );
    }

    function test_DoubleSubmission() public {
        _submitWealth(alice, 200);

        vm.prank(alice);
        bytes memory cipAmount = fakePrepareEuint256Ciphertext(300);
        vm.expectRevert("Already Amount Added");
        pvtW.submitWealth(cipAmount);
    }

    function test_ZeroWealth() public {
        _submitWealth(alice, 0);
        _submitWealth(bob, 200);
        _submitWealth(eve, 100);

        pvtW.richest();
        processAllOperations();

        address[] memory winners = pvtW.getWinners();
        assertEq(winners.length, 1, "Should have 1 winner");
        assertEq(winners[0], bob, "Bob should be the winner");
    }

    function test_Reset() public {
        _submitWealth(alice, 300);
        _submitWealth(bob, 200);
        _submitWealth(eve, 100);

        pvtW.richest();
        processAllOperations();

        address[] memory winners1 = pvtW.getWinners();
        assertEq(winners1.length, 1, "Should have 1 winner in first round");
        assertEq(
            winners1[0],
            alice,
            "Alice should be the winner in first round"
        );

        pvtW.resetArrays();

        _submitWealth(alice, 100);
        _submitWealth(bob, 300);
        _submitWealth(eve, 200);

        pvtW.richest();
        processAllOperations();

        address[] memory winners2 = pvtW.getWinners();
        assertEq(winners2.length, 1, "Should have 1 winner in second round");
        assertEq(winners2[0], bob, "Bob should be the winner in second round");
    }

    function test_GetWealthByUser() public {

        uint256 aliceWealth = 200;

        _submitWealth(alice, aliceWealth);

        vm.prank(alice);
        euint256 result = pvtW.getWealthbyUser();
        uint256 decryptedWealth = getUint256Value(result);
        assertEq(
            decryptedWealth,
            aliceWealth,
            "Alice's wealth should match submitted amount"
        );
    }

    function test_GetWealthByUserNotAllowed() public {
        vm.prank(bob);
        vm.expectRevert("Not Allowed to fetch");
        pvtW.getWealthbyUser();
    }

    function test_GetWealthByUserAfterReset() public {

        uint256 initialWealth = 200;
        _submitWealth(alice, initialWealth);

        pvtW.resetArrays();

        vm.prank(alice);
        vm.expectRevert("Not Allowed to fetch");
        pvtW.getWealthbyUser();
    }
}
