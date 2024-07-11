import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../declaration";

import {
  MarketDataMap,
  MarketData,
  MarketDepthData,
  MarketNotionalCap,
  FundingRateMap,
  FundingRateData,
} from "./types";
import {
  updateWebSocketStatus,
  updatePrices,
  updateDepth,
  updateNotionalCap,
  updateFundingRates,
} from "./actions";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import { useSupportedChainId } from "../../lib/hooks/useSupportedChainId";
import useDebounce from "../../lib/hooks/useDebounce";
import { ApiState, ConnectionStatus } from "../../types/api";
import { useHedgerAddress } from "../chains/hooks";
import { SupportedChainId } from "../../constants/chains";

export function useMarketsStatus(): ApiState {
  const marketsStatus: ApiState = useAppSelector(
    (state) => state.hedger.marketsStatus
  );
  return marketsStatus;
}

export function useOpenInterestStatus(): ApiState {
  const openInterestStatus: ApiState = useAppSelector(
    (state) => state.hedger.openInterestStatus
  );
  return openInterestStatus;
}

export function useSetWebSocketStatus() {
  const dispatch = useAppDispatch();
  return useCallback(
    (status: ConnectionStatus) => {
      dispatch(updateWebSocketStatus({ status }));
    },
    [dispatch]
  );
}

export function useActiveHedgerId() {
  return 0;
}
export function useHedgerInfo() {
  const { chainId } = useActiveWagmi();
  const isSupportedChainId = useSupportedChainId();
  const debouncedIsSupportedChainId = useDebounce(isSupportedChainId, 3000);
  const hedgerAddress = useHedgerAddress();
  const activeHedgerId = useActiveHedgerId();
  return useMemo(
    () =>
      debouncedIsSupportedChainId && chainId && hedgerAddress[chainId]
        ? hedgerAddress[chainId][activeHedgerId]
        : hedgerAddress[SupportedChainId.NOT_SET][activeHedgerId],
    [activeHedgerId, chainId, debouncedIsSupportedChainId, hedgerAddress]
  );
}

export function useWebSocketUrl() {
  const hedger = useHedgerInfo();
  return useMemo(() => (hedger ? hedger.webSocketUrl : null), [hedger]);
}

export function useWebSocketStatus() {
  const webSocketStatus = useAppSelector(
    (state) => state.hedger.webSocketStatus
  );
  return webSocketStatus;
}

export function useMarkets() {
  const markets = useAppSelector((state) => state.hedger.markets);
  return markets;
}

export function useErrorMessages() {
  const errorMessages = useAppSelector((state) => state.hedger.errorMessages);
  return errorMessages;
}

export function useMarketNotionalCap() {
  const marketNotionalCap = useAppSelector(
    (state) => state.hedger.marketNotionalCap
  );
  const marketNotionalCapStatus = useAppSelector(
    (state) => state.hedger.marketNotionalCapStatus
  );
  return { marketNotionalCap, marketNotionalCapStatus };
}

export function useMarketOpenInterest() {
  const openInterest = useAppSelector((state) => state.hedger.openInterest);
  return openInterest;
}

export function usePrices() {
  const prices = useAppSelector((state) => state.hedger.prices);
  return prices;
}

export function useMarketPriceRange() {
  const priceRange = useAppSelector((state) => state.hedger.priceRange);
  return priceRange;
}

export function useMarketData(name: string | undefined): MarketData | null {
  const prices = useAppSelector((state) => state.hedger.prices);
  return name ? prices[name] : null;
}

export function useFundingRateData(
  name: string | undefined
): FundingRateData | null {
  const fundingRates = useAppSelector((state) => state.hedger.fundingRates);
  return name ? fundingRates[name] : null;
}

export function useMarketDepth(
  name: string | undefined
): MarketDepthData | null {
  const depths = useAppSelector((state) => state.hedger.depths);
  return name ? depths[name] : null;
}

export function useSetPrices() {
  const dispatch = useAppDispatch();
  return useCallback(
    (prices: MarketDataMap) => {
      dispatch(updatePrices({ prices }));
    },
    [dispatch]
  );
}

export function useSetFundingRates() {
  const dispatch = useAppDispatch();
  return useCallback(
    (fundingRates: FundingRateMap) => {
      dispatch(updateFundingRates({ fundingRates }));
    },
    [dispatch]
  );
}

export function useSetDepth() {
  const dispatch = useAppDispatch();
  return useCallback(
    (depth: MarketDepthData, name: string) => {
      dispatch(updateDepth({ name, depth }));
    },
    [dispatch]
  );
}

export function useSetNotionalCap() {
  const dispatch = useAppDispatch();
  return useCallback(
    (notionalCap: MarketNotionalCap) => {
      dispatch(updateNotionalCap({ notionalCap }));
    },
    [dispatch]
  );
}
