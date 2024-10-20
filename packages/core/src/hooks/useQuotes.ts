import { useEffect, useMemo, useRef } from "react";

import { useSingleContractMultipleMethods } from "../lib/hooks/multicall";
import { OrderType, PositionType } from "../types/trade";
import { Quote, QuoteStatus } from "../types/quote";
import { BN_ZERO, fromWei, toBN } from "../utils/numbers";

import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "../state/user/hooks";
import {
  LastSeenAction,
  NotificationDetails,
  NotificationType,
} from "../state/notifications/types";
import {
  usePartialFillNotifications,
  useVisibleNotifications,
} from "../state/notifications/hooks";

import { useDiamondAddress } from "../state/chains";
import { useMarket } from "./useMarkets";
import { useSupportedChainId } from "../lib/hooks/useSupportedChainId";
import useBidAskPrice from "./useBidAskPrice";
import { Market } from "../types/market";
import {
  useQuoteInstantCloseData,
  useUpdateInstantCloseDataCallback,
} from "../state/quotes/hooks";
import { InstantCloseStatus } from "../state/quotes/types";
import useActiveWagmi from "../lib/hooks/useActiveWagmi";
import { DIAMOND_ABI } from "../constants";

export function getPositionTypeByIndex(x: number): PositionType {
  return PositionType[
    Object.keys(PositionType).find(
      (key, index) => index === x
    ) as keyof typeof PositionType
  ];
}

export function getQuoteStateByIndex(x: number): QuoteStatus {
  return QuoteStatus[
    Object.keys(QuoteStatus).find(
      (key, index) => index === x
    ) as keyof typeof QuoteStatus
  ];
}

export function sortQuotesByModifyTimestamp(a: Quote, b: Quote) {
  return Number(b.statusModifyTimestamp) - Number(a.statusModifyTimestamp);
}

export function useGetPositions(): {
  positions: Quote[] | undefined;
  loading: boolean;
} {
  const { chainId } = useActiveWagmi();
  const isSupportedChainId = useSupportedChainId();
  const activeAccountAddress = useActiveAccountAddress();

  const { positionsCount } = useAccountPartyAStat(activeAccountAddress);

  const DIAMOND_ADDRESS = useDiamondAddress();

  const [start, size] = [0, positionsCount + 1];
  const calls = useMemo(
    () =>
      isSupportedChainId
        ? activeAccountAddress
          ? [
              {
                functionName: "getPartyAOpenPositions",
                callInputs: [activeAccountAddress, start, size],
              },
            ]
          : []
        : [],
    [isSupportedChainId, activeAccountAddress, start, size]
  );

  const {
    data: quoteResults,
    isLoading: isQuoteLoading,
    isSuccess: isQuoteSuccess,
  } = useSingleContractMultipleMethods(
    chainId ? DIAMOND_ADDRESS[chainId] : "",
    DIAMOND_ABI,
    calls,
    {
      refetchInterval: 2000,
    }
  );

  const quotesValue = useMemo(
    () =>
      isQuoteSuccess &&
      quoteResults?.[0]?.status === "success" &&
      Array.isArray(quoteResults[0].result)
        ? quoteResults[0].result
        : [],
    [isQuoteSuccess, quoteResults]
  );

  const quotes: Quote[] = useMemo(() => {
    return (
      quotesValue
        ?.filter((quote) => quote[0]?.toString() !== "0") //remove garbage outputs
        .map((quote) => toQuote(quote))
        .sort(sortQuotesByModifyTimestamp) || []
    );
  }, [quotesValue]);

  return useMemo(
    () => ({
      positions: quotes.length > 0 ? quotes : undefined,
      loading: isQuoteLoading,
    }),
    [isQuoteLoading, quotes]
  );
}

