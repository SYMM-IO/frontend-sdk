import { useCallback, useMemo } from "react";

import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";

import { useSignatureStoreContract } from "../hooks/useContract";

import { useWalletClient } from "wagmi";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useTransactionAdder } from "../state/transactions/hooks";

import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import {
  SignMessageTransactionInfo,
  TransactionType,
} from "../state/transactions/types";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { Address, encodeFunctionData } from "viem";
import { ConstructCallReturnType } from "../types/web3";
import { useWagmiConfig } from "../state/chains";

export function useWriteSign(): {
  state: TransactionCallbackState;
  callback: null | ((sign: string) => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const { data: provider } = useWalletClient();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const wagmiConfig = useWagmiConfig();

  const isSupportedChainId = useSupportedChainId();
  const Contract = useSignatureStoreContract();

  const functionName = "storeSignatureForCurrentVersion";

  const constructCall = useCallback(
    async (sign: string): ConstructCallReturnType => {
      try {
        if (!Contract || !sign || !isSupportedChainId) {
          throw new Error("Missing dependencies.");
        }

        const args = [sign as Address];

        return {
          args,
          functionName,
          config: {
            account: account as Address,
            to: Contract.address,
            data: encodeFunctionData({
              abi: Contract.abi,
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
    [Contract, account, isSupportedChainId]
  );

  return useMemo(() => {
    if (!account || !chainId || !provider || !Contract) {
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
          Contract,
          () => constructCall(sign),
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          summary,
          false
        ),
    };
  }, [
    account,
    chainId,
    provider,
    Contract,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    constructCall,
  ]);
}
