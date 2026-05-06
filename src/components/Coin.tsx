"use client";

import { useCallback } from "react";
import Image from "next/image";

export type CoinSide = "heads" | "tails";

interface CoinProps {
  targetRotation: number;
  isFlipping: boolean;
  result?: CoinSide | null;
  showResult: boolean;
  onTransitionEnd?: () => void;
}

export function Coin({
  targetRotation,
  isFlipping,
  result,
  showResult,
  onTransitionEnd,
}: CoinProps) {
  const handleTransitionEnd = useCallback(() => {
    if (isFlipping) {
      onTransitionEnd?.();
    }
  }, [isFlipping, onTransitionEnd]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Coin Container */}
      <div className="relative group">
        {/* Coin */}
        <div
          className="relative w-44 h-44 sm:w-52 sm:h-52 cursor-pointer select-none"
          style={{ perspective: "1000px" }}
        >
          <div
            className="w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${targetRotation}deg)`,
              transition: isFlipping
                ? "transform 3s ease-out"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {/* HEADS side — front face */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="absolute inset-0">
                <Image
                  src="/cat-heads.png"
                  alt="Heads"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* TAILS side — back face, rotated on X axis */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              <div className="absolute inset-0">
                <Image
                  src="/ritual-tails.png"
                  alt="Tails"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result Banner */}
        {showResult && result && (
          <div
            className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-bold text-sm tracking-wide animate-bounce ${
              result === "heads"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {result === "heads" ? "🐱 HEADS" : "🔮 TAILS"}
          </div>
        )}
      </div>

      {/* Idle state - show both sides preview */}
      {!isFlipping && !showResult && (
        <div className="flex gap-4 mt-2">
          <div className="text-center">
            <div className="w-10 h-10">
              <Image src="/cat-heads.png" alt="Heads" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-500 mt-1">HEADS</span>
          </div>
          <div className="text-center">
            <div className="w-10 h-10">
              <Image src="/ritual-tails.png" alt="Tails" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-[10px] text-gray-500 mt-1">TAILS</span>
          </div>
        </div>
      )}
    </div>
  );
}
