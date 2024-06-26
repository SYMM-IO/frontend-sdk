import { useCallback, useMemo } from "react";

import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import { useTransactionAdder } from "../state/transactions/hooks";
import {
  SignMessageTransactionInfo,
  TransactionType,
} from "../state/transactions/types";

import { useMultiAccountContract } from "../hooks/useContract";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ConstructCallReturnType } from "../types/web3";
import { Address, encodeFunctionData } from "viem";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useActiveAccountAddress } from "../state/user/hooks";
import {
  useFallbackChainId,
  usePartyBWhitelistAddress,
  useWagmiConfig,
} from "../state/chains";

export function useDelegateAccess(): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const isSupportedChainId = useSupportedChainId();
  const wagmiConfig = useWagmiConfig();

  const MultiAccountContract = useMultiAccountContract();
  const activeAccountAddress = useActiveAccountAddress();

  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();
  const FALLBACK_CHAIN_ID = useFallbackChainId();
  const partyBWhiteList = useMemo(
    () => [PARTY_B_WHITELIST[chainId ?? FALLBACK_CHAIN_ID]],
    [FALLBACK_CHAIN_ID, PARTY_B_WHITELIST, chainId]
  );

  const functionName = "delegateAccess";

  const constructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !account ||
        !MultiAccountContract ||
        !activeAccountAddress ||
        !isSupportedChainId ||
        !partyBWhiteList
      ) {
        throw new Error("Missing dependencies for constructCall.");
      }

      const args = [
        activeAccountAddress as Address,
        partyBWhiteList[0] as Address,
        "0x501e891f" as Address,
        true,
      ] as const;

      return {
        args,
        functionName,
        config: {
          account,
          to: MultiAccountContract.address,
          data: encodeFunctionData({
            abi: MultiAccountContract.abi,
            functionName,
            args: [
              activeAccountAddress as Address,
              partyBWhiteList[0] as Address,
              "0x501e891f" as Address,
              true,
            ],
          }),
          value: BigInt(0),
        },
      };
    } catch (error) {
      if (error && typeof error === "string") throw new Error(error);
      throw new Error("error3");
    }
  }, [
    account,
    MultiAccountContract,
    activeAccountAddress,
    isSupportedChainId,
    partyBWhiteList,
  ]);

  return useMemo(() => {
    if (!account || !chainId || !MultiAccountContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies.",
      };
    }

    const txInfo = {
      type: TransactionType.SIGN_MESSAGE,
      text: "Enable instance close",
    } as SignMessageTransactionInfo;

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () =>
        createTransactionCallback(
          functionName,
          MultiAccountContract,
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          undefined,
          false
        ),
    };
  }, [
    account,
    chainId,
    MultiAccountContract,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}