export function useGetQuoteByIds(ids: number[]): {
  quotes: Quote[];
  loading: boolean;
} {
  const { chainId } = useActiveWagmi();
  const isSupportedChainId = useSupportedChainId();

  const DIAMOND_ADDRESS = useDiamondAddress();

  const calls = useMemo(
    () =>
      isSupportedChainId
        ? ids.map((id) => ({ functionName: "getQuote", callInputs: [id] }))
        : [],
    [ids, isSupportedChainId]
  );

  const {
    data: quoteResults,
    isLoading,
    isSuccess,
  } = useSingleContractMultipleMethods(
    chainId ? DIAMOND_ADDRESS[chainId] : "",
    DIAMOND_ABI,
    calls,
    {
      refetchInterval: 2000,
    }
  );

  const quotesValue = useMemo(
    () =>
      isSuccess &&
      quoteResults !== undefined &&
      quoteResults?.[0]?.status === "success"
        ? quoteResults?.map((qs) =>
            qs.result
              ? qs.result["id"]
                ? qs.result
                : qs.result[0]
                ? qs.result[0]
                : null
              : null
          )
        : [],
    [isSuccess, quoteResults]
  );

  const quotes: Quote[] = useMemo(() => {
    return quotesValue
      .filter((quote) => quote)
      .map((quote) => toQuote(quote))
      .sort(sortQuotesByModifyTimestamp);
  }, [quotesValue]);

  return useMemo(
    () => ({
      quotes,
      loading: isLoading,
    }),
    [isLoading, quotes]
  );
}

export function useGetPendingIds(): {
  pendingIds: number[];
  loading: boolean;
} {
  const { chainId } = useActiveWagmi();
  const isSupportedChainId = useSupportedChainId();
  const activeAccountAddress = useActiveAccountAddress();

  const DIAMOND_ADDRESS = useDiamondAddress();

  const calls = useMemo(
    () =>
      isSupportedChainId
        ? activeAccountAddress
          ? [
              {
                functionName: "getPartyAPendingQuotes",
                callInputs: [activeAccountAddress],
              },
            ]
          : []
        : [],
    [activeAccountAddress, isSupportedChainId]
  );

  const {
    data: quoteResults,
    isLoading,
    isSuccess,
  } = useSingleContractMultipleMethods(
    chainId ? DIAMOND_ADDRESS[chainId] : "",
    DIAMOND_ABI,
    calls,
    {
      refetchInterval: 2000,
    }
  );

  const quoteIdsValue = useMemo(
    () =>
      isSuccess &&
      quoteResults?.[0]?.status === "success" &&
      Array.isArray(quoteResults[0].result)
        ? quoteResults[0].result
        : [],
    [isSuccess, quoteResults]
  );

  const quoteIds: number[] = useMemo(() => {
    return quoteIdsValue
      .map((quoteId) => toBN(quoteId.toString()).toNumber())
      .sort((a: number, b: number) => b - a);
  }, [quoteIdsValue]);

  return useMemo(
    () => ({
      pendingIds: quoteIds,
      loading: isLoading,
    }),
    [isLoading, quoteIds]
  );
}

export function useQuoteUpnlAndPnl(
  quote: Quote,
  currentPrice: string | number,
  quantityToClose?: string | number,
  closedPrice?: string | number
): string[] {
  const {
    openedPrice,
    positionType,
    avgClosedPrice,
    closedAmount,
    quoteStatus,
    quantity,
    liquidateAmount,
    liquidatePrice,
  } = quote;

  const pnl =
    toBN(closedPrice ?? avgClosedPrice)
      .minus(openedPrice)
      .times(quantityToClose ?? closedAmount)
      .times(positionType === PositionType.SHORT ? -1 : 1)
      .toString() || BN_ZERO.toString();

  const upnl =
    toBN(quantity)
      .minus(closedAmount)
      .times(toBN(currentPrice).minus(openedPrice))
      .times(positionType === PositionType.SHORT ? -1 : 1)
      .toString() || BN_ZERO.toString();

  if (
    quoteStatus === QuoteStatus.CLOSE_PENDING ||
    quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING ||
    quoteStatus === QuoteStatus.OPENED
  ) {
    return [upnl, pnl];
  } else if (quoteStatus === QuoteStatus.CLOSED) {
    return [BN_ZERO.toString(), pnl];
  } else if (quoteStatus === QuoteStatus.LIQUIDATED) {
    if (quantityToClose) return [BN_ZERO.toString(), pnl];

    const averagePrice = toBN(liquidatePrice)
      .times(liquidateAmount)
      .plus(toBN(avgClosedPrice).times(closedAmount))
      .div(quantity);
    return [
      BN_ZERO.toString(),
      toBN(averagePrice)
        .minus(openedPrice)
        .times(quantity)
        .times(positionType === PositionType.SHORT ? -1 : 1)
        .toString() || BN_ZERO.toString(),
    ];
  } else {
    return [BN_ZERO.toString(), BN_ZERO.toString()];
  }
}

