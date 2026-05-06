"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { ritualChain } from "@/config/chain";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            retry: 1,
          },
        },
      })
  );

  const [config] = useState(() =>
    createConfig({
      chains: [ritualChain],
      connectors: [
        injected({
          target: "metaMask",
        }),
      ],
      transports: {
        [ritualChain.id]: http(
          process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.ritualfoundation.org"
        ),
      },
      ssr: true,
    })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
