"use client";

import React, { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "../utils/contract";
import { RefreshCw, AlertTriangle, Trash2, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip } from "./Tooltip";
import { useWealthContext } from "../provider/WealthProvider";

interface ResetButtonProps {
  onSuccess?: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onSuccess }) => {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { triggerRefetch } = useWealthContext();

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the entire system? This action cannot be undone."
      )
    ) {
      return;
    }

    setError("");
    setLoading(true);
    try {
      // @ts-ignore - Contract write configuration is valid at runtime
      const txHash = await writeContractAsync({
        address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        abi: PrivateWealthABI,
        functionName: "resetArrays",
      });

      const tx = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (tx.status === "success") {
        triggerRefetch();
        if (onSuccess) onSuccess();
        // Reload the page after successful reset
        window.location.reload();
      } else {
        setError("Reset failed");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset system.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="relative glassmorphism rounded-xl p-6 shadow-2xl overflow-hidden border border-red-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 animate-pulse"></div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
            <Trash2 className="text-red-400" size={24} />
          </div>
          <h2 className="text-xl font-mono font-bold text-red-400">
            System Reset
          </h2>
          <Tooltip content="Reset all submitted wealth data and clear the leaderboard. This action cannot be undone.">
            <HelpCircle
              className="text-red-400/50 hover:text-red-400 transition-colors cursor-help"
              size={20}
            />
          </Tooltip>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg text-sm font-mono mb-4"
          >
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <Tooltip content="Warning: This will permanently delete all submitted wealth data">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full py-4 bg-gradient-to-r from-red-600/30 to-red-700/30 hover:from-red-600/40 hover:to-red-700/40 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>RESETTING...</span>
              </>
            ) : (
              <>
                <Trash2 size={20} />
                <span>RESET SYSTEM</span>
              </>
            )}
          </motion.button>
        </Tooltip>

        <p className="mt-4 text-xs text-gray-400 text-center">
          This will clear all submitted wealth data and reset the leaderboard
        </p>
      </div>
    </motion.div>
  );
};

export default ResetButton;
