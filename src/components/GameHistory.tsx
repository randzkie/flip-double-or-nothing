"use client";

import { useCoinFlip } from "@/hooks/useCoinFlip";
import { useReadContract } from "wagmi";
import { COINFLIP_ADDRESS, COINFLIP_ABI } from "@/config/contract";
import { formatEther } from "viem";
import { ScrollArea } from "@/components/ui/scroll-area";

type FlipResult = {
  player: `0x${string}`;
  amount: bigint;
  choice: boolean;
  won: boolean;
  payout: bigint;
  timestamp: bigint;
};

export function GameHistory() {
  const { flipHash } = useCoinFlip();

  const { data: recentFlips, refetch } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "getRecentFlips",
    args: [BigInt(0), BigInt(20)],
  });

  if (flipHash) {
    refetch();
  }

  const flips = (recentFlips as FlipResult[] | undefined) ?? [];

  if (flips.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white/60 p-6 text-center backdrop-blur-sm">
        <p className="text-gray-400 text-sm">No flips yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white/60 overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-gray-200 bg-white/80">
        <h3 className="text-sm font-bold text-emerald-600">Recent Flips</h3>
      </div>
      <ScrollArea className="max-h-64">
        <div className="divide-y divide-gray-100">
          {flips.map((flip, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs border ${
                    flip.won
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  {flip.won ? "✓" : "✗"}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    <span className="text-gray-500 mr-1">
                      {flip.player.slice(0, 6)}...{flip.player.slice(-4)}
                    </span>
                    <span className="text-gray-400">picked</span>
                    <span
                      className={
                        flip.choice
                          ? "text-emerald-600 ml-1"
                          : "text-emerald-500 ml-1"
                      }
                    >
                      {flip.choice ? "HEADS" : "TAILS"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatEther(flip.amount)} RITUAL
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-bold ${
                    flip.won ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {flip.won
                    ? `+${formatEther(flip.payout)}`
                    : `-${formatEther(flip.amount)}`}
                </div>
                <div className="text-xs text-gray-400">
                  {timeAgo(Number(flip.timestamp))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function timeAgo(timestamp: number): string {
  if (timestamp === 0) return "";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