export function useQuoteSize(quote: Quote): string {
  const { quoteStatus, quantity, closedAmount, marketId } = quote;
  const { quantityPrecision } = useMarket(marketId) || {};
  return useMemo(() => {
    if (
      quoteStatus === QuoteStatus.CLOSED ||
      quoteStatus === QuoteStatus.LIQUIDATED ||
      quoteStatus === QuoteStatus.CANCELED
    )
      return quantity;
    return toBN(quantity)
      .minus(closedAmount)
      .toFixed(quantityPrecision || 6);
  }, [closedAmount, quantity, quantityPrecision, quoteStatus]);
}

export function useQuoteLeverage(quote: Quote): string {
  const {
    quantity,
    requestedOpenPrice,
    quoteStatus,
    openedPrice,
    initialCVA,
    initialLF,
    initialPartyAMM,
  } = quote;

  const quoteSize = useQuoteSize(quote);
  const lockedMargin = useLockedMargin(quote);
  const initialLockedMargin = toBN(initialCVA)
    .plus(initialPartyAMM)
    .plus(initialLF)
    .toString();

  switch (quoteStatus) {
    case QuoteStatus.OPENED:
    case QuoteStatus.CLOSE_PENDING:
    case QuoteStatus.CANCEL_CLOSE_PENDING:
      return toBN(quoteSize).times(openedPrice).div(lockedMargin).toFixed(0);

    case QuoteStatus.PENDING:
    case QuoteStatus.LOCKED:
    case QuoteStatus.CANCEL_PENDING:
    case QuoteStatus.CANCELED:
    case QuoteStatus.EXPIRED:
      return toBN(quantity)
        .times(requestedOpenPrice)
        .div(initialLockedMargin)
        .toFixed(0);

    case QuoteStatus.CLOSED:
    case QuoteStatus.LIQUIDATED:
      return toBN(quantity)
        .times(requestedOpenPrice)
        .div(initialLockedMargin)
        .toFixed(0);
  }
}

export function useQuoteFillAmount(quote: Quote): string | null {
  const { quoteStatus, orderType, id, statusModifyTimestamp } = quote;
  const partiallyFillNotifications: NotificationDetails[] =
    usePartialFillNotifications();
  let foundNotification: NotificationDetails | undefined | null;
  try {
    foundNotification = partiallyFillNotifications.find(
      (notification) =>
        notification.quoteId === id.toString() &&
        notification.notificationType === NotificationType.PARTIAL_FILL &&
        toBN(statusModifyTimestamp).lt(notification.modifyTime)
    );
  } catch (error) {
    foundNotification = null;
  }

  return useMemo(() => {
    if (
      quoteStatus === QuoteStatus.CLOSE_PENDING ||
      quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING
    ) {
      return orderType === OrderType.LIMIT &&
        foundNotification &&
        foundNotification.filledAmountClose
        ? toBN(foundNotification.filledAmountClose).toString()
        : null;
    } else if (
      quoteStatus === QuoteStatus.LOCKED ||
      quoteStatus === QuoteStatus.PENDING
    ) {
      return orderType === OrderType.LIMIT &&
        foundNotification &&
        foundNotification.filledAmountOpen
        ? toBN(foundNotification.filledAmountOpen).toString()
        : null;
    } else {
      return null;
    }
  }, [foundNotification, orderType, quoteStatus]);
}

export function useInstantCloseNotifications(quote: Quote) {
  const { id } = quote;
  const updateInstantCloseData = useUpdateInstantCloseDataCallback();
  const instantCloseData = useQuoteInstantCloseData(quote.id) ?? {};

  const notifications = useVisibleNotifications();
  const foundNotification = useRef<NotificationDetails | undefined>();

  useEffect(() => {
    notifications.forEach((notification) => {
      if (
        notification.quoteId === id.toString() &&
        ((notification.notificationType === NotificationType.SUCCESS &&
          notification.lastSeenAction ===
            LastSeenAction.FILL_ORDER_INSTANT_CLOSE) ||
          (notification.notificationType === NotificationType.HEDGER_ERROR &&
            (notification.lastSeenAction ===
              LastSeenAction.INSTANT_REQUEST_TO_CLOSE_POSITION ||
              notification.lastSeenAction ===
                LastSeenAction.FILL_ORDER_INSTANT_CLOSE))) &&
        toBN(instantCloseData.timestamp).lt(notification.modifyTime)
      ) {
        if (foundNotification.current !== notification) {
          foundNotification.current = notification;
          if (notification.notificationType === NotificationType.SUCCESS) {
            updateInstantCloseData({
              id,
              status: InstantCloseStatus.PROCESSING,
            });
          } else if (
            notification.notificationType === NotificationType.HEDGER_ERROR
          ) {
            updateInstantCloseData({ id, status: InstantCloseStatus.FAILED });
          }
        }
      }
    });
  }, [notifications, id, updateInstantCloseData, instantCloseData.timestamp]);

  // Add more dependencies if needed
}

