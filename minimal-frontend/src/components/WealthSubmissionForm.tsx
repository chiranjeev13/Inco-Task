"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "../utils/contract";
import { encryptValue } from "../utils/inco-lite";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Lock,
  LucideDollarSign,
  HelpCircle,
  Check,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "./Tooltip";
import { useWealthContext } from "../provider/WealthProvider";

interface WealthSubmissionFormProps {
  onSuccess?: () => void;
}

const WealthSubmissionForm: React.FC<WealthSubmissionFormProps> = ({
  onSuccess,
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { triggerRefetch } = useWealthContext();

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "encrypting" | "submitting">(
    "idle"
  );
  const [encryptedData, setEncryptedData] = useState<string>("");
  const [displayedEncryption, setDisplayedEncryption] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (encryptedData) {
      await navigator.clipboard.writeText(encryptedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const confirmAmount = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setStatus("encrypting");
    try {
      const encrypted = await encryptValue({
        value: Number(amount),
        address,
        contractAddress: PRIVATE_WEALTH_CONTRACT_ADDRESS,
      });

      // Animate character by character
      let displayText = "";
      const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const finalLength = 32; // Show first 32 chars + ...

      for (let i = 0; i < finalLength; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        displayText +=
          characters[Math.floor(Math.random() * characters.length)];
        setDisplayedEncryption(displayText);
      }

      // Show final truncated value
      await new Promise((resolve) => setTimeout(resolve, 200));
      setDisplayedEncryption(encrypted.slice(0, 32) + "...");
      setEncryptedData(encrypted);
      setStatus("idle");
    } catch (err) {
      console.error("Encryption failed:", err);
      setError("Failed to encrypt the value.");
      setStatus("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!address || !walletClient.data) {
      setError("Please connect your wallet to submit wealth.");
      return;
    }

    if (!encryptedData) {
      setError("Please confirm your amount first.");
      return;
    }

    setLoading(true);
    setStatus("submitting");
    try {
      const txHash = await writeContractAsync({
        address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        abi: PrivateWealthABI,
        functionName: "submitWealth",
        args: [encryptedData],
      });

      const tx = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (tx.status === "success") {
        setSuccess(
          "Wealth submitted successfully! Your encrypted amount has been recorded."
        );
        setAmount("");
        setEncryptedData("");
        setDisplayedEncryption("");
        triggerRefetch();
        if (onSuccess) onSuccess();
      } else {
        setError("Transaction failed");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "";
      if (errorMessage.includes("Already Amount Added")) {
        setError(
          "You have already submitted your wealth. Each address can only submit once."
        );
      } else if (errorMessage.includes("user rejected")) {
        setError("Transaction was rejected. Please try again.");
      } else if (errorMessage.includes("insufficient funds")) {
        setError("Insufficient funds to complete the transaction.");
      } else {
        setError("Failed to submit wealth. Please try again.");
      }
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  };

  const renderStatusOverlay = () => {
    if (status === "idle") return null;

    return (
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative p-4 bg-primary-500/10 rounded-full border border-primary-500/30">
              <Shield className="text-primary-400 animate-pulse" size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-primary-400 font-mono text-lg">
              {status === "encrypting"
                ? "ENCRYPTING..."
                : "SUBMITTING TO BLOCKCHAIN..."}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="relative glassmorphism rounded-xl p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      {renderStatusOverlay()}

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
            <LucideDollarSign className="text-primary-400" size={24} />
          </div>
          <h2 className="text-xl font-mono font-bold text-primary-400">
            Submit Your Wealth
          </h2>
          <Tooltip content="Submit your wealth securely. The amount will be encrypted before being stored on the blockchain.">
            <HelpCircle
              className="text-primary-400/50 hover:text-primary-400 transition-colors cursor-help"
              size={20}
            />
          </Tooltip>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                className="flex-1 p-4 rounded-lg bg-black/50 text-white border border-primary-500/30 focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Enter amount (ETH)"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setEncryptedData("");
                  setDisplayedEncryption("");
                }}
                disabled={loading}
              />
              <Tooltip content="Encrypt amount">
                <button
                  type="button"
                  onClick={confirmAmount}
                  className={`p-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    encryptedData
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-primary-500/10 text-primary-400 border border-primary-500/30 hover:bg-primary-500/20"
                  }`}
                  disabled={loading || !amount}
                >
                  <Check size={20} />
                </button>
              </Tooltip>
            </div>
            <div className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400">
              ETH
            </div>
          </div>

          <AnimatePresence>
            {displayedEncryption && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative bg-black/50 rounded-lg border border-primary-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 animate-pulse"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="text-primary-400" size={16} />
                      <h3 className="text-primary-400 font-mono text-sm">
                        ENCRYPTED DATA
                      </h3>
                    </div>
                    <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="text-green-400" size={16} />
                        ) : (
                          <Copy className="text-primary-400" size={16} />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <code className="text-primary-400 font-mono text-sm break-all">
                      {displayedEncryption}
                    </code>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg text-sm"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 text-green-400 bg-green-900/20 border border-green-500/50 rounded-lg text-sm"
            >
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-neon"
            disabled={loading || !encryptedData}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit Wealth"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default WealthSubmissionForm;
