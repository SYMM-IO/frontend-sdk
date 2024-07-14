import { useCallback, useMemo } from "react";
import { Abi, Address, encodeFunctionData } from "viem";

import { Quote } from "../types/quote";
import { CloseQuote, CloseQuoteMessages } from "../types/trade";

import { useTransactionAdder } from "../state/transactions/hooks";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import {
  CancelQuoteTransactionInfo,
  TransactionType,
} from "../state/transactions/types";
import {
  TransactionCallbackState,
  createTransactionCallback,
} from "../utils/web3";

import { useMarket } from "../hooks/useMarkets";
import { useMultiAccountable } from "../hooks/useMultiAccountable";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ConstructCallReturnType } from "../types/web3";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useExpertMode } from "../state/user/hooks";
import { useDiamondAddress, useWagmiConfig } from "../state/chains";
import { DIAMOND_ABI } from "../constants";

export function useCancelQuote(
  quote: Quote | null,
  closeQuote: CloseQuote | null
): {
  state: TransactionCallbackState;
  callback: null | (() => Promise<any>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const addRecentTransaction = useAddRecentTransaction();
  const isSupportedChainId = useSupportedChainId();
  const userExpertMode = useExpertMode();
  const wagmiConfig = useWagmiConfig();

  const DIAMOND_ADDRESS = useDiamondAddress();

  const functionName = useMemo(() => {
    return closeQuote === CloseQuote.CANCEL_CLOSE_REQUEST
      ? "requestToCancelCloseRequest"
      : closeQuote === CloseQuote.CANCEL_QUOTE
      ? "requestToCancelQuote"
      : closeQuote === CloseQuote.FORCE_CANCEL
      ? "forceCancelQuote"
      : closeQuote === CloseQuote.FORCE_CANCEL_CLOSE
      ? "forceCancelCloseRequest"
      : null;
  }, [closeQuote]);

  const market = useMarket(quote?.marketId);

  const preConstructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !chainId ||
        !account ||
        !Object.keys(DIAMOND_ADDRESS).length ||
        !quote ||
        !functionName ||
        !isSupportedChainId
      ) {
        throw new Error("Missing dependencies.");
      }

      const args = [BigInt(quote.id)];
      return {
        args,
        functionName,
        config: {
          account,
          to: DIAMOND_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: DIAMOND_ABI as Abi,
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
  }, [
    chainId,
    account,
    DIAMOND_ADDRESS,
    quote,
    functionName,
    isSupportedChainId,
  ]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !Object.keys(DIAMOND_ADDRESS).length ||
      !market ||
      !functionName ||
      !quote
    ) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    const summary = ` ${market.name}-Q${quote.id.toString()} “${
      CloseQuoteMessages[closeQuote || CloseQuote.CANCEL_QUOTE]
    }” ${status}`;

    const txInfo = {
      type: TransactionType.CANCEL,
      name: market.name,
      id: quote.id.toString(),
      positionType: quote.positionType,
      closeQuote,
      hedger: "",
    } as CancelQuoteTransactionInfo;

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      summary,
      callback: () =>
        createTransactionCallback(
          functionName,
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          summary,
          userExpertMode
        ),
    };
  }, [
    account,
    chainId,
    DIAMOND_ADDRESS,
    market,
    functionName,
    quote,
    closeQuote,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    userExpertMode,
  ]);
}
