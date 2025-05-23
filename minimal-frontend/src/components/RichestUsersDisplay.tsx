import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "../utils/contract";
import {
  Users,
  RefreshCw,
  Shield,
  Lock,
  Trophy,
  Crown,
  Award,
  Scale,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip } from "./Tooltip";

interface RichestUsersDisplayProps {
  onRefresh?: () => void;
}

const RichestUsersDisplay: React.FC<RichestUsersDisplayProps> = ({
  onRefresh,
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const {
    data: winners,
    refetch,
    isLoading: isWinnersLoading,
  } = useReadContract({
    address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
    abi: PrivateWealthABI,
    functionName: "getWinners",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Log winners whenever they change
  useEffect(() => {
    console.log("Winners:", winners);
  }, [winners]);

  // Poll for winners every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [refetch]);

  const handleFindRichest = async () => {
    setError("");
    setLoading(true);
    try {
      // @ts-ignore - Contract write configuration is valid at runtime
      const txHash = await writeContractAsync({
        address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        abi: PrivateWealthABI,
        functionName: "richest",
      });
      const tx = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (tx.status === "success") {
        await refetch();
        if (onRefresh) onRefresh();
      } else {
        setError("Transaction failed");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to find richest users.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="relative glassmorphism rounded-xl p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      {/* Glow effect */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
              <Trophy className="text-primary-400" size={24} />
            </div>
            <h2 className="text-xl font-mono font-bold text-primary-400">
              WEALTH LEADERBOARD
            </h2>
            <Tooltip content="View the wealthiest users in the network while maintaining privacy">
              <HelpCircle
                className="text-primary-400/50 hover:text-primary-400 transition-colors cursor-help"
                size={20}
              />
            </Tooltip>
          </div>
          <Tooltip content="Calculate and update the current wealthiest users">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindRichest}
              className="p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg border border-primary-500/30 transition-all duration-200 hover:shadow-neon"
              disabled={loading}
            >
              <RefreshCw
                className={`text-primary-400 ${loading ? "animate-spin" : ""}`}
                size={20}
              />
            </motion.button>
          </Tooltip>
        </div>

        {loading || isWinnersLoading ? (
          <div className="h-32 flex flex-col items-center justify-center gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg animate-pulse"></div>
              <div className="relative h-full flex items-center justify-center p-3 bg-primary-500/10 rounded-full border border-primary-500/30">
                <Lock className="text-primary-400" size={24} />
              </div>
            </div>
            <p className="text-primary-400 font-mono animate-pulse">
              CALCULATING WINNERS...
            </p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg text-sm font-mono"
          >
            <span className="text-red-500">ERROR:</span> {error}
          </motion.div>
        ) : Array.isArray(winners) && winners.length > 0 ? (
          <>
            {winners.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 mb-4 bg-secondary-500/10 border border-secondary-500/30 rounded-lg text-sm"
              >
                <Scale className="text-secondary-400 flex-shrink-0" size={18} />
                <span className="text-secondary-300">
                  {winners.length} users share the highest wealth amount
                </span>
              </motion.div>
            )}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3 mt-2"
            >
              {winners.map((winner: string, idx: number) => (
                <motion.div
                  key={winner}
                  variants={itemVariants}
                  className="group flex items-center justify-between p-3 bg-black/50 rounded-lg border border-primary-500/30 hover:border-primary-500/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Tooltip
                      content={
                        winners.length === 1 || idx === 0
                          ? "Top Wealth Holder"
                          : "Shared Top Position"
                      }
                    >
                      {winners.length === 1 || idx === 0 ? (
                        <Crown className="text-yellow-400" size={18} />
                      ) : (
                        <Award className="text-yellow-300" size={18} />
                      )}
                    </Tooltip>
                    <code className="text-gray-300 font-mono text-sm group-hover:text-primary-300 transition-colors">
                      {winner.slice(0, 6)}...{winner.slice(-4)}
                    </code>
                  </div>
                  <div className="px-2 py-1 bg-primary-500/10 rounded border border-primary-500/30">
                    <span className="text-primary-400 text-xs font-mono">
                      {winners.length === 1 ? "WINNER" : "SHARED TOP"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Shield size={24} className="opacity-50" />
            <span className="font-mono">NO WINNERS YET</span>
            <p className="text-xs text-center max-w-xs opacity-70">
              Click the refresh button to find the wealthiest users in the
              network
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RichestUsersDisplay;
