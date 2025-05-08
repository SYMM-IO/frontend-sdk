import { useCallback, useMemo } from "react";
import {
  useAppSelector,
  useAppDispatch,
  AppThunkDispatch,
} from "../declaration";
import uniqWith from "lodash/uniqWith.js";

import { Quote } from "../../types/quote";
import { ApiState } from "../../types/api";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import {
  addQuote,
  addQuoteInstantCloseData,
  addQuoteToHistory,
  removeQuote,
  setHistory,
  setPendings,
  setQuoteDetail,
  setTpSlData,
  updateQuoteInstantCloseStatus,
} from "./actions";
import { useActiveAccountAddress } from "../user/hooks";
import { sortQuotesByModifyTimestamp } from "../../hooks/useQuotes";
import { useOrderHistoryApolloClient } from "../../apollo/client/orderHistory";
import { getHistory, getInstantActions } from "./thunks";
import { useAppName, useOrderHistorySubgraphAddress } from "../chains";
import {
  InstantCloseItem,
  InstantCloseObject,
  InstantCloseStatus,
  InstantOpenItem,
  InstantOpenObject,
  TpSlContent,
} from "./types";
import { useHedgerInfo } from "../hedger/hooks";

// returns all the histories
export function useHistoryQuotes(): {
  quotes: Quote[];
  state: ApiState;
  hasMoreHistory: boolean | undefined;
} {
  const { chainId } = useActiveWagmi();
  const account = useActiveAccountAddress();
  const history = useAppSelector((state) => state.quotes.history);
  const historyState = useAppSelector((state) => state.quotes.historyState);
  const hasMoreHistory = useAppSelector((state) => state.quotes.hasMoreHistory);
  return useMemo(() => {
    const histories = chainId ? history[chainId] ?? [] : [];
    return {
      quotes: uniqWith(
        histories
          .filter(
            (h: Quote) =>
              account && h.partyA.toLowerCase() === account.toLowerCase()
          )
          .sort(sortQuotesByModifyTimestamp),
        (quoteA, quoteB) => {
          return quoteA.id === quoteB.id;
        }
      ),
      state: historyState,
      hasMoreHistory,
    };
  }, [chainId, history, historyState, hasMoreHistory, account]);
}

export function usePendingsQuotes(): { quotes: Quote[]; state: ApiState } {
  const pendings = useAppSelector((state) => state.quotes.pendings);
  return { quotes: pendings, state: ApiState.OK };
}

export function usePositionsQuotes(): { quotes: Quote[]; state: ApiState } {
  const positions = useAppSelector((state) => state.quotes.positions);
  return { quotes: positions, state: ApiState.OK };
}

export function useAllQuotes(): { quotes: Quote[]; state: ApiState } {
  const positions = useAppSelector((state) => state.quotes.positions);
  const pendings = useAppSelector((state) => state.quotes.pendings);
  const { quotes: history } = useHistoryQuotes();
  const historyState = useAppSelector((state) => state.quotes.historyState);
  return useMemo(() => {
    const allQuotes = [...pendings, ...positions, ...history];
    return {
      quotes: allQuotes.sort(sortQuotesByModifyTimestamp),
      state: historyState,
    };
  }, [history, historyState, pendings, positions]);
}

export function useQuoteDetail(): Quote | null {
  const quoteDetail = useAppSelector((state) => state.quotes.quoteDetail);
  return quoteDetail;
}

export function useListenersQuotes(): number[] {
  const listeners = useAppSelector((state) => state.quotes.listeners);
  return listeners;
}

export function useInstantClosesData(): InstantCloseObject {
  const data = useAppSelector((state) => state.quotes.instantClosesStates);
  return data;
}

export function useInstantOpensData(): InstantOpenObject {
  const data = useAppSelector((state) => state.quotes.instantOpensStates);
  return data;
}

