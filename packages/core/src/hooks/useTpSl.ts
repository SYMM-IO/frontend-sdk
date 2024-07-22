import { useCallback, useMemo } from "react";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";
import { useActiveAccountAddress } from "../state/user/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import { useSingleContractMultipleMethods } from "../lib/hooks/multicall";
import {
  useMultiAccountAddress,
  useTpSlWalletAddress,
  useWagmiConfig,
} from "../state/chains";
import { Address, encodeFunctionData } from "viem";
import {
  CANCEL_CLOSE_QUOTE_HASH_CONTRACT,
  CLOSE_QUOTE_HASH_CONTRACT,
  MULTI_ACCOUNT_ABI,
} from "../constants";
import {
  SignMessageTransactionInfo,
  TransactionType,
} from "../state/transactions/types";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

export function useSendDelegateAccess(): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
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
  const TPSL_WALLET_ADDRESS_CHAIN = useTpSlWalletAddress();
  const TPSL_WALLET_ADDRESS = useMemo(
    () => (chainId ? TPSL_WALLET_ADDRESS_CHAIN[chainId] : ""),
    [TPSL_WALLET_ADDRESS_CHAIN, chainId]
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
        !chainId
      ) {
        throw new Error("Missing dependencies.");
      }

      const args = [
        activeAccountAddress,
        TPSL_WALLET_ADDRESS[chainId],
        [CLOSE_QUOTE_HASH_CONTRACT, CANCEL_CLOSE_QUOTE_HASH_CONTRACT],
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
              TPSL_WALLET_ADDRESS,
              [CLOSE_QUOTE_HASH_CONTRACT, CANCEL_CLOSE_QUOTE_HASH_CONTRACT],
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
    TPSL_WALLET_ADDRESS,
    account,
    activeAccountAddress,
    chainId,
    isSupportedChainId,
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
      text: "Permission granted for Vibe to set TP/SL orders",
    } as SignMessageTransactionInfo;
    const summary = `tpsl delegate Transaction`;
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
          summary
        ),
    };
  }, [
    account,
    chainId,
    MULTI_ACCOUNT_ADDRESS,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
  ]);
}

export function useContractDelegateTpSl(): [boolean, boolean] {
  const activeAccountAddress = useActiveAccountAddress();
  const { chainId } = useActiveWagmi();
  const MULTI_ACCOUNT_ADDRESS_CHAIN = useMultiAccountAddress();
  const MULTI_ACCOUNT_ADDRESS = useMemo(
    () => (chainId ? MULTI_ACCOUNT_ADDRESS_CHAIN[chainId] : ""),
    [MULTI_ACCOUNT_ADDRESS_CHAIN, chainId]
  );
  const TPSL_WALLET_ADDRESS_CHAIN = useTpSlWalletAddress();
  const TPSL_WALLET_ADDRESS = useMemo(
    () => (chainId ? TPSL_WALLET_ADDRESS_CHAIN[chainId] : ""),
    [TPSL_WALLET_ADDRESS_CHAIN, chainId]
  );

  const calls =
    activeAccountAddress && chainId
      ? [
          {
            functionName: "delegatedAccesses",
            callInputs: [
              activeAccountAddress,
              TPSL_WALLET_ADDRESS,
              CLOSE_QUOTE_HASH_CONTRACT,
            ],
          },
          {
            functionName: "delegatedAccesses",
            callInputs: [
              activeAccountAddress,
              TPSL_WALLET_ADDRESS,
              CANCEL_CLOSE_QUOTE_HASH_CONTRACT,
            ],
          },
        ]
      : [];
  const { data: delegateResult, isSuccess: isDelegateSuccess } =
    useSingleContractMultipleMethods(
      MULTI_ACCOUNT_ADDRESS,
      MULTI_ACCOUNT_ABI,
      calls
    );

  return [
    isDelegateSuccess && delegateResult?.[0]?.result ? true : false,
    isDelegateSuccess && delegateResult?.[1]?.result ? true : false,
  ];
}
