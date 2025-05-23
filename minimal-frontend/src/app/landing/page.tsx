"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  Shield,
  LucideDollarSign,
  ArrowRight,
  LogOut,
  User,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";
import Image from "next/image";

export default function LandingPage() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const features = [
    { icon: <Lock className="w-5 h-5" />, text: "Encrypted Transactions" },
    { icon: <Shield className="w-5 h-5" />, text: "Private & Secure" },
    {
      icon: <LucideDollarSign className="w-5 h-5" />,
      text: "Wealth Comparison",
    },
  ];

  const typingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  const renderTypingText = (text: string) => (
    <motion.h2
      variants={typingVariants}
      initial="hidden"
      animate="visible"
      className="text-5xl md:text-6xl font-bold mb-6 text-white"
    >
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={letterVariants}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h2>
  );

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      {/* Removed per-page background image */}

      {/* Content */}
      <div className="relative z-10">
        <div className="relative border-primary-500/20">
          <div className="container mx-auto px-6 py-6">
            {/* Header */}
            <header className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono">
                    Powered by
                  </span>
                  <Image
                    src="/inco_logo.svg"
                    alt="Inco Logo"
                    width={100}
                    height={40}
                  />
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/30 ml-4"
                >
                  <Shield className="text-primary-400" size={24} />
                </motion.div>
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
                      <span className="font-mono hidden md:inline">
                        DISCONNECT
                      </span>
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
                    <span className="font-mono">CONNECT WALLET</span>
                  </button>
                )}
              </motion.div>
            </header>

            {/* Hero Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center relative z-10"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                className="relative mx-auto mb-8 w-24 h-24"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative h-full flex items-center justify-center p-5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full border border-primary-500/30">
                  <LucideDollarSign className="text-primary-400" size={40} />
                </div>
              </motion.div>

              {renderTypingText("Yao's Problem of Millionaire's")}

              {/* Features */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex gap-6 mb-12"
              >
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500/5 rounded-full border border-primary-500/20"
                  >
                    <span className="text-primary-400">{feature.icon}</span>
                    <span className="text-gray-300 text-sm">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Button */}
              {isConnected ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/app")}
                  className="flex items-center gap-2 px-8 py-4 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg transition-all duration-200 hover:shadow-neon font-mono"
                >
                  <span>L0UnCh ÁpP</span>
                  <ArrowRight size={20} />
                </motion.button>
              ) : (
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 px-8 py-4 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg transition-all duration-200 hover:shadow-neon font-mono"
                >
                  CONNECT WALLET
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