export function useQuoteInstantOpenData(
  id: number | undefined
): InstantOpenItem | null {
  const data: InstantOpenObject = useAppSelector(
    (state) => state.quotes.instantOpensStates
  );
  return id !== undefined ? data[id] ?? null : null;
}

export function useQuoteInstantCloseData(id: number): InstantCloseItem {
  const data: InstantCloseObject = useAppSelector(
    (state) => state.quotes.instantClosesStates
  );
  return data[id] ?? null;
}

export function useAddQuotesToListenerCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (id: number) => {
      dispatch(addQuote({ id }));
    },
    [dispatch]
  );
}

export function useSetQuoteDetailCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (quote: Quote | null) => {
      dispatch(setQuoteDetail({ quote }));
    },
    [dispatch]
  );
}
export function useSetHistoryCallback() {
  const dispatch = useAppDispatch();
  const { chainId } = useActiveWagmi();

  return useCallback(
    (quotes: Quote[]) => {
      if (chainId) dispatch(setHistory({ quotes, chainId }));
    },
    [dispatch, chainId]
  );
}

export function useSetPendingsCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (quotes: Quote[]) => {
      dispatch(setPendings({ quotes }));
    },
    [dispatch]
  );
}

export function useRemoveQuotesFromListenerCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (id: number) => {
      dispatch(removeQuote({ id }));
    },
    [dispatch]
  );
}

export function useAddQuoteToHistoryCallback() {
  const dispatch = useAppDispatch();
  const { chainId } = useActiveWagmi();
  return useCallback(
    (quote: Quote) => {
      if (chainId) dispatch(addQuoteToHistory({ quote, chainId }));
    },
    [dispatch, chainId]
  );
}

export function useInstantCloseDataCallback() {
  const dispatch = useAppDispatch();

  return useCallback(
    ({
      id,
      amount,
      timestamp,
      status,
    }: {
      id: number;
      amount: string;
      timestamp: number;
      status: InstantCloseStatus;
    }) => {
      dispatch(addQuoteInstantCloseData({ id, amount, timestamp, status }));
    },
    [dispatch]
  );
}

export function useUpdateInstantCloseDataCallback() {
  const dispatch = useAppDispatch();

  return useCallback(
    ({ id, status }: { id: number; status: InstantCloseStatus }) => {
      dispatch(updateQuoteInstantCloseStatus({ id, newStatus: status }));
    },
    [dispatch]
  );
}

export function useGetExistedQuoteByIdsCallback() {
  const { quotes } = useAllQuotes();

  return useCallback(
    (id: string | null) => {
      if (!id) return null;

      const existedQuote = quotes.find((quote) => quote.id.toString() === id);
      if (existedQuote) return existedQuote;
      return null;
    },
    [quotes]
  );
}

export function useGetOrderHistoryCallback() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch();
  const client = useOrderHistoryApolloClient();
  const subgraphAddress = useOrderHistorySubgraphAddress();

  return useCallback(
    (
      account: string,
      chainId: number,
      first: number,
      skip: number,
      ItemsPerPage: number
    ) => {
      if (!chainId || !account || !client) return;
      thunkDispatch(
        getHistory({ account, chainId, client, first, skip, ItemsPerPage })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thunkDispatch, subgraphAddress, client]
  );
}

export function useGetOpenInstantOrdersCallback() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch();
  const { baseUrl } = useHedgerInfo() || {};
  const account = useActiveAccountAddress();
  const appName = useAppName();

  return useCallback(() => {
    if (!account) return;
    thunkDispatch(
      getInstantActions({
        account,
        baseUrl,
        appName,
      })
    );
  }, [account, appName, baseUrl, thunkDispatch]);
}

export function useQuotesTpSlData(): { [quoteId: number]: TpSlContent } {
  const tpSlDataDetail = useAppSelector((state) => state.quotes.tpSlQuoteData);
  return tpSlDataDetail;
}

export function useSetTpSlDataCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (value: TpSlContent, quoteId: number) => {
      dispatch(setTpSlData({ value, quoteId }));
    },
    [dispatch]
  );
}
