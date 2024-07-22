import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import find from "lodash/find.js";
import unionBy from "lodash/unionBy.js";

import { InstantCloseResponse, InstantCloseStatus, QuotesState } from "./types";
import { Quote } from "../../types/quote";

import { ApiState } from "../../types/api";
import {
  addPending,
  addPosition,
  addQuote,
  addQuoteInstantCloseData,
  addQuoteToHistory,
  removePosition,
  removeQuote,
  setHistory,
  setPendings,
  setPositions,
  setQuoteDetail,
  setTpSlData,
  updateQuoteInstantCloseStatus,
} from "./actions";
import { getHistory, getInstantCloses } from "./thunks";

export const initialState: QuotesState = {
  history: {},
  pendings: [],
  positions: [],
  listeners: [],
  tpSlQuoteData: {},
  quoteDetail: null,
  historyState: ApiState.LOADING,
  hasMoreHistory: false,
  instantClosesStates: {},
  openInstantClosesState: ApiState.LOADING,
};

export default createReducer(initialState, (builder) =>
  builder

    .addCase(addQuote, (state, { payload: { id } }) => {
      if (state.listeners.includes(id)) {
        return;
      }
      const listeners = state.listeners;
      listeners.push(id);
      state.listeners = listeners;
    })

    .addCase(setPendings, (state, { payload: { quotes } }) => {
      state.pendings = quotes;
    })

    .addCase(addPending, (state, { payload: { quote } }) => {
      const pendings = state.pendings as unknown as Quote[];

      if (find(pendings, { id: quote.id, quoteStatus: quote.quoteStatus })) {
        return;
      }

      pendings.push(quote);
      state.pendings = pendings;
    })

    .addCase(setPositions, (state, { payload: { quotes } }) => {
      state.positions = quotes;
    })

    .addCase(addPosition, (state, { payload: { quote } }) => {
      const positions = state.positions as unknown as Quote[];

      if (find(positions, { id: quote.id })) {
        const newQuotes = positions.filter((q) => q.id !== quote.id);
        newQuotes.push(quote);
        state.positions = newQuotes;
        return;
      }

      positions.push(quote);
      state.positions = positions;
    })

    .addCase(setHistory, (state, { payload: { quotes, chainId } }) => {
      state.history[chainId] = quotes;
    })

    .addCase(removePosition, (state, { payload: { quote } }) => {
      const positions = state.positions as unknown as Quote[];
      if (!find(positions, { id: quote.id })) {
        return;
      }

      state.positions = positions.filter((q) => q.id !== quote.id);
    })
    .addCase(setTpSlData, (state, { payload: { quoteId, value } }) => {
      const prevTpsSlData = state.tpSlQuoteData;
      prevTpsSlData[quoteId] = value;
      state.tpSlQuoteData = prevTpsSlData;
    })
    .addCase(removeQuote, (state, { payload: { id } }) => {
      if (!state.listeners.includes(id)) {
        return;
      }
      const quotes = state.listeners;
      state.listeners = quotes.filter((qid) => qid !== id);
    })

    .addCase(addQuoteToHistory, (state, { payload: { quote, chainId } }) => {
      const history = (state.history[chainId] as unknown as Quote[]) ?? [];

      if (find(history, { id: quote.id })) {
        return;
      }
      history.push(quote);
      state.history[chainId] = history;
    })

    .addCase(setQuoteDetail, (state, { payload: { quote } }) => {
      state.quoteDetail = quote;
    })

    .addCase(getHistory.pending, (state) => {
      state.historyState = ApiState.LOADING;
    })

    .addCase(
      getHistory.fulfilled,
      (state, { payload: { quotes, hasMore, chainId } }) => {
        if (quotes && chainId) {
          const history = state.history[chainId];
          state.hasMoreHistory = hasMore;
          state.history[chainId] = unionBy(history, quotes, "id");
          state.historyState = ApiState.OK;
        }
      }
    )

    .addCase(getHistory.rejected, (state) => {
      state.historyState = ApiState.ERROR;
      console.error("Unable to fetch from The Graph Network");
    })

    .addCase(
      addQuoteInstantCloseData,
      (state, { payload: { id, amount, timestamp, status } }) => {
        state.instantClosesStates[id] = { amount, timestamp, status };
      }
    )
    .addCase(
      updateQuoteInstantCloseStatus,
      (state, { payload: { id, newStatus } }) => {
        const data = state.instantClosesStates[id];
        state.instantClosesStates[id] = { ...data, status: newStatus };
      }
    )

    .addCase(getInstantCloses.pending, (state) => {
      state.openInstantClosesState = ApiState.LOADING;
    })

    .addCase(
      getInstantCloses.fulfilled,
      (state, { payload: { openInstantCloses } }) => {
        const instantClosesStates = state.instantClosesStates;

        openInstantCloses.forEach((d: InstantCloseResponse) => {
          const data = instantClosesStates[d.quote_id];

          if (!data || data.amount !== d.quantity_to_close) {
            instantClosesStates[d.quote_id] = {
              amount: d.quantity_to_close,
              timestamp: Math.floor(new Date().getTime() / 1000),
              status: InstantCloseStatus.FAILED,
            };
          }
        });

        state.instantClosesStates = instantClosesStates;
      }
    )

    .addCase(getInstantCloses.rejected, (state) => {
      state.openInstantClosesState = ApiState.ERROR;
      console.error("Unable to fetch from The Hedger");
    })
);
