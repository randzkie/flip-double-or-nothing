"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ArrowRight } from "lucide-react";
import { useCoinFlip } from "@/hooks/useCoinFlip";

interface UsernameEntryProps {
  onComplete: () => void;
}

export function UsernameEntry({ onComplete }: UsernameEntryProps) {
  const [name, setName] = useState("");
  const { setUsername, isSettingUsername, isUsernameSet, username } =
    useCoinFlip();

  if (username && username.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 backdrop-blur-sm px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 font-medium">
            Welcome back, {username}!
          </span>
        </div>
        <Button
          onClick={onComplete}
          className="bg-emerald-600 text-white font-bold px-8 rounded-lg hover:bg-emerald-700"
        >
          Enter Game
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (name.trim().length === 0 || name.trim().length > 20) return;
    setUsername(name.trim());
  };

  if (isUsernameSet) {
    return (
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 backdrop-blur-sm px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 font-medium">
            Username set as &quot;{name}&quot;!
          </span>
        </div>
        <Button
          onClick={onComplete}
          className="bg-emerald-600 text-white font-bold px-8 rounded-lg hover:bg-emerald-700"
        >
          Enter Game
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Name</h2>
        <p className="text-gray-500 text-sm">
          This name will be displayed on the leaderboard
        </p>
      </div>

      <div className="relative w-full">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter username..."
          maxLength={20}
          className="pl-10 bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-lg h-12 backdrop-blur-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {name.length}/20
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={name.trim().length === 0 || isSettingUsername}
        className="w-full bg-emerald-600 text-white font-bold h-12 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSettingUsername ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Setting Username...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </Button>
    </div>
  );
}
