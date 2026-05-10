// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CoinFlip.sol";

/**
 * @title DeployCoinFlip
 * @notice Deployment script for the CoinFlip game on Ritual Chain
 *
 * Usage:
 *   source .env
 *   forge script script/DeployCoinFlip.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
 *
 * Verify on explorer:
 *   forge verify-contract <CONTRACT_ADDRESS> src/CoinFlip.sol --rpc-url $RPC_URL
 */
contract DeployCoinFlip is Script {
    function run() external {
        vm.startBroadcast();

        CoinFlip coinFlip = new CoinFlip();

        console.log("CoinFlip deployed at:", address(coinFlip));
        console.log("Owner:", coinFlip.owner());
        console.log("Min Bet:", coinFlip.MIN_BET());
        console.log("Max Bet:", coinFlip.MAX_BET());
        console.log("Win Percentage:", coinFlip.WIN_PERCENTAGE());
        console.log("");
        console.log("Next steps:");
        console.log("1. Fund the contract with: cast send <ADDRESS> --value 0.1ether --rpc-url $RPC_URL --private-key $PRIVATE_KEY");
        console.log("2. Update NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local");

        vm.stopBroadcast();
    }
}
