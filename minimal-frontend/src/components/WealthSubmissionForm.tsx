"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { PRIVATE_WEALTH_CONTRACT_ADDRESS, PrivateWealthABI } from "../utils/contract";
import { encryptValue } from "../utils/inco-lite";
import { AlertCircle, CheckCircle2, Loader2, KeyRound, Shield, Eye, EyeOff, Lock, LucideDollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface WealthSubmissionFormProps {
  onSuccess?: () => void;
}

const WealthSubmissionForm: React.FC<WealthSubmissionFormProps> = ({ onSuccess }) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'encrypting' | 'submitting'>('idle');
  const [encryptedData, setEncryptedData] = useState<string>("");
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Real-time encryption as user types
  useEffect(() => {
    const encryptAmount = async () => {
      if (!amount || !address) {
        setEncryptedData("");
        return;
      }

      setIsEncrypting(true);
      try {
        const encrypted = await encryptValue({
          value: amount as number,
          address,
          contractAddress: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        });
        setEncryptedData(encrypted);
      } catch (err) {
        console.error("Encryption failed:", err);
      } finally {
        setIsEncrypting(false);
      }
    };

    const timeoutId = setTimeout(encryptAmount, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [amount, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!address || !walletClient.data) {
      setError("Please connect your wallet to submit wealth.");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    setStatus('submitting');
    try {
      // @ts-ignore - Contract write configuration is valid at runtime
      const txHash = await writeContractAsync({
        address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        abi: PrivateWealthABI,
        functionName: "submitWealth",
        args: [encryptedData],
      });

      const tx = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if(tx.status === "success") setSuccess("Wealth submitted successfully! Your encrypted amount has been recorded.");
      else setError("EVM REVERTED");
      setAmount(0);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      // Handle specific contract revert reasons
      const errorMessage = err?.message || "";
      if (errorMessage.includes("Already Amount Added")) {
        setError("You have already submitted your wealth. Each address can only submit once.");
      } else if (errorMessage.includes("user rejected")) {
        setError("Transaction was rejected. Please try again.");
      } else if (errorMessage.includes("insufficient funds")) {
        setError("Insufficient funds to complete the transaction.");
      } else {
        setError("Failed to submit wealth. Please try again.");
      }
    } finally {
      setLoading(false);
      setStatus('idle');
    }
  };

  const renderStatusOverlay = () => {
    if (status === 'idle') return null;

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
            <h3 className="text-primary-400 font-mono text-lg">SUBMITTING TO BLOCKCHAIN...</h3>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 animated-gradient opacity-20"></div>

      {renderStatusOverlay()}

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
            <LucideDollarSign className="text-primary-400" size={24} />
          </div>
          <h2 className="text-xl font-mono font-bold text-primary-400">Submit Your Wealth</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              className="w-full p-4 rounded-lg bg-black/50 text-white border border-primary-500/30 focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-200"
              placeholder="Enter amount (ETH)"
              value={amount}
              onChange={e => setAmount(e.target.value as unknown as number)}
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">ETH</div>
          </div>

          {/* Real-time encryption display */}
          <div className="relative bg-black/50 rounded-lg border border-primary-500/30 overflow-hidden transition-all duration-300 ease-in-out transform origin-top scale-100 opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 animate-pulse"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="text-primary-400" size={16} />
                  <h3 className="text-primary-400 font-mono text-sm">ENCRYPTED DATA</h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowEncrypted(!showEncrypted);
                  }}
                  className="p-1 hover:bg-primary-500/10 rounded transition-colors"
                >
                  {showEncrypted ? (
                    <EyeOff className="text-primary-400" size={16} />
                  ) : (
                    <Eye className="text-primary-400" size={16} />
                  )}
                </button>
              </div>
              <div className="relative">
                {isEncrypting ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : encryptedData ? (
                  <code className={`text-gray-300 font-mono text-sm break-all transition-opacity duration-300 ${showEncrypted ? 'opacity-100' : 'opacity-0'}`}>
                    {showEncrypted ? encryptedData : '••••••••••••••••••••••••••••••••'}
                  </code>
                ) : (
                  <div className="text-gray-500 font-mono text-sm">Enter amount to see encrypted data</div>
                )}
              </div>
            </div>
          </div>

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