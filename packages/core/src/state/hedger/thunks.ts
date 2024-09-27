import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
const { createAsyncThunk } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { makeHttpRequest } from "../../utils/http";
import {
  Market,
  MarketApiType,
  NotionalCapResponseType,
  OpenInterestResponseType,
  PriceRangeResponseType,
} from "../../types/market";
import { OpenInterest } from "../../types/hedger";
import {
  DepthResponse,
  ErrorMessages,
  FundingRateRes,
  MarketDepthData,
  MarketDepthMap,
  MarketInfoValue,
  MarketNotionalCap,
  MarketsInfo,
  MarketsInfoRes,
  PriceRange,
} from "./types";
import { GET_PAID_AMOUNT } from "../../apollo/queries";
import { toBN } from "../../utils/numbers";

export const getMarkets = createAsyncThunk(
  "hedger/getAllApi",
  async ({
    hedgerUrl,
    options,
  }: {
    hedgerUrl: string | undefined;
    options?: { [x: string]: any };
  }) => {
    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }

    const { href: marketsUrl } = new URL(`contract-symbols`, hedgerUrl);
    const { href: errorMessagesUrl } = new URL(`error_codes`, hedgerUrl);

    let count = 0;
    let markets: Market[] = [];
    let errorMessages: ErrorMessages = {};
    const openInterest: OpenInterest = { used: 0, total: 0 };

    try {
      const [marketsRes, errorMessagesRes] = await Promise.allSettled([
        makeHttpRequest<MarketApiType>(marketsUrl, options),
        makeHttpRequest<ErrorMessages>(errorMessagesUrl, options),
      ]);

      if (marketsRes.status === "fulfilled") {
        if (marketsRes.value?.symbols) {
          markets = marketsRes.value.symbols.map((market) => ({
            id: market.symbol_id,
            name: market.name,
            symbol: market.symbol,
            asset: market.asset,
            pricePrecision: market.price_precision,
            quantityPrecision: market.quantity_precision,
            isValid: market.is_valid,
            minAcceptableQuoteValue: market.min_acceptable_quote_value,
            minAcceptablePortionLF: market.min_acceptable_portion_lf,
            tradingFee: market.trading_fee,
            maxLeverage: market.max_leverage,
            maxNotionalValue: market.max_notional_value,
            maxFundingRate: market.max_funding_rate,
            rfqAllowed: market?.rfq_allowed,
            hedgerFeeOpen: market.hedger_fee_open,
            hedgerFeeClose: market.hedger_fee_close,
            autoSlippage: toBN(60)
              .div(market.max_leverage)
              .div(100)
              .plus(1)
              .toNumber(),
          }));
          count = marketsRes.value.count;
        }

        if (
          errorMessagesRes.status === "fulfilled" &&
          errorMessagesRes?.value
        ) {
          errorMessages = errorMessagesRes.value;
        }
      }
    } catch (error) {
      console.error(error, "happened in getHedgerMarkets");
    }

    return { markets, count, openInterest, errorMessages };
  }
);

export const getOpenInterest = createAsyncThunk(
  "hedger/getOpenInterest",
  async ({
    hedgerUrl,
    options,
  }: {
    hedgerUrl: string | undefined;
    options?: { [x: string]: any };
  }) => {
    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }

    const { href: openUrl } = new URL(`open-interest`, hedgerUrl);

    const openInterest: OpenInterest = { used: 0, total: 0 };

    try {
      const [openRes] = await Promise.allSettled([
        makeHttpRequest<OpenInterestResponseType>(openUrl, options),
      ]);

      if (openRes.status === "fulfilled" && openRes.value) {
        openInterest.total = openRes.value.total_cap;
        openInterest.used = openRes.value.used;
      }
    } catch (error) {
      console.error(error, "happened in getOpenInterest");
      throw new Error("error in getOpenInterest");
    }

    return { openInterest };
  }
);

export const getNotionalCap = createAsyncThunk(
  "hedger/getNotionalCap",
  async ({
    hedgerUrl,
    market,
    appName,
    preNotional,
  }: {
    hedgerUrl: string | undefined;
    market: Market | undefined;
    appName: string;
    preNotional?: MarketNotionalCap;
  }) => {
    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }
    if (!market) {
      throw new Error("market is empty");
    }

    const notionalCapUrl = getNotionalCapUrl(market.id, hedgerUrl);

    const notionalCap: MarketNotionalCap = { name: "", totalCap: -1, used: -1 };

    // add this part to have previous value if api doesn't working
    if (
      preNotional &&
      preNotional.name === market.name &&
      preNotional.totalCap !== -1
    ) {
      notionalCap.name = preNotional.name;
      notionalCap.used = preNotional.used;
      notionalCap.totalCap = preNotional.totalCap;
    }

    try {
      const [notionalCapRes] = await Promise.allSettled([
        makeHttpRequest<NotionalCapResponseType>(
          notionalCapUrl,
          getAppNameHeader(appName)
        ),
      ]);

      if (notionalCapRes.status === "fulfilled" && notionalCapRes.value) {
        notionalCap.name = market.name;
        notionalCap.used = notionalCapRes.value.used;
        notionalCap.totalCap = notionalCapRes.value.total_cap;
      }
    } catch (error) {
      console.error(error, "happened in getNotionalCap");
      throw new Error("error in get notional cap");
    }

    return { notionalCap };
  }
);

