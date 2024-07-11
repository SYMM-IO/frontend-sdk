import { useCallback, useMemo } from "react";
import find from "lodash/find.js";

import { Quote } from "../types/quote";
import { BN_ZERO, toBN } from "../utils/numbers";
import { IQuotesInfo } from "../types/quotesOverview";
import { PositionType } from "../types/trade";
import { useMarkets, usePrices } from "../state/hedger/hooks";

export function usePositionValue(quotes: Quote[]): IQuotesInfo {
  const markets = useMarkets();
  const prices = usePrices();

  const getCurrentPrice = useCallback(
    (marketName: string | undefined) => {
      const marketData = marketName ? prices[marketName] : null;
      return marketData?.markPrice;
    },
    [prices]
  );

  return useMemo(() => {
    const checkedMarkets: {
      [PositionType.LONG]: number[];
      [PositionType.SHORT]: number[];
    } = {
      [PositionType.LONG]: [],
      [PositionType.SHORT]: [],
    };
    const quoteByMarketValues: IQuotesInfo = [];

    quotes.forEach((quote) => {
      if (checkedMarkets[quote.positionType].includes(quote.marketId)) return;
      checkedMarkets[quote.positionType].push(quote.marketId);

      const { name, symbol, asset } =
        find(markets, { id: quote.marketId }) || {};
      const markPrice = getCurrentPrice(name);
      const sameMarketQuotes = quotes.filter((marketQuote) => {
        return (
          marketQuote.marketId === quote.marketId &&
          marketQuote.positionType === quote.positionType
        );
      });
      const totalPositionValue = calculateTotalPositionsValue(
        sameMarketQuotes,
        markPrice
      );

      quoteByMarketValues.push({
        marketId: quote.marketId,
        marketName: `${symbol}-${asset}`,
        value: totalPositionValue,
        positionQuantity: sameMarketQuotes.length,
        positionType: quote.positionType,
      });
    });
    return quoteByMarketValues;
  }, [getCurrentPrice, markets, quotes]);
}

export function useTotalNotionalValue(quotesInfo: IQuotesInfo): number {
  return useMemo(
    () =>
      quotesInfo
        .map((quoteInfo) => quoteInfo.value)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0),
    [quotesInfo]
  );
}

function calculateUpnl(quote: Quote, currentPrice: string): string {
  const { quantity, closedAmount, openedPrice, positionType } = quote;
  return (
    toBN(quantity)
      .minus(closedAmount)
      .times(toBN(currentPrice).minus(openedPrice))
      .times(positionType === PositionType.SHORT ? -1 : 1)
      .toString() || BN_ZERO.toString()
  );
}

function calculateTotalPositionsValue(
  quotes: Quote[],
  currentPrice: string | undefined
): number {
  let totalPositionValue = 0;
  quotes.forEach((currentQuote) => {
    const lockedMargin = toBN(currentQuote.CVA)
      .plus(currentQuote.partyAMM)
      .plus(currentQuote.LF)
      .toString();
    const upnl = calculateUpnl(currentQuote, currentPrice ?? "0");
    totalPositionValue += Number(lockedMargin) + Number(upnl);
  });
  return totalPositionValue;
}
