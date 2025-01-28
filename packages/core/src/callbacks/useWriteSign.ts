import { useCallback, useMemo } from "react";

import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";

import { useWalletClient } from "wagmi";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useTransactionAdder } from "../state/transactions/hooks";

import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import {
  SignMessageTransactionInfo,
  TransactionType,
} from "../state/transactions/types";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { Abi, Address, encodeFunctionData } from "viem";
import { ConstructCallReturnType } from "../types/web3";
import { useSignatureStoreAddress, useWagmiConfig } from "../state/chains";
import { SIGNATURE_STORE_ABI } from "../constants";

export function useWriteSign(): {
  state: TransactionCallbackState;

  callback:
    | null
    | ((sign: string) => ReturnType<typeof createTransactionCallback>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const { data: provider } = useWalletClient();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const wagmiConfig = useWagmiConfig();

  const isSupportedChainId = useSupportedChainId();
  const SIGNATURE_STORE_ADDRESS = useSignatureStoreAddress();

  const functionName = "storeSignatureForCurrentVersion";

  const constructCall = useCallback(
    async (sign: string): ConstructCallReturnType => {
      try {
        if (
          !chainId ||
          !Object.keys(SIGNATURE_STORE_ADDRESS).length ||
          !sign ||
          !isSupportedChainId
        ) {
          throw new Error("Missing dependencies.");
        }

        const args = [sign as Address];

        return {
          args,
          functionName,
          config: {
            account: account as Address,
            to: SIGNATURE_STORE_ADDRESS[chainId] as Address,
            data: encodeFunctionData({
              abi: SIGNATURE_STORE_ABI as Abi,
              functionName,
              args,
            }),
            value: BigInt(0),
          },
        };
      } catch (error) {
        if (error && typeof error === "string") throw new Error(error);
        throw new Error("error3");
      }
    },
    [SIGNATURE_STORE_ADDRESS, account, chainId, isSupportedChainId]
  );

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !provider ||
      !Object.keys(SIGNATURE_STORE_ADDRESS).length
    ) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    const txInfo = {
      type: TransactionType.SIGN_MESSAGE,
      text: "Sign Message",
    } as SignMessageTransactionInfo;

    const summary = `Sign Message`;

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: (sign: string) =>
        createTransactionCallback(
          functionName,
          () => constructCall(sign),
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          summary
        ),
    };
  }, [
    account,
    chainId,
    provider,
    SIGNATURE_STORE_ADDRESS,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    constructCall,
  ]);
}
