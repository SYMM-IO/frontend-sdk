import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer, current } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { HedgerState } from "./types";

import {
  updateWebSocketStatus,
  updateHedgerId,
  updatePrices,
  updateDepth,
  updateDepths,
  updateNotionalCap,
  updateFundingRates,
} from "./actions";
import {
  getMarkets,
  getMarketsDepth,
  getNotionalCap,
  getOpenInterest,
  getPriceRange,
} from "./thunks";
import { ApiState, ConnectionStatus } from "../../types/api";

const initialState: HedgerState = {
  hedgerId: "",
  prices: {},
  depths: {},
  markets: [],
  fundingRates: {},
  openInterest: { total: -1, used: -1 },
  webSocketStatus: ConnectionStatus.CLOSED,
  marketsStatus: ApiState.LOADING,
  marketNotionalCap: { name: "", used: -1, totalCap: -1 },
  marketNotionalCapStatus: ApiState.LOADING,
  priceRange: { name: "", minPrice: -1, maxPrice: -1 },
  priceRangeStatus: ApiState.LOADING,
  openInterestStatus: ApiState.LOADING,
  errorMessages: {},
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateWebSocketStatus, (state, { payload }) => {
      state.webSocketStatus = payload.status;
    })
    .addCase(updateHedgerId, (state, { payload }) => {
      state.hedgerId = payload.id;
    })
    .addCase(updatePrices, (state, { payload }) => {
      //todo: can we make it better?
      state.prices = { ...current(state.prices), ...payload.prices };
    })
    .addCase(updateFundingRates, (state, { payload }) => {
      //todo: can we make it better?
      state.fundingRates = {
        ...current(state.fundingRates),
        ...payload.fundingRates,
      };
    })
    .addCase(updateDepth, (state, { payload }) => {
      state.depths[payload.name] = payload.depth;
    })
    .addCase(updateDepths, (state, { payload }) => {
      state.depths = { ...current(state.depths), ...payload.depths };
    })
    .addCase(updateNotionalCap, (state, { payload }) => {
      state.marketNotionalCap = payload.notionalCap;
    })

    .addCase(getMarketsDepth.fulfilled, (state, { payload }) => {
      state.depths = payload.depths;
    })
    .addCase(getMarketsDepth.rejected, (state) => {
      state.depths = {};
      console.error("Unable to fetch getMarketsDepth");
    })

    .addCase(getMarkets.pending, (state) => {
      state.marketsStatus = ApiState.LOADING;
    })
    .addCase(getMarkets.fulfilled, (state, { payload }) => {
      state.markets = payload.markets;
      state.errorMessages = payload.errorMessages;
      state.marketsStatus = ApiState.OK;
    })
    .addCase(getMarkets.rejected, (state) => {
      state.markets = [];
      state.marketsStatus = ApiState.ERROR;
      state.errorMessages = {};
      console.error("Unable to fetch getMarkets");
    })

    .addCase(getOpenInterest.pending, (state) => {
      state.openInterestStatus = ApiState.LOADING;
    })
    .addCase(getOpenInterest.fulfilled, (state, { payload }) => {
      state.openInterest = payload.openInterest;
      state.openInterestStatus = ApiState.OK;
    })
    .addCase(getOpenInterest.rejected, (state) => {
      state.openInterestStatus = ApiState.ERROR;
      state.openInterest = { total: -1, used: -1 };
      console.error("Unable to fetch openInterest");
    })

    .addCase(getNotionalCap.pending, (state) => {
      state.marketNotionalCapStatus = ApiState.LOADING;
    })
    .addCase(getNotionalCap.fulfilled, (state, { payload }) => {
      state.marketNotionalCap = payload.notionalCap;
      state.marketNotionalCapStatus = ApiState.OK;
    })
    .addCase(getNotionalCap.rejected, (state) => {
      state.marketNotionalCapStatus = ApiState.ERROR;
      console.error("Unable to fetch marketNotionalCap");
    })

    .addCase(getPriceRange.pending, (state) => {
      state.priceRangeStatus = ApiState.LOADING;
    })
    .addCase(getPriceRange.fulfilled, (state, { payload }) => {
      state.priceRange = payload.priceRange;
      state.priceRangeStatus = ApiState.OK;
    })
    .addCase(getPriceRange.rejected, (state) => {
      state.priceRangeStatus = ApiState.ERROR;
      console.error("Unable to fetch priceRange");
    })
);
