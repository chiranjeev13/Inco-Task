"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useWalletClient,
  useReadContract,
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

// Remove size restrictions
const tooltipVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Simplified tooltip content style
const tooltipContentStyle = "text-sm p-4 space-y-3 max-w-[400px]";

const WealthSubmissionForm: React.FC<WealthSubmissionFormProps> = ({
  onSuccess,
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { triggerRefetch } = useWealthContext();

  // Add participants check
  const { data: participants } = useReadContract({
    address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
    abi: PrivateWealthABI,
    functionName: "getParticipants",
  });

  const hasSubmitted = React.useMemo(() => {
    if (!address || !participants) return false;
    return participants.includes(address);
  }, [address, participants]);

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "encrypting" | "submitting">(
    "idle"
  );
  const [encryptedData, setEncryptedData] = useState<string>("");
  const [displayedEncryption, setDisplayedEncryption] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset form state when wallet address changes
  useEffect(() => {
    setAmount("");
    setError("");
    setSuccess("");
    setTxHash("");
    setStatus("idle");
    setEncryptedData("");
    setDisplayedEncryption("");
    setCopied(false);
  }, [address]);

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

      setTxHash(txHash);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
              <LucideDollarSign className="text-primary-400" size={24} />
            </div>
            <h2 className="text-xl font-mono font-bold text-primary-400">
              Submit Your Wealth
            </h2>
          </div>
          <Tooltip
            content={
              <motion.div
                variants={tooltipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-sm p-4 space-y-3 max-w-[400px]"
              >
                <div className="space-y-3 text-left">
                  <div className="font-mono text-primary-400 border-b border-primary-500/30 pb-2">
                    Input → Handle Transformation
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="font-mono text-secondary-400">ƒ(x):</div>
                      <div>
                        <code className="text-primary-300">
                          newEuint256(bytes, msg.sender) → handle
                        </code>
                        <div className="text-xs text-gray-400 mt-1">
                          Transforms plaintext into encrypted handle with user
                          context
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="font-mono text-secondary-400">ctx:</div>
                      <div>
                        <code className="text-primary-300">
                          {`{account, chain, contract}`} ⊆ ciphertext
                        </code>
                        <div className="text-xs text-gray-400 mt-1">
                          Embedded security context prevents unauthorized access
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="font-mono text-secondary-400">TEE:</div>
                      <div>
                        <code className="text-primary-300">
                          handle ⊕ symbolic_execution
                        </code>
                        <div className="text-xs text-gray-400 mt-1">
                          Asynchronous secure computation in Trusted Execution
                          Environment
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs border-t border-primary-500/30 pt-2 text-gray-400">
                    Default: handle → 0 if malformed input
                  </div>
                  <div className="mt-4 border-t border-primary-500/30 pt-3">
                    <div className="font-mono text-primary-400 text-xs mb-2">COMPONENT FLOW:</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="font-mono text-secondary-400">1.</div>
                        <div>Enter ETH amount → SDK encrypts with your wallet&apos;s context</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="font-mono text-secondary-400">2.</div>
                        <div>Click encrypt → Generate unique handle with your address as msg.sender</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="font-mono text-secondary-400">3.</div>
                        <div>Submit → Contract stores handle in balanceOf[your_address]</div>
                      </div>
                      <div className="flex items-start gap-2 pt-1 text-primary-300">
                        <div className="font-mono">→</div>
                        <div>Only you can decrypt your wealth, but anyone can compare wealth privately</div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                className="flex-1 p-4 rounded-lg bg-black/50 text-white border border-primary-500/30 focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-gray-500 font-mono"
                placeholder={
                  hasSubmitted
                    ? "Amount already submitted to contract"
                    : "Enter amount"
                }
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setEncryptedData("");
                  setDisplayedEncryption("");
                }}
                disabled={loading || hasSubmitted}
              />
              <motion.button
                type="button"
                onClick={confirmAmount}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg border border-primary-500/30 transition-all duration-200 flex items-center justify-center ${hasSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading || !amount || hasSubmitted}
              >
                <Check size={20} />
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {displayedEncryption && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative bg-black/50 rounded-lg border border-primary-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 animate-pulse"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-primary-400 font-mono text-sm">
                        ENCRYPTED DATA
                      </h3>
                    </div>
                    <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                      <motion.button
                        type="button"
                        onClick={handleCopy}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 hover:bg-primary-500/20 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="text-green-400" size={16} />
                        ) : (
                          <Copy className="text-primary-400" size={16} />
                        )}
                      </motion.button>
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
              className="flex items-center gap-2 p-3 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg text-sm font-mono"
            >
              <span className="text-red-500">ERROR:</span> {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 p-3 text-green-400 bg-green-900/20 border border-green-500/50 rounded-lg text-sm font-mono"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span>{success}</span>
              </div>
              {txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 underline flex items-center gap-2 mt-1"
                >
                  <span>View on Block Explorer</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono ${hasSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading || !encryptedData || hasSubmitted}
          >
            {loading ? (
              <>
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                </div>
                <span>SUBMITTING...</span>
              </>
            ) : (
              <>
                <LucideDollarSign size={20} />
                <span>SUBMIT WEALTH</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Add global animations */}
      <style jsx global>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default WealthSubmissionForm;
