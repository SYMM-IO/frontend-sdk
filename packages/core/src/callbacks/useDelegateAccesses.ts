import { useCallback, useMemo } from "react";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";
import { useActiveAccountAddress, useFEName } from "../state/user/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import {
  useMultiAccountAddress,
  usePartyBWhitelistAddress,
  useTpSlWalletAddress,
  useWagmiConfig,
} from "../state/chains";
import { Address, encodeFunctionData } from "viem";
import {
  CANCEL_CLOSE_QUOTE_HASH_CONTRACT,
  CLOSE_QUOTE_HASH_CONTRACT,
  MULTI_ACCOUNT_ABI,
  SEND_QUOTE_HASH_CONTRACT,
  SEND_QUOTE_WITH_AFFILIATE_HASH_CONTRACT,
} from "../constants";
import {
  SignMessageTransactionInfo,
  TransactionType,
} from "../state/transactions/types";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

export function useDelegateAccesses(
  targetAddress: string,
  selectors: string[],
  popupText: string
): {
  state: TransactionCallbackState;
  callback: null | (() => ReturnType<typeof createTransactionCallback>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const addTransaction = useTransactionAdder();
  const isSupportedChainId = useSupportedChainId();

  const MULTI_ACCOUNT_ADDRESS_CHAIN = useMultiAccountAddress();
  const MULTI_ACCOUNT_ADDRESS = useMemo(
    () => (chainId ? MULTI_ACCOUNT_ADDRESS_CHAIN[chainId] : ""),
    [MULTI_ACCOUNT_ADDRESS_CHAIN, chainId]
  );

  const addRecentTransaction = useAddRecentTransaction();
  const wagmiConfig = useWagmiConfig();
  const functionName = "delegateAccesses";

  const constructCall = useCallback<any>(async () => {
    try {
      if (
        !MULTI_ACCOUNT_ADDRESS ||
        !isSupportedChainId ||
        !activeAccountAddress ||
        !chainId ||
        !targetAddress ||
        !selectors
      ) {
        throw new Error("Missing dependencies.");
      }

      const args = [
        activeAccountAddress,
        targetAddress as Address,
        selectors as Address[],
        true,
      ] as const;

      return {
        args,
        functionName,
        config: {
          account,
          to: MULTI_ACCOUNT_ADDRESS as Address,
          data: encodeFunctionData({
            abi: MULTI_ACCOUNT_ABI,
            functionName,
            args: [
              activeAccountAddress as Address,
              targetAddress as Address,
              selectors as Address[],
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
    MULTI_ACCOUNT_ADDRESS,
    account,
    activeAccountAddress,
    chainId,
    isSupportedChainId,
    selectors,
    targetAddress,
  ]);

  return useMemo(() => {
    if (!account || !chainId || !MULTI_ACCOUNT_ADDRESS) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    const txInfo = {
      type: TransactionType.SIGN_MESSAGE,
      text: popupText,
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
          wagmiConfig,
          undefined
        ),
    };
  }, [
    account,
    chainId,
    MULTI_ACCOUNT_ADDRESS,
    popupText,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}

export function useTpSlDelegateAccesses() {
  const { chainId } = useActiveWagmi();
  const feName = useFEName();
  const TPSL_WALLET_ADDRESS_CHAIN = useTpSlWalletAddress();
  const TPSL_WALLET_ADDRESS = useMemo(
    () => (chainId ? TPSL_WALLET_ADDRESS_CHAIN[chainId] : ""),
    [TPSL_WALLET_ADDRESS_CHAIN, chainId]
  );
  const selectors = [
    CLOSE_QUOTE_HASH_CONTRACT,
    CANCEL_CLOSE_QUOTE_HASH_CONTRACT,
  ];
  const { callback: setDelegateAccessCallBack, error } = useDelegateAccesses(
    TPSL_WALLET_ADDRESS,
    selectors,
    `Permission granted for ${feName} to set TP/SL orders.`
  );
  return { setDelegateAccessCallBack, error };
}

export function useInstantOpenDelegateAccesses() {
  const { chainId } = useActiveWagmi();
  const feName = useFEName();
  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();
  const partyBWhiteList = useMemo(
    () => (chainId ? PARTY_B_WHITELIST[chainId] : ""),
    [PARTY_B_WHITELIST, chainId]
  );
  const selectors = [
    SEND_QUOTE_HASH_CONTRACT,
    SEND_QUOTE_WITH_AFFILIATE_HASH_CONTRACT,
  ];

  const { callback: delegateAccessCallback, error } = useDelegateAccesses(
    partyBWhiteList,
    selectors,
    `Permission granted for ${feName} to instant open.`
  );
  return { delegateAccessCallback, error };
}
