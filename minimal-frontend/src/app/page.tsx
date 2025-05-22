"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { Wallet, LogOut, User, Shield, Lock, ChevronDown, Star, LucideDollarSign } from "lucide-react";
import { motion } from "framer-motion";
import WealthSubmissionForm from "../components/WealthSubmissionForm";
import OwnWealthDisplay from "../components/OwnWealthDisplay";
import RichestUsersDisplay from "../components/RichestUsersDisplay";
import ResetButton from "../components/ResetButton";
import { useContractRead } from "wagmi";
import PrivateWealthABI from "../abi/PrivateWealth.json";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState<boolean>(false);
  const [winners, setWinners] = useState<string[]>([]);

  const { data: winnersData } = useContractRead({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: PrivateWealthABI,
    functionName: 'getWinners',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (winnersData) {
      setWinners(winnersData as string[]);
    }
  }, [winnersData]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-black/30 backdrop-blur-md border-b border-primary-500/20">
        <div className="container mx-auto px-6 py-6">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30"
              >
                <Shield className="text-primary-400" size={24} />
              </motion.div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-mono font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
              >
                PRIVATEWEALTH
              </motion.h1>
            </div>
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex gap-4"
            >
              {isConnected ? (
                <>
                  <button
                    onClick={() => disconnect()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span className="font-mono hidden md:inline">DISCONNECT</span>
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <User size={18} className="text-primary-400" />
                    <code className="text-primary-400 font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </code>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg transition-all duration-200 hover:shadow-neon"
                >
                  <Wallet size={18} />
                  <span className="font-mono">CONNECT WALLET</span>
                </button>
              )}
            </motion.div>
          </header>

          {/* Hero content */}
          {!isConnected && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="py-16 md:py-24 text-center max-w-3xl mx-auto"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                className="relative mx-auto mb-8 w-24 h-24"
              >
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative h-full flex items-center justify-center p-5 bg-primary-500/10 rounded-full border border-primary-500/30">
                  <LucideDollarSign className="text-primary-400" size={40} />
                </div>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-300 bg-clip-text text-transparent">
                Secure Wealth Management
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Submit, compare, and discover the wealthiest users while maintaining complete privacy through encrypted transactions.
              </p>
              <button
                onClick={() => open()}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-neon transform hover:scale-105"
              >
                Connect Your Wallet
              </button>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-16 text-gray-400"
              >
                <ChevronDown size={24} className="mx-auto" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Application Section */}
      <div className="container mx-auto px-6 py-10">
        {isConnected ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Left Column */}
            <div className="space-y-8">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <WealthSubmissionForm />
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <OwnWealthDisplay />
              </motion.div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <RichestUsersDisplay />
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ResetButton />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="py-20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl glassmorphism">
              <div className="p-4 bg-primary-500/10 rounded-full border border-primary-500/30">
                <Star className="text-primary-400 w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">How It Works</h3>
                <p className="text-gray-300 mb-4">
                  Our platform uses encryption to protect your financial information while allowing secure comparisons. Here&apos;s the process:
                </p>
                <ol className="space-y-2 text-gray-400 list-decimal list-inside">
                  <li>Connect your wallet to authenticate</li>
                  <li>Submit your wealth data (fully encrypted)</li>
                  <li>Calculate the wealthiest users without revealing values</li>
                  <li>View the winners without compromising privacy</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}