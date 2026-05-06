"use client";

import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Wallet, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ritualChain } from "@/config/chain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConnectWallet() {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const isWrongChain = chainId !== ritualChain.id;

  // Safely format balance to prevent NaN
  const formattedBalance = (() => {
    if (!balance || !balance.formatted) return null;
    const val = parseFloat(balance.formatted);
    if (isNaN(val)) return null;
    return val.toFixed(4);
  })();

  if (isConnected && address) {
    if (isWrongChain) {
      return (
        <Button
          onClick={() => switchChain?.({ chainId: ritualChain.id })}
          className="bg-white/80 border-2 border-red-500 text-red-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-50 backdrop-blur-sm"
        >
          Switch to Ritual
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white/70 px-3 py-2 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-mono text-emerald-700">
            {formattedBalance !== null
              ? `${formattedBalance} RITUAL`
              : `${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:bg-emerald-700"
        >
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Connect to <span className="text-emerald-600">Ritual Chain</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector, chainId: ritualChain.id })}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">{connector.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
