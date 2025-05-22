import { getAddress, formatUnits, WalletClient } from "viem";
import { Lightning } from "@inco/js/lite";

interface IncoConfig {
  chainId: bigint;
  encrypt: (
    value: bigint,
    options: { accountAddress: string; dappAddress: string }
  ) => Promise<any>;
  getReencryptor: (
    walletClient: any
  ) => Promise<(params: { handle: string }) => Promise<{ value: bigint }>>;
}

export const getConfig = (): IncoConfig => {
  return Lightning.localNode() as IncoConfig;
};

interface EncryptValueParams {
  value: number;
  address: string;
  contractAddress: string;
}

/**
 * @example
 * const encryptedValue = await encryptValue({
 *   value: 100,
 *   address: "0x123...",
 *   contractAddress: "0x456..."
 * });
 */
export const encryptValue = async ({
  value,
  address,
  contractAddress,
}: EncryptValueParams) => {
  // Convert the input value to BigInt for proper encryption
  const valueBigInt = BigInt(value);

  // Format the contract address to checksum format for standardization
  const checksummedAddress = getAddress(contractAddress);

  const incoConfig = getConfig();

  const encryptedData = await incoConfig.encrypt(valueBigInt, {
    accountAddress: address,
    dappAddress: checksummedAddress,
  });

  console.log("Encrypted data:", encryptedData);

  return encryptedData;
};

interface ReEncryptValueParams {
  walletClient: WalletClient;
  handle: string | bigint;
  chainId?: number;
}

/**
 * @example
 * const decryptedValue = await reEncryptValue({
 *   walletClient: yourWalletClient,
 *   handle: encryptionHandle
 * });
 */
export const reEncryptValue = async ({
  walletClient,
  handle,
  chainId,
}: ReEncryptValueParams) => {
  // Validate that all required parameters are provided
  if (!walletClient || !handle) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    const incoConfig = await getConfig();
    const reencryptor = await incoConfig.getReencryptor(walletClient);

    const decryptedResult = await reencryptor({
      handle: handle.toString(),
    });

    // Optional formatting of the decrypted value

    return decryptedResult.value.toString();
  } catch (error) {
    throw new Error(
      `Failed to create reencryptor: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
