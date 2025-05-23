"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState, useEffect, ReactNode } from "react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { baseSepolia } from "wagmi/chains";
import { Loader2, AlertTriangle } from "lucide-react";
import { Config } from "wagmi";

const projectId = "be36d80bd82aef7bdb958bb467c3e570";

const initializeWeb3Modal = (): Config => {
  try {
    const metadata = {
      name: "Encrypted Token App",
      description: "Secure Encrypted Token Management",
      url: "https://myapp.com",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    const chains = [baseSepolia];

    const wagmiConfig = defaultWagmiConfig({
      chains: [baseSepolia],
      projectId,
      metadata,
    });

    createWeb3Modal({
      wagmiConfig,
      projectId,
      enableAnalytics: true,
      themeMode: "dark",
      chainImages: {
        [baseSepolia.id]:
          "https://images.mirror-media.xyz/publication-images/cgqxxPdUFBDjgKna_dDir.png?height=1200&width=1200",
      },
    });

    console.log("Web3Modal initialized successfully");
    return wagmiConfig;
  } catch (error) {
    console.error("Failed to initialize Web3Modal:", error);
    throw error;
  }
};

interface Web3ProviderProps {
  children: ReactNode;
  initialState?: any;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!initialized) {
      try {
        const config = initializeWeb3Modal();
        setWagmiConfig(config);
        setInitialized(true);
      } catch (err) {
        console.error("Web3Provider initialization error:", err);
        setError(err as Error);
      }
    }
  }, [initialized]);

  const renderLoadingState = () => (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <Loader2
          className="mx-auto mb-4 animate-spin text-blue-400"
          size={48}
        />
        <p className="text-xl mb-2">
          {error
            ? "Wallet Connection Error"
            : "Privacy for all..."}
        </p>
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg mt-4 flex items-center justify-center">
            <AlertTriangle className="mr-2" />
            {error.message}
          </div>
        )}
      </div>
    </div>
  );

  if (error) {
    return renderLoadingState();
  }

  if (!initialized || !wagmiConfig) {
    return renderLoadingState();
  }

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}