import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../declaration";
import { InputField, OrderType, PositionType } from "../../types/trade";
import { BN_ZERO, formatPrice } from "../../utils/numbers";
import { Market } from "../../types/market";
import { useHedgerInfo, useMarketData } from "../hedger/hooks";
import {
  updateOrderType,
  updateLimitPrice,
  updateMarketId,
  updateInputField,
  updateTypedValue,
  updatePositionType,
  updateLockedPercentages,
  updateTpSl,
  updateTpError,
  updateSlError,
  updateTpSlState,
  updateDelegateTpSl,
  setTpSlOpened,
  setTpSlConfig,
} from "./actions";
import { useMarket } from "../../hooks/useMarkets";
import { makeHttpRequest } from "../../utils/http";
import { GetLockedParamUrlResponse } from "./types";
import { TpSlUpdateProcessState, TpSlState, TpSlConfigParams } from "./types";

export function useActiveMarketId(): number | undefined {
  const marketId = useAppSelector((state) => state.trade.marketId);
  return marketId;
}

export function useActiveMarket(): Market | undefined {
  const marketId = useActiveMarketId();
  return useMarket(marketId);
}

export function useActiveMarketPrice(): string {
  const market = useActiveMarket();
  const marketData = useMarketData(market?.name);
  return useMemo(
    () =>
      !marketData
        ? BN_ZERO.toString()
        : formatPrice(marketData.markPrice, market?.pricePrecision),
    [market?.pricePrecision, marketData]
  );
}

export function usePositionType() {
  const positionType = useAppSelector((state) => state.trade.positionType);
  return positionType;
}

export function useOrderType() {
  const orderType = useAppSelector((state) => state.trade.orderType);
  return orderType;
}
export function useTypedValue() {
  const typedValue = useAppSelector((state) => state.trade.typedValue);
  return typedValue;
}
export function useInputField() {
  const inputField = useAppSelector((state) => state.trade.inputField);
  return inputField;
}

export function useLimitPrice(): string {
  const limitPrice = useAppSelector((state) => state.trade.limitPrice);
  return limitPrice;
}
export function useTradeTpSl(): TpSlState {
  const tpSlValue = useAppSelector((state) => state.trade.tpSl);
  return tpSlValue;
}
export function useTradeTpSlError() {
  const tpSlErrorValue = useAppSelector((state) => state.trade.tpSlError);
  return tpSlErrorValue;
}
export function useTpSlDelegate(): boolean {
  const delegateStatus = useAppSelector(
    (state) => state.trade.tpSlDelegateChecker
  );
  return delegateStatus;
}

export function useTpSlOpened(): boolean {
  const tpSlOpenedStatus = useAppSelector((state) => state.trade.tpSlOpened);
  return tpSlOpenedStatus;
}
export function useTpSlConfigParams(): TpSlConfigParams {
  const tpSlConfig = useAppSelector((state) => state.trade.tpSlConfig);
  return tpSlConfig;
}
export function useSetTpSlConfig(): (tpSlValue: TpSlConfigParams) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (tpSlValue: TpSlConfigParams) => {
      dispatch(setTpSlConfig(tpSlValue));
    },
    [dispatch]
  );
}

export function useSetTpSl(): (tpSlValue: TpSlState) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (tpSlValue: TpSlState) => {
      dispatch(updateTpSl(tpSlValue));
    },
    [dispatch]
  );
}
export function useSetTpSlState(): (
  tpSlStateValue: TpSlUpdateProcessState
) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (tpSlStateValue: TpSlUpdateProcessState) => {
      dispatch(updateTpSlState(tpSlStateValue));
    },
    [dispatch]
  );
}
export function useSetDelegateTpSl() {
  const dispatch = useAppDispatch();
  return useCallback(
    (delegateStatus: boolean) => {
      dispatch(updateDelegateTpSl(delegateStatus));
    },
    [dispatch]
  );
}

export function useSetTpSlOpened() {
  const dispatch = useAppDispatch();
  return useCallback(
    (tpSlOpened: boolean) => {
      dispatch(setTpSlOpened(tpSlOpened));
    },
    [dispatch]
  );
}
export function useSetTpError(): (tpValue: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (tpValue: string) => {
      dispatch(updateTpError(tpValue));
    },
    [dispatch]
  );
}
export function useSetSlError(): (slValue: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (slValue: string) => {
      dispatch(updateSlError(slValue));
    },
    [dispatch]
  );
}

export function useLockedPercentages(): {
  cva: string | undefined;
  partyAmm: string | undefined;
  partyBmm: string | undefined;
  lf: string | undefined;
} {
  const cva = useAppSelector((state) => state.trade.cva);
  const partyAmm = useAppSelector((state) => state.trade.partyAmm);
  const partyBmm = useAppSelector((state) => state.trade.partyBmm);
  const lf = useAppSelector((state) => state.trade.lf);
  return useMemo(
    () => ({
      cva,
      partyAmm,
      partyBmm,
      lf,
    }),
    [cva, lf, partyAmm, partyBmm]
  );
}

export function useSetOrderType(): (orderType: OrderType) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (orderType: OrderType) => {
      dispatch(updateOrderType(orderType));
    },
    [dispatch]
  );
}
export function useSetInputField(): (inputField: InputField) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (inputField: InputField) => {
      dispatch(updateInputField(inputField));
    },
    [dispatch]
  );
}

export function useSetPositionType() {
  const dispatch = useAppDispatch();
  return useCallback(
    (type: PositionType) => {
      dispatch(updatePositionType(type));
    },
    [dispatch]
  );
}

export function useSetLimitPrice() {
  const dispatch = useAppDispatch();
  return useCallback(
    (price: string) => {
      dispatch(updateLimitPrice(price));
    },
    [dispatch]
  );
}

export function useSetTypedValue() {
  const dispatch = useAppDispatch();
  return useCallback(
    (value: string, inputField: InputField) => {
      dispatch(updateInputField(inputField));
      dispatch(updateTypedValue(value));
    },
    [dispatch]
  );
}

export function useSetMarketId(): (id: number) => void {
  const dispatch = useAppDispatch();
  const marketId = useAppSelector((state) => state.trade.marketId);

  return useCallback(
    (id: number) => {
      if (marketId !== id) {
        dispatch(updateMarketId({ id }));
      }
    },
    [dispatch, marketId]
  );
}

export function useGetLockedPercentages(
  leverage: number
): (options: {
  signal: AbortSignal;
  headers: [string, string][];
}) => Promise<undefined> {
  const market = useActiveMarket();
  const dispatch = useAppDispatch();
  const { baseUrl } = useHedgerInfo() || {};

  return useCallback(
    async (options: { signal: AbortSignal; headers: [string, string][] }) => {
      try {
        if (!baseUrl || !market) throw new Error("missing parameters");
        const { href: url } = new URL(
          `get_locked_params/${market.name}?leverage=${leverage}`,
          baseUrl
        );

        const response = await makeHttpRequest<GetLockedParamUrlResponse>(
          url,
          options
        );

        if (response) dispatch(updateLockedPercentages({ ...response }));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("AbortError getLockedParam", error.message);
        } else {
          console.log("Unable to fetch locked params");
        }
      }
    },
    [baseUrl, dispatch, leverage, market]
  );
}
