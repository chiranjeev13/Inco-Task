"use client";

import React, { useEffect } from "react";
import { useReadContract } from "wagmi";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "../utils/contract";
import { Users, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip } from "./Tooltip";
import { useWealthContext } from "../provider/WealthProvider";

const ParticipantsDisplay: React.FC = () => {
  const { lastUpdate } = useWealthContext();
  const {
    data: participants,
    isLoading,
    refetch,
  } = useReadContract({
    address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
    abi: PrivateWealthABI,
    functionName: "getParticipants",
  }) as { data: string[] | undefined; isLoading: boolean; refetch: () => void };

  // Refetch when lastUpdate changes
  useEffect(() => {
    refetch();
  }, [lastUpdate, refetch]);

  // Poll for participants every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [refetch]);

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
            <div className="p-2 bg-secondary-500/10 rounded-lg border border-secondary-500/30">
              <Users className="text-secondary-400" size={24} />
            </div>
            <h2 className="text-xl font-mono font-bold text-secondary-400">
              Participants
            </h2>
            <Tooltip content="View all users who have submitted their wealth data">
              <HelpCircle
                className="text-secondary-400/50 hover:text-secondary-400 transition-colors cursor-help"
                size={20}
              />
            </Tooltip>
          </div>
        </div>

        {isLoading ? (
          <div className="h-32 flex flex-col items-center justify-center gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-secondary-500/20 rounded-full blur-lg animate-pulse"></div>
              <div className="relative h-full flex items-center justify-center p-3 bg-secondary-500/10 rounded-full border border-secondary-500/30">
                <Users className="text-secondary-400" size={24} />
              </div>
            </div>
            <p className="text-secondary-400 font-mono animate-pulse">
              LOADING PARTICIPANTS...
            </p>
          </div>
        ) : participants && participants.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {participants.map((participant: string, idx: number) => (
              <motion.div
                key={participant}
                variants={itemVariants}
                className="group flex items-center justify-between p-3 bg-black/50 rounded-lg border border-secondary-500/30 hover:border-secondary-500/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-secondary-400" size={18} />
                  <code className="text-gray-300 font-mono text-sm group-hover:text-secondary-300 transition-colors">
                    {participant.slice(0, 6)}...{participant.slice(-4)}
                  </code>
                </div>
                <div className="px-2 py-1 bg-secondary-500/10 rounded border border-secondary-500/30">
                  <span className="text-secondary-400 text-xs font-mono">
                    PARTICIPANT #{idx + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Users size={24} className="opacity-50" />
            <span className="font-mono">NO PARTICIPANTS YET</span>
            <p className="text-xs text-center max-w-xs opacity-70">
              Be the first to submit your wealth data
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ParticipantsDisplay;
