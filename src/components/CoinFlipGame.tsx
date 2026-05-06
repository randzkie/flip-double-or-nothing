"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { Coin, type CoinSide } from "./Coin";
import { useCoinFlip } from "@/hooks/useCoinFlip";
import { Button } from "@/components/ui/button";
import { ConnectWallet } from "./ConnectWallet";
import { UsernameEntry } from "./UsernameEntry";
import { GameHistory } from "./GameHistory";
import {
  Coins,
  TrendingUp,
  Trophy,
  Skull,
  Zap,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const BET_PRESETS = ["0.001", "0.002", "0.003", "0.004", "0.005"];
const MIN_BET = "0.001";
const MAX_BET = "0.005";
const SPINS_PER_FLIP = 6;

type GamePhase = "connect" | "username" | "play";

export function CoinFlipGame() {
  const { isConnected } = useAccount();
  const {
    username,
    contractBalance,
    playerStats,
    canAcceptBet,
    flip,
    refetchAll,
    resetFlip,
    isWaitingForWallet,
    flipHash,
    isFlipConfirming,
    isFlipConfirmed,
    isFlipError,
    flipResult,
    isTxSuccessful,
  } = useCoinFlip();

  const [phase, setPhase] = useState<GamePhase>(
    isConnected ? "username" : "connect"
  );
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads");
  const [betAmount, setBetAmount] = useState("0.001");

  // ── Flip tracking state machine ──────────────────────────────
  const [flipCount, setFlipCount] = useState(0);
  const [pendingFlip, setPendingFlip] = useState<{
    round: number;
    userChoice: CoinSide;
  } | null>(null);
  const [animatingFlip, setAnimatingFlip] = useState<{
    round: number;
    coinLanded: CoinSide;
    won: boolean;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    coinLanded: CoinSide;
    won: boolean;
  } | null>(null);

  if (isConnected && phase === "connect") {
    setPhase("username");
  }

  // When tx confirmed + result parsed → start animation
  useEffect(() => {
    if (isTxSuccessful && flipResult && pendingFlip && !animatingFlip) {
      setAnimatingFlip({
        round: pendingFlip.round,
        coinLanded: flipResult.coinLanded,
        won: flipResult.won,
      });
      setPendingFlip(null);
    }
  }, [isTxSuccessful, flipResult, pendingFlip, animatingFlip]);

  // When tx fails (user rejected MetaMask)
  useEffect(() => {
    if (isFlipError && pendingFlip && !flipHash) {
      setPendingFlip(null);
      resetFlip();
    }
  }, [isFlipError, pendingFlip, flipHash, resetFlip]);

  // When tx mined but reverted
  useEffect(() => {
    if (isFlipConfirmed && !isTxSuccessful && pendingFlip && !animatingFlip) {
      setPendingFlip(null);
      resetFlip();
    }
  }, [isFlipConfirmed, isTxSuccessful, pendingFlip, animatingFlip, resetFlip]);

  // ── Derived states ──────────────────────────────────────────
  const isConfirmingWallet = isWaitingForWallet && !!pendingFlip && !flipHash;
  const isProcessingTx = !!flipHash && !isFlipConfirmed && !!pendingFlip;
  const isSpinning = !!animatingFlip;
  const isBusy = isConfirmingWallet || isProcessingTx || isSpinning;

  // ── Rotation ────────────────────────────────────────────────
  const currentRound = isSpinning ? animatingFlip!.round : flipCount;
  const coinTargetSide = isSpinning
    ? animatingFlip!.coinLanded
    : lastResult?.coinLanded ?? selectedSide;

  const coinRotation =
    currentRound * SPINS_PER_FLIP * 360 +
    (coinTargetSide === "tails" ? 180 : 0);

  const showResult = !!lastResult && !isSpinning;

  const handleTransitionEnd = useCallback(() => {
    if (animatingFlip) {
      setLastResult({
        coinLanded: animatingFlip.coinLanded,
        won: animatingFlip.won,
      });
      setFlipCount(animatingFlip.round);
      setAnimatingFlip(null);
      refetchAll();
      resetFlip();
    }
  }, [animatingFlip, refetchAll, resetFlip]);

  const handleFlip = () => {
    if (isBusy) return;
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < parseFloat(MIN_BET) || amount > parseFloat(MAX_BET)) return;

    setPendingFlip({ round: flipCount + 1, userChoice: selectedSide });
    setLastResult(null);
    flip(selectedSide === "heads", betAmount);
  };

  // Safely format balance to avoid NaN
  const safeContractBalance = (() => {
    try {
      const val = parseFloat(contractBalance);
      return isNaN(val) ? "0.0000" : val.toFixed(4);
    } catch {
      return "0.0000";
    }
  })();

  return (
    <div className="min-h-screen text-gray-900 overflow-hidden">
      {/* Background image as-is, visible through transparent components */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/bg-pattern.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "750px 520px",
        }}
      />

      {/* Content - transparent so background shows through */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
              <Coins className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                <span className="text-emerald-600">Ritual</span>
                <span className="text-gray-900"> CoinFlip</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {phase === "play" && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      canAcceptBet ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <span>
                    Pool: <span className="text-emerald-600 font-medium">{safeContractBalance}</span> RITUAL
                  </span>
                </div>
              </div>
            )}
            <ConnectWallet />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Phase: Connect Wallet */}
          {phase === "connect" && (
            <div className="flex flex-col items-center gap-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🪙</div>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  <span className="text-emerald-600">Ritual</span>
                  <span className="text-gray-900"> CoinFlip</span>
                </h2>
                <p className="text-gray-600 max-w-md">
                  Double or nothing. Pick your side, place your bet, and flip
                  the coin on Ritual Chain.
                </p>
              </div>
              <ConnectWallet />
              <div className="flex gap-8 text-center text-sm text-gray-500">
                <div>
                  <div className="text-lg font-bold text-emerald-600">30%</div>
                  <div>Win Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">2x</div>
                  <div>Payout</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">0.001-0.005</div>
                  <div>RITUAL</div>
                </div>
              </div>
            </div>
          )}

          {/* Phase: Username Entry */}
          {phase === "username" && (
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome, Player
                </h2>
                <p className="text-gray-500 text-sm">
                  Set your display name before entering the game
                </p>
              </div>
              <UsernameEntry onComplete={() => setPhase("play")} />
            </div>
          )}

          {/* Phase: Main Game */}
          {phase === "play" && (
            <div className="w-full max-w-lg space-y-8 animate-fade-in">
              {/* Player Stats Bar */}
              {playerStats && (
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/70 backdrop-blur-sm">
                    <UserIcon className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700">{playerStats.username || username}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/70 backdrop-blur-sm">
                    <Trophy className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700">
                      {Number(playerStats.wins)}W
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-white/70 backdrop-blur-sm">
                    <Skull className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">
                      {Number(playerStats.losses)}L
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">
                      {Number(playerStats.bets)} flips
                    </span>
                  </div>
                </div>
              )}

              {/* Transaction Status Indicators */}
              {isConfirmingWallet && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-emerald-200 bg-white/70 backdrop-blur-sm text-emerald-700 text-sm animate-fade-in">
                  <Wallet className="h-4 w-4 shrink-0 animate-pulse" />
                  <span>Confirm transaction in your wallet...</span>
                </div>
              )}

              {isProcessingTx && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-amber-200 bg-white/70 backdrop-blur-sm text-amber-700 text-sm animate-fade-in">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Processing transaction on Ritual Chain...</span>
                </div>
              )}

              {isSpinning && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-emerald-200 bg-white/70 backdrop-blur-sm text-emerald-700 text-sm animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Transaction confirmed! Flipping coin...</span>
                </div>
              )}

              {isFlipError && !isSpinning && !isProcessingTx && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-200 bg-white/70 backdrop-blur-sm text-red-600 text-sm animate-fade-in">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>Transaction rejected or failed. Try again.</span>
                </div>
              )}

              {/* Win/Lose Result Banner */}
              {showResult && lastResult && (
                <div
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold animate-fade-in backdrop-blur-sm ${
                    lastResult.won
                      ? "border border-emerald-300 bg-emerald-50/80 text-emerald-700"
                      : "border border-red-300 bg-red-50/80 text-red-600"
                  }`}
                >
                  {lastResult.won ? (
                    <>
                      <Trophy className="h-4 w-4 shrink-0" />
                      <span>YOU WON! Coin landed {lastResult.coinLanded.toUpperCase()}</span>
                    </>
                  ) : (
                    <>
                      <Skull className="h-4 w-4 shrink-0" />
                      <span>YOU LOST. Coin landed {lastResult.coinLanded.toUpperCase()}</span>
                    </>
                  )}
                </div>
              )}

              {/* Coin */}
              <div className="flex justify-center py-4">
                <Coin
                  targetRotation={coinRotation}
                  isFlipping={isSpinning}
                  result={
                    isSpinning
                      ? animatingFlip!.coinLanded
                      : showResult
                      ? lastResult?.coinLanded ?? null
                      : null
                  }
                  showResult={showResult}
                  onTransitionEnd={handleTransitionEnd}
                />
              </div>

              {/* Betting Controls */}
              <div className="space-y-4">
                {/* Side Selection */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">I like</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setSelectedSide("heads")}
                      disabled={isBusy}
                      className={`flex-1 max-w-[160px] py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
                        selectedSide === "heads"
                          ? "border-2 border-emerald-500 text-emerald-700 bg-white/80 backdrop-blur-sm scale-105"
                          : "border border-gray-300 text-gray-500 bg-white/50 backdrop-blur-sm hover:border-gray-400 hover:text-gray-700"
                      }`}
                    >
                      🐱 HEADS
                    </button>
                    <button
                      onClick={() => setSelectedSide("tails")}
                      disabled={isBusy}
                      className={`flex-1 max-w-[160px] py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
                        selectedSide === "tails"
                          ? "border-2 border-emerald-500 text-emerald-700 bg-white/80 backdrop-blur-sm scale-105"
                          : "border border-gray-300 text-gray-500 bg-white/50 backdrop-blur-sm hover:border-gray-400 hover:text-gray-700"
                      }`}
                    >
                      🔮 TAILS
                    </button>
                  </div>
                </div>

                {/* Bet Amount */}
                <div>
                  <p className="text-sm text-gray-500 mb-2 text-center">for</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min={MIN_BET}
                      max={MAX_BET}
                      step="0.001"
                      disabled={isBusy}
                      className="w-full bg-white/60 border border-gray-300 rounded-lg h-12 text-center text-emerald-600 font-mono text-lg focus:border-emerald-500 focus:ring-emerald-500/20 focus:outline-none disabled:opacity-50 backdrop-blur-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      RITUAL
                    </span>
                  </div>

                  {/* Quick Bet Buttons */}
                  <div className="flex gap-2 mt-3">
                    {BET_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setBetAmount(preset)}
                        disabled={isBusy}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          betAmount === preset
                            ? "border-2 border-emerald-500 text-emerald-700 bg-white/80 backdrop-blur-sm"
                            : "border border-gray-300 text-gray-500 bg-white/50 backdrop-blur-sm hover:border-gray-400 hover:text-emerald-600"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contract Balance Warning */}
                {!canAcceptBet && !isBusy && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/80 backdrop-blur-sm text-amber-700 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Contract pool too low to accept bets right now</span>
                  </div>
                )}

                {/* Flip Button */}
                <Button
                  onClick={handleFlip}
                  disabled={
                    isBusy ||
                    !canAcceptBet ||
                    parseFloat(betAmount) < parseFloat(MIN_BET) ||
                    parseFloat(betAmount) > parseFloat(MAX_BET)
                  }
                  className="w-full bg-emerald-600 text-white font-bold h-14 rounded-lg text-lg transition-all duration-300 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isConfirmingWallet ? (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 animate-pulse" />
                      Confirm in Wallet...
                    </div>
                  ) : isProcessingTx ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : isSpinning ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Flipping...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      BET {betAmount} RITUAL
                    </div>
                  )}
                </Button>

                {/* Min/Max Info */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span>MIN: <span className="text-emerald-600">{MIN_BET}</span> RITUAL</span>
                  <span>|</span>
                  <span>MAX: <span className="text-emerald-600">{MAX_BET}</span> RITUAL</span>
                  <span>|</span>
                  <span>WIN: <span className="text-emerald-600">2x</span></span>
                </div>
              </div>

              {/* Game History */}
              <GameHistory />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200/50">
          Built on <span className="text-emerald-600">Ritual Chain</span> (1979) | Double or Nothing | 30% Win Rate
        </footer>
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 21v-1a5 5 0 0 1 10 0v1" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}
