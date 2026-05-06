import { defineChain } from "viem";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual Chain",
  nativeCurrency: {
    name: "RITUAL",
    symbol: "RITUAL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.ritualfoundation.org"],
      webSocket: [process.env.NEXT_PUBLIC_WS_URL || "wss://rpc.ritualfoundation.org/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer.ritualfoundation.org",
    },
  },
  testnet: true,
});
