import { useCallback, useMemo } from "react";

import useActiveWagmi from "../lib/hooks/useActiveWagmi";

import {
  useDiamondAddress,
  useMuonData,
  usePartyBWhitelistAddress,
  useWagmiConfig,
} from "../state/chains/hooks";

import { CloseQuote } from "../types/trade";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";

import { useActiveAccountAddress, useExpertMode } from "../state/user/hooks";
import { useTransactionAdder } from "../state/transactions/hooks";
import {
  CancelQuoteTransactionInfo,
  TransactionType,
} from "../state/transactions/types";
import { ConstructCallReturnType } from "../types/web3";

import {
  createTransactionCallback,
  TransactionCallbackState,
} from "../utils/web3";

import { useMultiAccountable } from "../hooks/useMultiAccountable";

import { ForceClosePositionClient } from "../lib/muon";
import { Abi, Address, encodeFunctionData } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { DIAMOND_ABI } from "../constants";
import { Quote } from "../types/quote";
import { useMarket } from "../hooks/useMarkets";

export function useForceCloseQuoteCallback(
  quote: Quote | null,
  dateRange: [Date, Date] | null
): {
  state: TransactionCallbackState;
  callback: null | (() => ReturnType<typeof createTransactionCallback>);
  error: string | null;
} {
  const { account, chainId } = useActiveWagmi();
  const addTransaction = useTransactionAdder();
  const userExpertMode = useExpertMode();
  const addRecentTransaction = useAddRecentTransaction();
  const wagmiConfig = useWagmiConfig();

  const activeAccountAddress = useActiveAccountAddress();
  const isSupportedChainId = useSupportedChainId();
  const DIAMOND_ADDRESS = useDiamondAddress();

  const functionName = "forceClosePosition";
  const market = useMarket(quote?.marketId);

  const MuonData = useMuonData();
  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();

  const getSignature = useCallback(async () => {
    if (
      !activeAccountAddress ||
      !chainId ||
      !Object.keys(DIAMOND_ADDRESS).length ||
      !Object.keys(PARTY_B_WHITELIST).length ||
      !ForceClosePositionClient ||
      !MuonData ||
      !quote ||
      !dateRange
    ) {
      throw new Error("Missing muon params");
    }

    const { AppName, Urls } = MuonData[chainId];
    const t0 = dateRange[0].getTime() / 1000;
    const t1 = dateRange[1].getTime() / 1000;
    const partyB = PARTY_B_WHITELIST[chainId];
    const { success, signature, error } =
      await ForceClosePositionClient.getMuonSig(
        AppName,
        activeAccountAddress,
        partyB,
        t0,
        t1,
        quote.marketId,
        Urls,
        chainId,
        DIAMOND_ADDRESS[chainId]
      );

    if (success === false || !signature) {
      throw new Error(`Unable to fetch Muon signature: ${error}`);
    }
    return { signature };
  }, [
    DIAMOND_ADDRESS,
    MuonData,
    PARTY_B_WHITELIST,
    activeAccountAddress,
    chainId,
    dateRange,
    quote,
  ]);

  const preConstructCall = useCallback(async (): ConstructCallReturnType => {
    try {
      if (
        !chainId ||
        !account ||
        !Object.keys(DIAMOND_ADDRESS).length ||
        !isSupportedChainId ||
        !quote
      ) {
        throw new Error("Missing dependencies.");
      }

      const { signature } = await getSignature();

      const args = [BigInt(quote.id), signature];
      console.log(args);

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
    isSupportedChainId,
    quote,
    getSignature,
  ]);

  const constructCall = useMultiAccountable(preConstructCall);

  return useMemo(() => {
    if (
      !account ||
      !chainId ||
      !quote ||
      !market ||
      !Object.keys(DIAMOND_ADDRESS).length ||
      !activeAccountAddress
    ) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }

    const txInfo = {
      type: TransactionType.CANCEL,
      name: market.name,
      id: quote.id.toString(),
      positionType: quote.positionType,
      closeQuote: CloseQuote.FORCE_CLOSE,
      hedger: "",
    } as CancelQuoteTransactionInfo;

    const summary = `${txInfo.name}-Q${txInfo.id} Force Close Position`;

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
          summary,
          userExpertMode
        ),
    };
  }, [
    account,
    chainId,
    quote,
    market,
    DIAMOND_ADDRESS,
    activeAccountAddress,
    constructCall,
    addTransaction,
    addRecentTransaction,
    wagmiConfig,
    userExpertMode,
  ]);
}
