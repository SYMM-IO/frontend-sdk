import { useCallback, useMemo } from "react";

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
import {
  useDiamondContract,
  useMultiAccountContract,
} from "../hooks/useContract";
import { useMultiAccountable } from "../hooks/useMultiAccountable";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ConstructCallReturnType } from "../types/web3";
import { encodeFunctionData } from "viem";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { useExpertMode } from "../state/user/hooks";
import { useWagmiConfig } from "../state/chains";

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

  const Contract = useDiamondContract();
  const MultiAccountContract = useMultiAccountContract();

  const functionName = useMemo(() => {
    return closeQuote === CloseQuote.CANCEL_CLOSE_REQUEST
      ? "requestToCancelCloseRequest"
      : closeQuote === CloseQuote.CANCEL_QUOTE
      ? "requestToCancelQuote"
      : closeQuote === CloseQuote.FORCE_CLOSE
      ? "forceCancelQuote"
      : null;
  }, [closeQuote]);

  const market = useMarket(quote?.marketId);

  const preConstructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !account ||
        !Contract ||
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
  }, [account, Contract, quote, functionName, isSupportedChainId]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !Contract ||
      !MultiAccountContract ||
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

    const summary = ` ${name}-Q${quote.id.toString()} “${
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
          MultiAccountContract,
          constructCall,
          addTransaction,
          addRecentTransaction,
          txInfo,
          wagmiConfig,
          summary,
          true,
          userExpertMode
        ),
    };
  }, [
    account,
    chainId,
    Contract,
    MultiAccountContract,
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
