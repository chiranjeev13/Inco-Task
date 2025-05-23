"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import WealthSubmissionForm from "../../components/WealthSubmissionForm";
import OwnWealthDisplay from "../../components/OwnWealthDisplay";
import RichestUsersDisplay from "../../components/RichestUsersDisplay";
import ResetButton from "../../components/ResetButton";
import ParticipantsDisplay from "../../components/ParticipantsDisplay";
import { useDisconnect } from "wagmi";

export default function AppPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <main className="min-h-screen">
      <div className="relative bg-black/30 backdrop-blur-md border-b border-primary-500/20">
        <div className="container mx-auto px-6 py-6">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-mono">Powered by</span>
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
            </motion.div>
          </header>
        </div>
      </div>

      {/* Application Section */}
      <div className="container mx-auto px-6 py-10">
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
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ParticipantsDisplay />
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
      </div>
    </main>
  );
}
