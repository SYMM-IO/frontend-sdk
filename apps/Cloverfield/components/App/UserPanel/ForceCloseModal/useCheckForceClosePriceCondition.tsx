import { useEffect, useState } from "react";
import axios from "axios";

import { Quote } from "@symmio/frontend-sdk/types/quote";
import { toBN } from "@symmio/frontend-sdk/utils/numbers";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { useForceCloseGapRatio } from "@symmio/frontend-sdk/hooks/usePartyAStats";

type Kline = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string // Ignore
];

type KlineArray = Kline[];

export default function useCheckForceClosePriceCondition({
  quote,
  marketName,
  dateRange,
}: {
  quote: Quote | null;
  marketName: string | undefined;
  dateRange: [Date, Date] | null;
}) {
  const [candles, setCandles] = useState<KlineArray>([]);
  const { marketId, positionType, requestedCloseLimitPrice } = quote || {};
  const [forceCloseEnabled, setForceCloseEnabled] = useState(false);
  const { forceCloseGapRatio } = useForceCloseGapRatio(marketId);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKlineData = async () => {
      if (dateRange && marketName) {
        const klinesUrl = "https://fapi.binance.com/fapi/v1/klines";
        const t0 = dateRange[0].getTime() / 1000;
        const t1 = dateRange[1].getTime() / 1000;

        const fetchChunk = async (startTime: number, endTime: number) => {
          const params = {
            symbol: marketName,
            interval: "1m",
            limit: 500, // API limit
            startTime: startTime * 1000,
            endTime: endTime * 1000,
          };

          try {
            const { data } = await axios.get(klinesUrl, { params });
            return data;
          } catch (e) {
            console.error(e);
            throw new Error(e.message || "ERROR_IN_GET_CANDLES");
          }
        };

        const processChunks = async () => {
          const maxLimit = 500;
          const chunks: KlineArray[] = [];

          for (let start = t0; start < t1; start += maxLimit * 60) {
            const end = Math.min(start + maxLimit * 60, t1);
            try {
              const chunk = await fetchChunk(start, end);
              chunks.push(chunk);
            } catch (e) {
              setError(e.message || "ERROR_IN_GET_CANDLES");
              return;
            }
          }

          // Flatten the array of chunks
          const allCandles = chunks.flat();
          setCandles(allCandles);
        };

        processChunks();
      }
    };

    fetchKlineData();
  }, [dateRange, marketName]);

  // long  —> requested Limit Close Price <= price / slippage
  // short —> requested Limit Close Price >= price * slippage

  useEffect(() => {
    if (requestedCloseLimitPrice && positionType) {
      const isPriceConditionMet = candles.some((candle) => {
        const [, , highPrice, lowPrice] = candle;
        const closeLimitPrice = toBN(requestedCloseLimitPrice);
        const gapRatio = toBN(1).plus(forceCloseGapRatio);

        if (positionType === PositionType.LONG) {
          return closeLimitPrice.isLessThanOrEqualTo(
            toBN(highPrice).div(gapRatio)
          );
        } else {
          return closeLimitPrice.isGreaterThanOrEqualTo(
            toBN(lowPrice).times(gapRatio)
          );
        }
      });

      setForceCloseEnabled(isPriceConditionMet);
    }
  }, [candles, forceCloseGapRatio, positionType, requestedCloseLimitPrice]);

  return { forceCloseEnabled, error };
}
