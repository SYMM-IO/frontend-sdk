import { useEffect, useMemo } from "react";
import { useAppDispatch } from "../declaration";
import find from "lodash/find.js";
import isEqual from "lodash/isEqual.js";
import differenceWith from "lodash/differenceWith.js";

import {
  useGetPendingIds,
  useGetPositions,
  useGetQuoteByIds,
} from "../../hooks/useQuotes";
import {
  addQuoteToHistory,
  removeQuote,
  setPendings,
  setPositions,
} from "./actions";
import {
  useAddQuotesToListenerCallback,
  useGetOrderHistoryCallback,
  useInstantClosesData,
  useListenersQuotes,
  usePendingsQuotes,
  usePositionsQuotes,
  useUpdateInstantCloseDataCallback,
} from "./hooks";
import { QuoteStatus } from "../../types/quote";
import usePrevious from "../../lib/hooks/usePrevious";
import { autoRefresh } from "../../utils/retry";
import { useActiveAccountAddress } from "../user/hooks";
import useWagmi from "../../lib/hooks/useWagmi";
import { InstantCloseStatus } from "./types";

export function QuotesUpdater(): null {
  const dispatch = useAppDispatch();
  const account = useActiveAccountAddress();
  const { chainId } = useWagmi();

  const { pendingIds } = useGetPendingIds();

  const { quotes: pendings } = useGetQuoteByIds(pendingIds);
  const { positions } = useGetPositions();
  const getHistory = useGetOrderHistoryCallback();

  useEffect(() => {
    if (account && chainId)
      return autoRefresh(() => getHistory(account, chainId, 8, 0, 7), 3000);
  }, [account, chainId, getHistory]);

  useEffect(() => {
    dispatch(setPositions({ quotes: positions ?? [] }));
  }, [positions, dispatch]);

  useEffect(() => {
    if (pendingIds.length === pendings.length)
      dispatch(setPendings({ quotes: pendings }));
  }, [pendings, pendingIds, dispatch]);

  return null;
}

/* TODO
1- remove opened position
*/
export function UpdaterListeners(): null {
  const dispatch = useAppDispatch();
  const { chainId } = useWagmi();
  const addQuoteToListenerCallback = useAddQuotesToListenerCallback();

  const { quotes: pendings } = usePendingsQuotes();
  const { quotes: positions } = usePositionsQuotes();

  const pendingIds = useMemo(() => {
    return pendings.map((q) => q.id);
  }, [pendings]);

  const prevPendingIds = usePrevious(pendingIds);
  const prevPositions = usePrevious(positions);

  const listeners = useListenersQuotes();
  const { quotes: listenersQuotes } = useGetQuoteByIds(listeners);
  const instantClosesData = useInstantClosesData();
  const updateInstantCloseData = useUpdateInstantCloseDataCallback();

  // added to find partial instant closes
  useEffect(() => {
    if (!Array.isArray(positions) || !Array.isArray(prevPositions)) {
      return;
    }
    const diff = differenceWith(positions, prevPositions, isEqual);

    if (diff.length > 0) {
      diff.forEach((d) => {
        const instantCloseData = instantClosesData[d.id];
        const prevQuote = prevPositions.find((element) => element.id === d.id);
        const newQuote = positions.find((element) => element.id === d.id);
        const partialClose =
          prevQuote?.quoteStatus === newQuote?.quoteStatus &&
          prevQuote?.closedAmount !== newQuote?.closedAmount;

        if (instantCloseData && partialClose) {
          updateInstantCloseData({
            id: d.id,
            status: InstantCloseStatus.FINISHED,
          });
        }
      });
    }
  }, [instantClosesData, positions, prevPositions, updateInstantCloseData]);

  //we don't need add quote to positions because we are getting all live through usePositionsQuotes
  useEffect(() => {
    for (let i = 0; i < listenersQuotes.length; i++) {
      const quote = listenersQuotes[i];
      if (quote.quoteStatus === QuoteStatus.OPENED) {
        dispatch(removeQuote({ id: quote.id }));
      }
      if (
        (quote.quoteStatus === QuoteStatus.CANCELED ||
          quote.quoteStatus === QuoteStatus.LIQUIDATED ||
          quote.quoteStatus === QuoteStatus.EXPIRED ||
          quote.quoteStatus === QuoteStatus.CLOSED) &&
        chainId
      ) {
        dispatch(addQuoteToHistory({ quote, chainId }));
        dispatch(removeQuote({ id: quote.id }));
      }
    }
  }, [listenersQuotes, dispatch, chainId]);

  useEffect(() => {
    if (!isEqual(prevPendingIds, pendingIds)) {
      const unpendingIds = prevPendingIds?.filter(
        (id) => !pendingIds.includes(id)
      );
      if (!unpendingIds?.length) return;
      for (let i = 0; i < unpendingIds?.length; i++) {
        addQuoteToListenerCallback(unpendingIds[i]);
      }
    }
  }, [prevPendingIds, pendingIds, addQuoteToListenerCallback]);

  useEffect(() => {
    if (!isEqual(prevPositions, positions)) {
      const unPositionsId = prevPositions
        ?.filter((id) => !find(positions, { id }))
        .map((p) => p.id);
      if (!unPositionsId?.length) return;
      for (let i = 0; i < unPositionsId?.length; i++) {
        addQuoteToListenerCallback(unPositionsId[i]);
      }
    }
  }, [prevPositions, positions, addQuoteToListenerCallback]);

  return null;
}
