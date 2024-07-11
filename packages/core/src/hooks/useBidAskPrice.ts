import { useMarketDepth } from "../state/hedger/hooks";
import { Market } from "../types/market";
import { RoundMode, formatPrice, toBN } from "../utils/numbers";

export default function useBidAskPrice(market?: Market): {
  ask: string;
  bid: string;
  spread: string;
} {
  const marketDepth = useMarketDepth(market?.name);

  if (!marketDepth || !market) return { ask: "0", bid: "0", spread: "0" };

  const { hedgerFeeClose, hedgerFeeOpen, pricePrecision } = market;

  const { bestAskPrice, bestBidPrice } = marketDepth;
  const bestAsk: string = formatPrice(
    toBN(bestAskPrice).times(toBN(1).plus(hedgerFeeOpen)),
    pricePrecision,
    false,
    RoundMode.ROUND_UP
  );
  const bestBid: string = formatPrice(
    toBN(bestBidPrice).times(toBN(1).minus(hedgerFeeClose)),
    pricePrecision,
    false,
    RoundMode.ROUND_DOWN
  );

  const diff = toBN(bestBid).minus(bestAsk).abs();
  const mean = toBN(bestBid).plus(bestAsk).div(2);
  const spread = diff.div(mean).times(10000).toFixed(4, RoundMode.ROUND_UP);

  return { ask: bestAsk, bid: bestBid, spread };
}
