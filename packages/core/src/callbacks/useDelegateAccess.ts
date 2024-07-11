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

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ConstructCallReturnType } from "../types/web3";
import { Address, encodeFunctionData } from "viem";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useActiveAccountAddress } from "../state/user/hooks";
import {
  useFallbackChainId,
  useMultiAccountABI,
  useMultiAccountAddress,
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

  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const MULTI_ACCOUNT_ABI = useMultiAccountABI();

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
        !chainId ||
        !account ||
        !MULTI_ACCOUNT_ABI ||
        !Object.keys(MULTI_ACCOUNT_ADDRESS).length ||
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
          to: MULTI_ACCOUNT_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: MULTI_ACCOUNT_ABI,
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
    chainId,
    account,
    MULTI_ACCOUNT_ABI,
    MULTI_ACCOUNT_ADDRESS,
    activeAccountAddress,
    isSupportedChainId,
    partyBWhiteList,
  ]);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !MULTI_ACCOUNT_ABI ||
      !Object.keys(MULTI_ACCOUNT_ADDRESS).length
    ) {
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
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig
        ),
    };
  }, [
    account,
    chainId,
    MULTI_ACCOUNT_ABI,
    MULTI_ACCOUNT_ADDRESS,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}
