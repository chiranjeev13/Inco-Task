"use client";

import React, { useState } from "react";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "../utils/contract";
import { Lock, Eye, Coins, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { reEncryptValue } from "../utils/inco-lite";

const OwnWealthDisplay: React.FC = () => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const { data: walletClient } = useWalletClient();

  const { data: wealth, isLoading } = useReadContract({
    address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
    abi: PrivateWealthABI,
    functionName: "getWealthbyUser",
    account: address,
  });

  const decryptWealth = async (encryptedWealth: string): Promise<string> => {
    const decryptedValue = await reEncryptValue({
      walletClient: walletClient,
      handle: encryptedWealth,
    });
    return decryptedValue;
  };

  const handleCopy = async () => {
    if (wealth) {
      await navigator.clipboard.writeText(wealth.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleDecryption = async () => {
    if (!showDecrypted && wealth && !decryptedValue) {
      setIsDecrypting(true);
      try {
        const decrypted = await decryptWealth(wealth.toString());
        setDecryptedValue(decrypted);
      } catch (error) {
        console.error("Decryption failed:", error);
      } finally {
        setIsDecrypting(false);
      }
    }
    setShowDecrypted(!showDecrypted);
  };

  return (
    <motion.div
      className="relative glassmorphism rounded-xl p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Glow effect */}
      <div className="absolute inset-0 animated-gradient opacity-20" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
            <Eye className="text-primary-400" size={24} />
          </div>
          <h2 className="text-xl font-mono font-bold text-primary-400">
            YOUR ENCRYPTED WEALTH
          </h2>
        </div>

        {isLoading || isDecrypting ? (
          <div className="h-16 flex items-center gap-2 text-primary-400 font-mono animate-pulse">
            <Lock size={16} />
            <span>
              {isDecrypting ? "DECRYPTING WEALTH..." : "LOADING WEALTH..."}
            </span>
          </div>
        ) : wealth ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="p-5 bg-black/50 rounded-lg border border-primary-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 font-mono text-sm">
                  {showDecrypted ? "DECRYPTED VALUE" : "ENCRYPTED VALUE"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleDecryption}
                    className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                    title={showDecrypted ? "Show Encrypted" : "Show Decrypted"}
                  >
                    <Lock className="text-primary-400" size={16} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="text-green-400" size={16} />
                    ) : (
                      <Copy className="text-primary-400" size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-hidden">
                <Coins className="text-primary-400 flex-shrink-0" size={18} />
                <code className="text-primary-400 font-mono text-sm truncate">
                  {showDecrypted
                    ? decryptedValue || "Decryption failed"
                    : wealth.toString()}
                </code>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-16 flex items-center gap-2 text-gray-400 font-mono">
            <Lock size={16} />
            <span>NO WEALTH SUBMITTED</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OwnWealthDisplay;
