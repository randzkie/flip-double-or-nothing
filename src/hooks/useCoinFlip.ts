"use client";

import { useMemo } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { COINFLIP_ADDRESS, COINFLIP_ABI } from "@/config/contract";
import { parseEther, formatEther, decodeEventLog } from "viem";

type CoinSide = "heads" | "tails";

export interface FlipResultData {
  won: boolean;
  choice: boolean;
  coinLanded: CoinSide;
}

export function useCoinFlip() {
  const { address } = useAccount();

  // Read: player username
  const { data: username, refetch: refetchUsername } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "usernames",
    args: address ? [address] : undefined,
  });

  // Read: player stats
  const { data: playerStats, refetch: refetchPlayerStats } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "getPlayerStats",
    args: address ? [address] : undefined,
  });

  // Read: contract balance
  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "getContractBalance",
  });

  // Read: global stats
  const { data: globalStats, refetch: refetchGlobalStats } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "getGlobalStats",
  });

  // Read: can accept bet
  const { data: canAcceptBet } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "canAcceptBet",
    args: [parseEther("0.001")],
  });

  // Write: setUsername
  const {
    writeContract: setUsernameWrite,
    data: setUsernameHash,
    isPending: isSettingUsername,
  } = useWriteContract();

  const { isLoading: isUsernameConfirming, isSuccess: isUsernameSet } =
    useWaitForTransactionReceipt({ hash: setUsernameHash });

  // Write: flip
  const {
    writeContract: flipWrite,
    data: flipHash,
    isPending: isWaitingForWallet,
    isError: isFlipError,
    error: flipError,
    reset: resetFlip,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    data: receipt,
    isLoading: isFlipConfirming,
    isSuccess: isFlipConfirmed,
  } = useWaitForTransactionReceipt({ hash: flipHash });

  // Parse the Flipped event from the receipt to determine the on-chain result
  const flipResult: FlipResultData | null = useMemo(() => {
    if (!receipt || receipt.status !== "success") return null;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: COINFLIP_ABI,
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        });

        if (decoded.eventName === "Flipped") {
          const args = decoded.args as {
            player: `0x${string}`;
            amount: bigint;
            choice: boolean;
            won: boolean;
            payout: bigint;
          };
          // If player won, coin landed on their choice
          // If player lost, coin landed on the opposite side
          const coinLanded: CoinSide = (args.won
            ? args.choice
            : !args.choice)
            ? "heads"
            : "tails";

          return { won: args.won, choice: args.choice, coinLanded };
        }
      } catch {
        // Not a matching event log, skip
      }
    }
    return null;
  }, [receipt]);

  function setUsername(name: string) {
    setUsernameWrite({
      address: COINFLIP_ADDRESS,
      abi: COINFLIP_ABI,
      functionName: "setUsername",
      args: [name],
    });
  }

  function flip(choice: boolean, amount: string) {
    flipWrite({
      address: COINFLIP_ADDRESS,
      abi: COINFLIP_ABI,
      functionName: "flip",
      args: [choice],
      value: parseEther(amount),
    });
  }

  function refetchAll() {
    refetchUsername();
    refetchPlayerStats();
    refetchBalance();
    refetchGlobalStats();
  }

  return {
    // State
    username: username as string | undefined,
    playerStats: playerStats
      ? {
          username: playerStats[0],
          bets: playerStats[1],
          wins: playerStats[2],
          losses: playerStats[3],
          wagered: playerStats[4],
          won: playerStats[5],
        }
      : undefined,
    contractBalance: (() => {
      try {
        return contractBalance ? formatEther(contractBalance as bigint) : "0";
      } catch {
        return "0";
      }
    })(),
    globalStats: globalStats
      ? {
          bets: globalStats[0],
          wins: globalStats[1],
          losses: globalStats[2],
          contractBalance: (() => {
            try {
              return formatEther(globalStats[3] as bigint);
            } catch {
              return "0";
            }
          })(),
        }
      : undefined,
    canAcceptBet: canAcceptBet ?? false,
    // Actions
    setUsername,
    flip,
    refetchAll,
    resetFlip,
    // Username transaction states
    isSettingUsername: isSettingUsername || isUsernameConfirming,
    isUsernameSet,
    // Flip transaction states
    isWaitingForWallet, // MetaMask popup is open
    flipHash, // Set when user confirms in MetaMask
    isFlipConfirming, // Tx sent, waiting for block confirmation
    isFlipConfirmed, // Tx mined and confirmed
    isFlipError, // User rejected or write failed
    flipError,
    // Receipt & parsed result
    receipt,
    flipResult, // Parsed on-chain result: { won, choice, coinLanded }
    isTxSuccessful: receipt?.status === "success",
  };
}