export const getPriceRange = createAsyncThunk(
  "hedger/getPriceRange",
  async ({
    hedgerUrl,
    market,
    appName,
  }: {
    hedgerUrl: string | undefined;
    market: Market | undefined;
    appName: string;
  }) => {
    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }
    if (!market) {
      throw new Error("market is empty");
    }

    const { href: priceRangeUrl } = new URL(
      `price-range/${market.name}`,
      hedgerUrl
    );

    const priceRange: PriceRange = { name: "", minPrice: -1, maxPrice: -1 };

    try {
      const [priceRangeRes] = await Promise.allSettled([
        makeHttpRequest<PriceRangeResponseType>(
          priceRangeUrl,
          getAppNameHeader(appName)
        ),
      ]);

      if (priceRangeRes.status === "fulfilled" && priceRangeRes.value) {
        priceRange.name = market.name;
        priceRange.minPrice = priceRangeRes.value.min_price;
        priceRange.maxPrice = priceRangeRes.value.max_price;
      }
    } catch (error) {
      console.error(error, "happened in getPriceRange");
    }

    return { priceRange };
  }
);

export const getMarketsDepth = createAsyncThunk(
  "hedger/getMarketsDepth",
  async (apiUrl: string | undefined) => {
    if (!apiUrl) {
      throw new Error("Url is empty");
    }
    const depths: MarketDepthMap = {};
    const { href: marketDepthUrl } = new URL(
      `fapi/v1/ticker/bookTicker`,
      apiUrl
    );

    try {
      const [marketDepths] = await Promise.allSettled([
        makeHttpRequest<DepthResponse[]>(marketDepthUrl),
      ]);

      if (marketDepths.status === "fulfilled" && marketDepths.value) {
        marketDepths.value.forEach((depth: DepthResponse) => {
          const newDepth = {
            bestAskPrice: depth.askPrice,
            bestAskQuantity: depth.askQty,
            bestBidPrice: depth.bidPrice,
            bestBidQuantity: depth.bidQty,
          } as MarketDepthData;
          depths[depth.symbol] = newDepth;
        });
      }
    } catch (error) {
      console.error(error, "happened in getMarketsDepth");
      return { depths: {} };
    }
    return { depths };
  }
);

export const getMarketsInfo = createAsyncThunk(
  "hedger/getMarketsInfo",
  async ({
    hedgerUrl,
    appName,
  }: {
    hedgerUrl: string | undefined;
    appName: string;
  }) => {
    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }

    const { href: marketsInfoUrl } = new URL(`/get_market_info`, hedgerUrl);
    const marketsInfo: MarketsInfo = {};
    try {
      const [marketsInfoRes] = await Promise.allSettled([
        makeHttpRequest<MarketsInfoRes>(
          marketsInfoUrl,
          getAppNameHeader(appName)
        ),
      ]);
      if (marketsInfoRes.status === "fulfilled") {
        Object.entries(marketsInfoRes.value as MarketsInfoRes).forEach(
          (localMarketEntry) => {
            const [marketName, marketInfoValue]: [
              marketName: string,
              marketInfoValue: MarketInfoValue
            ] = localMarketEntry;
            marketsInfo[marketName] = {
              price: marketInfoValue.price.toString(),
              priceChangePercent:
                marketInfoValue.price_change_percent.toString(),
              tradeVolume: marketInfoValue.trade_volume.toString(),
              notionalCap: marketInfoValue.notional_cap.toString(),
            };
          }
        );
      }
    } catch (error) {
      console.error(error, "happened in getMarketsInfo");
      if (error && typeof error === "string") throw new Error(error);
      throw new Error("error3");
    }

    return { marketsInfo };
  }
);

export const getFundingRate = createAsyncThunk(
  "hedger/getFundingRate",
  async ({
    hedgerUrl,
    markets,
    appName,
  }: {
    hedgerUrl: string | undefined;
    markets: string[] | undefined;
    appName: string;
  }) => {
    console.log("in the thunks");
    if (!hedgerUrl) {
      throw new Error("hedgerUrl is empty");
    }
    if (!markets) {
      throw new Error("markets is empty");
    }

    const fundingRateUrl = new URL(`get_funding_info`, hedgerUrl);
    markets.forEach((m) => {
      fundingRateUrl.searchParams.append("symbols", m);
    });
    console.log(fundingRateUrl, fundingRateUrl.href);

    try {
      const [fundingRateRes] = await Promise.allSettled([
        makeHttpRequest<FundingRateRes>(
          fundingRateUrl.href,
          getAppNameHeader(appName)
        ),
      ]);

      if (fundingRateRes.status === "fulfilled") {
      }
    } catch (error) {
      console.error(error, "happened in getFundingRate");
    }

    return {};
  }
);

export const getPaidAmount = createAsyncThunk(
  "hedger/getPaidAmount",
  async ({
    quoteId,
    client,
  }: {
    quoteId: number;
    client: ApolloClient<NormalizedCacheObject>;
  }) => {
    if (!client) {
      throw new Error("Apollo client is not provided");
    }

    try {
      const {
        data: { resultEntities },
      } = await client.query<{
        resultEntities: { fee: string; __typename: string }[];
      }>({
        query: GET_PAID_AMOUNT,
        variables: { id: `${quoteId}` },
        fetchPolicy: "no-cache",
      });
      if (resultEntities.length) return { fee: resultEntities[0].fee };
      return { fee: "" };
    } catch (error) {
      console.error(error);
      throw new Error(`Unable to query Paid Amount from Client`);
    }
  }
);

export function getAppNameHeader(appName: string) {
  const options = {
    headers: [["App-Name", appName]],
  };
  return options;
}

export function getNotionalCapUrl(marketId: number, baseUrl: string) {
  const { href: notionalCapUrl } = new URL(`notional_cap/${marketId}`, baseUrl);
  return notionalCapUrl;
}
