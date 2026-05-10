// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CoinFlip.sol";

contract CoinFlipTest is Test {
    CoinFlip public coinFlip;
    address public owner;
    address public player1;
    address public player2;

    function setUp() public {
        owner = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");

        coinFlip = new CoinFlip();

        // Fund contract with 1 ether for payouts
        vm.deal(address(coinFlip), 1 ether);

        // Set usernames for players
        vm.prank(player1);
        coinFlip.setUsername("Alice");

        vm.prank(player2);
        coinFlip.setUsername("Bob");
    }

    function test_Deployment() public view {
        assertEq(coinFlip.owner(), owner);
        assertEq(coinFlip.MIN_BET(), 0.001 ether);
        assertEq(coinFlip.MAX_BET(), 0.005 ether);
        assertEq(coinFlip.WIN_PERCENTAGE(), 30);
    }

    function test_SetUsername() public {
        address newUser = makeAddr("newuser");
        vm.prank(newUser);
        coinFlip.setUsername("Charlie");
        assertEq(coinFlip.usernames(newUser), "Charlie");
    }

    function test_RevertEmptyUsername() public {
        vm.prank(player1);
        vm.expectRevert("Username cannot be empty");
        coinFlip.setUsername("");
    }

    function test_RevertLongUsername() public {
        vm.prank(player1);
        vm.expectRevert("Username too long (max 20)");
        coinFlip.setUsername("abcdefghijklmnopqrstuvwxyz");
    }

    function test_RevertFlipWithoutUsername() public {
        address noName = makeAddr("noname");
        vm.deal(noName, 1 ether);
        vm.prank(noName);
        vm.expectRevert("Set username first");
        coinFlip.flip{value: 0.001 ether}(true);
    }

    function test_RevertBetBelowMin() public {
        vm.deal(player1, 1 ether);
        vm.prank(player1);
        vm.expectRevert("Bet below minimum (0.001)");
        coinFlip.flip{value: 0.0001 ether}(true);
    }

    function test_RevertBetAboveMax() public {
        vm.deal(player1, 1 ether);
        vm.prank(player1);
        vm.expectRevert("Bet above maximum (0.005)");
        coinFlip.flip{value: 0.006 ether}(true);
    }

    function test_FlipAtMinBet() public {
        vm.deal(player1, 1 ether);

        vm.prank(player1);
        coinFlip.flip{value: 0.001 ether}(true);

        assertEq(coinFlip.totalBets(player1), 1);
    }

    function test_FlipAtMaxBet() public {
        vm.deal(player1, 1 ether);

        vm.prank(player1);
        coinFlip.flip{value: 0.005 ether}(false);

        assertEq(coinFlip.totalBets(player1), 1);
    }

    function test_FundContract() public {
        uint256 balanceBefore = address(coinFlip).balance;
        coinFlip.fundContract{value: 0.1 ether}();
        assertEq(address(coinFlip).balance, balanceBefore + 0.1 ether);
    }

    function test_WithdrawProfit() public {
        uint256 ownerBalanceBefore = owner.balance;
        uint256 withdrawAmount = 0.1 ether;

        coinFlip.withdrawProfit(withdrawAmount);

        assertEq(owner.balance, ownerBalanceBefore + withdrawAmount);
    }

    function test_RevertWithdrawTooMuch() public {
        vm.expectRevert("Insufficient balance");
        coinFlip.withdrawProfit(100 ether);
    }

    function test_RevertNotOwner() public {
        vm.prank(player1);
        vm.expectRevert("Not the owner");
        coinFlip.withdrawProfit(0.1 ether);
    }

    function test_CanAcceptBet() public view {
        assertTrue(coinFlip.canAcceptBet(0.001 ether));
        assertTrue(coinFlip.canAcceptBet(0.005 ether));
        assertFalse(coinFlip.canAcceptBet(0.0001 ether));
        assertFalse(coinFlip.canAcceptBet(0.006 ether));
    }

    function test_GetPlayerStats() public {
        (
            string memory username,
            uint256 bets,
            uint256 wins,
            uint256 losses,
            uint256 wagered,
            uint256 won
        ) = coinFlip.getPlayerStats(player1);

        assertEq(username, "Alice");
        assertEq(bets, 0);
        assertEq(wins, 0);
        assertEq(losses, 0);
        assertEq(wagered, 0);
        assertEq(won, 0);
    }

    function test_GetGlobalStats() public view {
        (
            uint256 bets,
            uint256 wins,
            uint256 losses,
            uint256 contractBalance
        ) = coinFlip.getGlobalStats();

        assertEq(bets, 0);
        assertEq(wins, 0);
        assertEq(losses, 0);
        assertGt(contractBalance, 0);
    }

    function test_MultipleFlips() public {
        vm.deal(player1, 1 ether);
        vm.deal(player2, 1 ether);

        for (uint i = 0; i < 5; i++) {
            vm.prank(player1);
            coinFlip.flip{value: 0.001 ether}(true);

            vm.prank(player2);
            coinFlip.flip{value: 0.002 ether}(false);
        }

        assertEq(coinFlip.totalBets(player1), 5);
        assertEq(coinFlip.totalBets(player2), 5);
        assertEq(coinFlip.globalBets(), 10);
        assertEq(coinFlip.getTotalFlips(), 10);
    }

    function test_ReceiveFunds() public {
        (bool success,) = address(coinFlip).call{value: 0.05 ether}("");
        assertTrue(success);
    }

    function test_TransferOwnership() public {
        address newOwner = makeAddr("newOwner");
        coinFlip.transferOwnership(newOwner);
        assertEq(coinFlip.owner(), newOwner);
    }

    function test_RevertTransferToZero() public {
        vm.expectRevert("Zero address");
        coinFlip.transferOwnership(address(0));
    }
}
