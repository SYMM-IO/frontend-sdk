import { ApiState, ConnectionStatus } from "../../types/api";
import { OpenInterest } from "../../types/hedger";
import { Market } from "../../types/market";

export interface MarketData {
  fundingRate: string;
  nextFundingTime: number;
  markPrice: string;
  indexPrice: string;
}
export interface MarketDepthData {
  bestAskPrice: string;
  bestAskQuantity: string;
  bestBidPrice: string;
  bestBidQuantity: string;
}

export interface FundingRateData {
  next_funding_time: number;
  next_funding_rate_long: string;
  next_funding_rate_short: string;
}

export interface PriceResponse {
  r: string;
  T: number;
  p: string;
  s: string;
  i: string;
}

// Web socket response
// export interface DepthResponse {
//   e: string
//   E: number
//   T: number
//   s: string
//   U: number
//   u: number
//   pu: number
//   b: [string, string][]
//   a: [string, string][]
// }

// api response

export interface DepthResponse {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  time: number;
}

export interface MarketDataMap {
  [symbol: string]: MarketData;
}
export interface MarketDepthMap {
  [symbol: string]: MarketDepthData;
}

export interface FundingRateMap {
  [symbol: string]: FundingRateData;
}

export interface MarketNotionalCap {
  name: string;
  used: number;
  totalCap: number;
}

export interface PriceRange {
  name: string;
  minPrice: number;
  maxPrice: number;
}

export interface MarketsInfo {
  [marketName: string]: {
    price: string;
    priceChangePercent: string;
    tradeVolume: string;
    notionalCap: string;
  };
}

export interface ErrorMessages {
  [errorCode: number]: string;
}
export interface MarketInfoValue {
  price: number;
  price_change_percent: number;
  trade_volume: number;
  notional_cap: number;
}

export type MarketsInfoRes = { [key: string]: MarketInfoValue };

export type FundingRateRes = { [key: string]: FundingRateData };

export interface HedgerState {
  hedgerId: string | number | undefined;
  prices: MarketDataMap; // load from hedger socket
  depths: MarketDepthMap;
  markets: Market[]; //load from hedger api
  fundingRates: FundingRateMap;
  openInterest: OpenInterest;
  webSocketStatus: ConnectionStatus;
  marketsStatus: ApiState;
  marketNotionalCap: MarketNotionalCap;
  marketNotionalCapStatus: ApiState;
  openInterestStatus: ApiState;
  priceRange: PriceRange;
  priceRangeStatus: ApiState;
  errorMessages: ErrorMessages;
}
