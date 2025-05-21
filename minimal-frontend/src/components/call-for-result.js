import React, { useState } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useReadContract,
} from "wagmi";
import { Trophy, RefreshCw, Award, Coins } from "lucide-react";
import {
  PRIVATE_WEALTH_CONTRACT_ADDRESS,
  PrivateWealthABI,
} from "@/utils/contract";
import { anvil, baseSepolia } from "viem/chains";
import { parseEther } from "viem";
import { createTestClient, http } from "viem";
import { readContract } from "viem/actions";

const CallForResult = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isSettingBalance, setIsSettingBalance] = useState(false);
  const [error, setError] = useState("");
  const [winner, setWinner] = useState(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const testClient = createTestClient({
    chain: anvil,
    mode: "anvil",
    transport: http(),
  });

  const { data: winnerData, refetch: refetchWinner } = useReadContract({
    address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
    abi: PrivateWealthABI,
    functionName: "getWinners",
  });

  console.log(winnerData);

  const setBalance = async () => {
    if (!address) return;

    setError("");
    setIsSettingBalance(true);

    try {
      await testClient.setBalance({
        address: address,
        value: parseEther("1"),
      });
      console.log("Balance set successfully for:", address);
    } catch (error) {
      console.error("Failed to set balance:", error);
      setError("Failed to set balance");
    } finally {
      setIsSettingBalance(false);
    }
  };

  const callRichest = async () => {
    setError("");
    setIsLoading(true);

    try {
      const hash = await writeContractAsync({
        address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        abi: PrivateWealthABI,
        functionName: "richest",
        chain: anvil,
        account: address,
      });

      const transaction = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      if (transaction.status !== "success") {
        throw new Error("Transaction failed");
      }

      console.log("Transaction successful:", transaction);
      // Refresh winner data after calling richest
      refetchWinner();
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const callResetArrays = async () => {
    setError("");
    setIsResetLoading(true);

    try {
      const hash = await writeContractAsync({
        address: PRIVATE_WEALTH_CONTRACT_ADDRESS,
        abi: PrivateWealthABI,
        functionName: "resetArrays",
        chain: anvil,
        account: address,
      });

      const transaction = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      if (transaction.status !== "success") {
        throw new Error("Transaction failed");
      }

      console.log("Reset successful:", transaction);
      // Clear winner data after reset
      setWinner(null);
    } catch (error) {
      console.error("Reset failed:", error);
      setError(error.message || "Reset failed");
    } finally {
      setIsResetLoading(false);
    }
  };

  const fetchWinner = async () => {
    try {
      const result = await refetchWinner();
      console.log(result);
      if (result.data) {
        setWinner(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch winner:", error);
      setError("Failed to fetch winner");
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full bg-gray-700/40 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="mr-3 text-yellow-400" />
              Contract Actions
            </h2>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {winner && (
              <div className="bg-green-900/20 border border-green-500 text-green-400 p-3 rounded-lg text-center">
                <p className="font-semibold">Current Winner:</p>
                <p className="text-sm mt-1">{winner}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={setBalance}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSettingBalance || isLoading || isResetLoading}
              >
                {isSettingBalance ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <div className="flex items-center">
                    Set Balance (1 ETH) <Coins className="ml-2" />
                  </div>
                )}
              </button>

              <button
                onClick={callRichest}
                className="w-full p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isResetLoading || isSettingBalance}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <div className="flex items-center">
                    Check Richest <Trophy className="ml-2" />
                  </div>
                )}
              </button>

              <button
                onClick={fetchWinner}
                className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isResetLoading || isSettingBalance}
              >
                <div className="flex items-center">
                  Fetch Winner <Award className="ml-2" />
                </div>
              </button>

              <button
                onClick={callResetArrays}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isResetLoading || isSettingBalance}
              >
                {isResetLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <div className="flex items-center">
                    Reset Arrays <RefreshCw className="ml-2" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallForResult;
