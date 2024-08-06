import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import find from "lodash/find.js";
import unionBy from "lodash/unionBy.js";

import {
  InstantCloseItem,
  InstantCloseResponse,
  InstantCloseStatus,
  InstantOpenItem,
  InstantOpenResponse,
  QuotesState,
} from "./types";
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
import { getHistory, getInstantActions } from "./thunks";
import { getPositionTypeByIndex } from "../../hooks/useQuotes";
import { OrderType } from "../../types/trade";

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
  instantOpensStates: {},
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

    .addCase(getInstantActions.pending, (state) => {
      state.openInstantClosesState = ApiState.LOADING;
    })

    .addCase(
      getInstantActions.fulfilled,
      (state, { payload: { instantCloses, instantOpens } }) => {
        const instantClosesStates = state.instantClosesStates;
        const instantOpensStates = state.instantOpensStates;

        instantCloses.forEach((d: InstantCloseResponse) => {
          const data = instantClosesStates[d.quote_id];
          // TODO: fix bug
          if (!data || data.amount !== d.quantity_to_close) {
            instantClosesStates[d.quote_id] = {
              amount: d.quantity_to_close.toString(),
              timestamp: Math.floor(new Date().getTime() / 1000),
              status: InstantCloseStatus.FAILED,
            } as InstantCloseItem;
          }
        });

        const existingKeys = new Set(
          Object.keys(instantOpensStates).map((n) => Number(n))
        );

        instantOpens.forEach((d: InstantOpenResponse) => {
          const data = instantOpensStates[d.temp_quote_id];

          if (!data) {
            instantOpensStates[d.temp_quote_id] = {
              positionType: getPositionTypeByIndex(d.position_type),
              orderType:
                d.order_type === 1 ? OrderType.MARKET : OrderType.LIMIT,
              id: d.temp_quote_id,
              marketId: d.symbol_id,
              requestedOpenPrice: d.requested_open_price.toString(),
              quantity: d.quantity.toString(),
              partyAAddress: d.party_a_address,
              CVA: d.cva.toString(),
              LF: d.lf.toString(),
              partyAMM: d.partyAmm.toString(),
              partyBMM: d.partyBmm.toString(),

              createTimestamp: d.create_time,
              statusModifyTimestamp: d.modify_time,
              version: d.version,
            } as InstantOpenItem;
          }
          existingKeys.delete(d.temp_quote_id);
        });

        existingKeys.forEach((key) => {
          delete instantOpensStates[key];
        });
        state.instantClosesStates = instantClosesStates;
        state.instantOpensStates = instantOpensStates;
      }
    )

    .addCase(getInstantActions.rejected, (state) => {
      state.openInstantClosesState = ApiState.ERROR;
      console.error("Unable to fetch from The Hedger");
    })
);
