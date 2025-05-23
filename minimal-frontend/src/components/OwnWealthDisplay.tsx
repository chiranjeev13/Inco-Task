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

// Add tooltip animation variants
const tooltipVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

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
    if (!walletClient) {
      throw new Error("Wallet client not available");
    }
    const decryptedValue = await reEncryptValue({
      walletClient,
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
            Your Encrypted Wealth (Handle ID)
          </h2>
          <Tooltip
            content={
              <motion.div
                variants={tooltipVariants}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-sm p-4 space-y-3 max-w-[400px]"
              >
                <div className="space-y-3 text-left">
                  <div className="font-mono text-primary-400 border-b border-primary-500/30 pb-2">
                    Wealth Handle Reencryption
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="font-mono text-secondary-400">
                        handle:
                      </div>
                      <div>
                        <code className="text-primary-300">
                          participantWealth[msg.sender] → euint256
                        </code>
                        <div className="text-xs text-gray-400 mt-1">
                          Your encrypted wealth stored onchain
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="font-mono text-secondary-400">auth:</div>
                      <div>
                        <code className="text-primary-300">
                          msg.sender.isAllowed(handle) ✓
                        </code>
                        <div className="text-xs text-gray-400 mt-1">
                          Access control validation in contract
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="font-mono text-secondary-400">reenc:</div>
                      <div>
                        <code className="text-primary-300">
                          EIP-712(ephemPubKey) → plaintext
                        </code>
                        <div className="text-xs text-gray-400 mt-1">
                          Secure reencryption using ephemeral keys
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-primary-500/30 pt-3">
                    <div className="font-mono text-primary-400 text-xs mb-2">
                      VIEW FLOW:
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="font-mono text-secondary-400">1.</div>
                        <div>Generate ephemeral keypair client-side</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="font-mono text-secondary-400">2.</div>
                        <div>Sign EIP-712 for secure reencryption request</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="font-mono text-secondary-400">3.</div>
                        <div>Decrypt privately using ephemeral private key</div>
                      </div>
                      <div className="flex items-start gap-2 pt-1 text-primary-300">
                        <div className="font-mono">→</div>
                        <div>
                          Private view: Only you can see your wealth value
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            }
          >
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
                    {showDecrypted
                      ? "DECRYPTED VALUE"
                      : "ENCRYPTED VALUE (HANDLE ID)"}
                  </span>
                  <Tooltip
                    content={
                      showDecrypted
                        ? "Private decryption using ephemeral keys - F⁻¹(reenc(handle)) → plaintext"
                        : "Encrypted handle from contract - participantWealth[msg.sender]"
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
