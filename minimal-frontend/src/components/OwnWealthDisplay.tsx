"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "../utils/contract";
import { Lock, Eye, Coins, Copy, Check, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { reEncryptValue } from "../utils/inco-lite";
import { Tooltip } from "./Tooltip";
import { useWealthContext } from "../provider/WealthProvider";

const OwnWealthDisplay: React.FC = () => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { lastUpdate } = useWealthContext();

  const {
    data: wealth,
    isLoading,
    refetch,
  } = useReadContract({
    address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
    abi: PrivateWealthABI,
    functionName: "getWealthbyUser",
    account: address,
  });

  // Refetch when lastUpdate changes
  useEffect(() => {
    refetch();
  }, [lastUpdate, refetch]);

  // Add continuous polling every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 200);

    return () => clearInterval(intervalId);
  }, [refetch]);

  // Reset decrypted value when wealth changes
  useEffect(() => {
    setDecryptedValue("");
    setShowDecrypted(false);
  }, [wealth]);

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
          <Tooltip content="View your submitted wealth in both encrypted and decrypted forms. The decryption process is secure and only accessible by you.">
            <HelpCircle
              className="text-primary-400/50 hover:text-primary-400 transition-colors cursor-help"
              size={20}
            />
          </Tooltip>
        </div>

        {wealth ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="p-5 bg-black/50 rounded-lg border border-primary-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-mono text-sm">
                    {showDecrypted ? "DECRYPTED VALUE" : "ENCRYPTED VALUE"}
                  </span>
                  <Tooltip
                    content={
                      showDecrypted
                        ? "This is your actual wealth value, decrypted securely using your wallet."
                        : "This is your encrypted wealth as stored on the blockchain. The encryption ensures privacy while allowing for secure comparisons."
                    }
                  >
                    <HelpCircle
                      className="text-primary-400/50 hover:text-primary-400 transition-colors cursor-help"
                      size={14}
                    />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip
                    content="Click to toggle between encrypted and decrypted views"
                    side="left"
                  >
                    <button
                      onClick={toggleDecryption}
                      className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                    >
                      <Lock className="text-primary-400" size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip
                    content={`Copy the ${
                      showDecrypted ? "decrypted" : "encrypted"
                    } value to clipboard`}
                    side="left"
                  >
                    <button
                      onClick={handleCopy}
                      className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="text-green-400" size={16} />
                      ) : (
                        <Copy className="text-primary-400" size={16} />
                      )}
                    </button>
                  </Tooltip>
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
