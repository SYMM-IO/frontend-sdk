import { useCallback, useMemo } from "react";

import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  AddAccountTransactionInfo,
  TransactionType,
} from "../state/transactions/types";

import { useMultiAccountContract } from "../hooks/useContract";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { encodeFunctionData } from "viem";
import { ConstructCallReturnType } from "../types/web3";
import { useWalletClient } from "wagmi";
import { useWagmiConfig } from "../state/chains";

export function useAddAccountToContract(accountName: string): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const isSupportedChainId = useSupportedChainId();
  const Contract = useMultiAccountContract();
  const addRecentTransaction = useAddRecentTransaction();
  const wagmiConfig = useWagmiConfig();

  const functionName = "addAccount";

  const constructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (!Contract || !accountName || !isSupportedChainId || !account) {
        throw new Error("Missing dependencies.");
      }

      const args = [accountName];

      return {
        args,
        functionName,
        config: {
          account,
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
  }, [Contract, account, accountName, isSupportedChainId]);

  return useMemo(() => {
    if (!account || !chainId || !Contract || !accountName) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    const txInfo = {
      type: TransactionType.ADD_ACCOUNT,
      name: accountName,
    } as AddAccountTransactionInfo;

    const summary = `Add new account [${txInfo.name}]}`;

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () =>
        createTransactionCallback(
          functionName,
          Contract,
          constructCall,
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
    Contract,
    accountName,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}

export function useSignMessage(): {
  state: TransactionCallbackState;
  callback: null | ((message: string) => Promise<string>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const { data: provider } = useWalletClient();
  const Contract = useMultiAccountContract();

  return useMemo(() => {
    if (!account || !chainId || !Contract || !provider) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: async function onSign(message: string): Promise<string> {
        if (!message) {
          throw new Error("No message provided");
        }
        return provider
          .signMessage({ message })
          .then((response) => {
            return response;
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error("Transaction rejected.");
            } else if (error?.code === "ACTION_REJECTED") {
              throw new Error(`Transaction rejected`);
            } else {
              throw new Error(`Transaction rejected`);
            }
          });
      },
    };
  }, [account, chainId, provider, Contract]);
}