export function useClosingLastMarketPrice(
  quote: Quote | null,
  market?: Market
): string {
  // market price for closing position

  const { bid, ask } = useBidAskPrice(market);

  if (quote) {
    if (quote.positionType === PositionType.LONG) {
      return bid;
    } else {
      return ask;
    }
  }

  return "0";
}

export function useOpeningLastMarketPrice(
  quote: Quote | null,
  market?: Market
): string {
  // market price for opening position
  const { bid, ask } = useBidAskPrice(market);

  if (quote)
    if (quote.positionType === PositionType.LONG) {
      return ask;
    } else {
      return bid;
    }

  return "0";
}

function toQuote(quote: any) {
  return {
    id: Number(quote["id"].toString()),
    partyBsWhiteList: quote["partyBsWhiteList"],
    marketId: Number(quote["symbolId"].toString()),
    positionType: getPositionTypeByIndex(
      Number(quote["positionType"].toString())
    ),
    orderType:
      Number(quote["orderType"].toString()) === 1
        ? OrderType.MARKET
        : OrderType.LIMIT,

    // Price of quote which PartyB opened in 18 decimals
    openedPrice: fromWei(quote["openedPrice"].toString()),

    // Price of quote which PartyA requested in 18 decimals
    initialOpenedPrice: fromWei(quote["initialOpenedPrice"].toString()),
    requestedOpenPrice: fromWei(quote["requestedOpenPrice"].toString()),
    marketPrice: fromWei(quote["marketPrice"].toString()),

    // Quantity of quote which PartyA requested in 18 decimals
    quantity: fromWei(quote["quantity"].toString()),
    closedAmount: fromWei(quote["closedAmount"].toString()),

    initialCVA: fromWei(quote["initialLockedValues"]["cva"].toString()),
    initialLF: fromWei(quote["initialLockedValues"]["lf"].toString()),
    initialPartyAMM: fromWei(
      quote["initialLockedValues"]["partyAmm"].toString()
    ),
    initialPartyBMM: fromWei(
      quote["initialLockedValues"]["partyBmm"].toString()
    ),

    CVA: fromWei(quote["lockedValues"]["cva"].toString()),
    LF: fromWei(quote["lockedValues"]["lf"].toString()),
    partyAMM: fromWei(quote["lockedValues"]["partyAmm"].toString()),
    partyBMM: fromWei(quote["lockedValues"]["partyBmm"].toString()),

    maxFundingRate: fromWei(quote["maxFundingRate"].toString()),
    partyA: quote["partyA"].toString(),
    partyB: quote["partyB"].toString(),
    quoteStatus: getQuoteStateByIndex(Number(quote["quoteStatus"].toString())),
    avgClosedPrice: fromWei(quote["avgClosedPrice"].toString()),
    requestedCloseLimitPrice: fromWei(quote["requestedClosePrice"].toString()),
    quantityToClose: fromWei(quote["quantityToClose"].toString()),

    // handle partially open position
    parentId: quote["parentId"].toString(),
    createTimestamp: Number(quote["createTimestamp"].toString()),
    statusModifyTimestamp: Number(quote["statusModifyTimestamp"].toString()),
    lastFundingPaymentTimestamp: Number(
      quote["lastFundingPaymentTimestamp"].toString()
    ),
    deadline: Number(quote["deadline"].toString()),
    tradingFee: Number(quote["tradingFee"].toString()),
  } as Quote;
}

export function useLockedMargin(quote: Quote): string {
  return toBN(quote.CVA).plus(quote.partyAMM).plus(quote.LF).toString();
}
