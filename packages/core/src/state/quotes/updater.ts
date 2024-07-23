import { useEffect, useMemo, useRef } from "react";
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
  useQuotesTpSlData,
  useSetTpSlDataCallback,
  useUpdateInstantCloseDataCallback,
} from "./hooks";
import { QuoteStatus } from "../../types/quote";
import usePrevious from "../../lib/hooks/usePrevious";
import { autoRefresh } from "../../utils/retry";
import { useActiveAccountAddress } from "../user/hooks";
import useWagmi from "../../lib/hooks/useWagmi";
import { InstantCloseStatus, TpSlDataState, TpSlDataStateParam } from "./types";
import { useSetTpSl, useTradeTpSl } from "../trade/hooks";
import { TpSlProcessState } from "../trade/types";
import { TIME_TO_WAIT_POSITION_RECEIVE } from "../../constants";
import { makeHttpRequestV2 } from "../../utils/http";
import { useAppName } from "../chains";
import { useHedgerInfo } from "../hedger/hooks";

export function QuotesUpdater(): null {
  const dispatch = useAppDispatch();
  const account = useActiveAccountAddress();
  const { chainId } = useWagmi();

  const { pendingIds } = useGetPendingIds();

  const { quotes: pendings } = useGetQuoteByIds(pendingIds);
  const { positions } = useGetPositions();
  const getHistory = useGetOrderHistoryCallback();
  const prevPendings = usePendingsQuotes();
  const prevPositions = usePositionsQuotes();

  const setTradeTpSl = useSetTpSl();
  const tpSlContent = useTradeTpSl();
  const tpSlQuoteData = useQuotesTpSlData();
  const setTpSlFunc = useSetTpSlDataCallback();

  useEffect(() => {
    if (account && chainId)
      return autoRefresh(() => getHistory(account, chainId, 8, 0, 7), 3000);
  }, [account, chainId, getHistory]);

  useEffect(() => {
    if (!isEqual(prevPositions.quotes, positions ?? [])) {
      dispatch(setPositions({ quotes: positions ?? [] }));
      if (positions === undefined) return;
      for (const position_i of positions) {
        const tpSl_i = tpSlQuoteData[position_i.id];
        if (!tpSl_i) {
          setTpSlFunc(
            {
              tp: "",
              sl: "",
              tpOpenPrice: "",
              slOpenPrice: "",
              tpSlState: TpSlDataState.LOADING,
              quoteId: position_i.id,
            },
            position_i.id
          );
        }
      }
      const recentPositionsFlag = positions.filter((positionQuote) => {
        const intervalTime =
          positionQuote.statusModifyTimestamp - tpSlContent.lastTimeUpdated;
        return intervalTime > 0 && intervalTime < TIME_TO_WAIT_POSITION_RECEIVE;
      });
      if (
        tpSlContent.state === TpSlProcessState.WAIT_FOR_QUOTE_RECEIVE &&
        recentPositionsFlag.length > 0
      ) {
        const targetQuote = positions[positions.length - 1];

        setTradeTpSl({
          ...tpSlContent,
          quoteId: targetQuote.id,
          state: TpSlProcessState.WAIT_FOR_SEND_TP_SL_REQUEST,
        });
      }
    }
  }, [
    positions,
    dispatch,
    prevPositions.quotes,
    tpSlContent,
    tpSlQuoteData,
    setTpSlFunc,
    setTradeTpSl,
  ]);

  useEffect(() => {
    if (
      pendingIds.length === pendings.length &&
      !isEqual(pendings, prevPendings.quotes)
    ) {
      for (const position_i of pendings) {
        const tpSl_i = tpSlQuoteData[position_i.id];
        if (!tpSl_i) {
          setTpSlFunc(
            {
              tp: "",
              sl: "",
              tpOpenPrice: "",
              slOpenPrice: "",
              tpSlState: TpSlDataState.LOADING,
              quoteId: position_i.id,
            },
            position_i.id
          );
        }
      }
      const recentPendingFlag = pendings.filter((pendingQuote) => {
        const intervalTime =
          pendingQuote.statusModifyTimestamp - tpSlContent.lastTimeUpdated;
        return intervalTime > 0 && intervalTime < TIME_TO_WAIT_POSITION_RECEIVE;
      });

      if (
        tpSlContent.state === TpSlProcessState.WAIT_FOR_QUOTE_RECEIVE &&
        recentPendingFlag.length > 0
      ) {
        const targetQuote = pendings[pendings.length - 1];

        setTradeTpSl({
          ...tpSlContent,
          quoteId: targetQuote.id,
          state: TpSlProcessState.WAIT_FOR_SEND_TP_SL_REQUEST,
        });
      }
      dispatch(setPendings({ quotes: pendings }));
    }
  }, [
    pendings,
    pendingIds,
    dispatch,
    prevPendings.quotes,
    tpSlContent,
    tpSlQuoteData,
    setTpSlFunc,
    setTradeTpSl,
  ]);

  return null;
}

async function getTpSlRequest(
  quoteId: number,
  AppName: string,
  tpslBaseUrl: string
) {
  const { href: tpSlUrl } = new URL(
    `conditional-order/${quoteId}/`,
    tpslBaseUrl
  );
  const options = {
    headers: [
      ["App-Name", AppName],
      ["Content-Type", "application/json"],
      ["accept", "application/json"],
      ["Cache-Control", "no-cache"],
    ],
  };
  try {
    const { result, status }: { result: any; status: number } =
      await makeHttpRequestV2(tpSlUrl, options);
    if (status !== 200 && result?.error_message) {
      return null;
    }
    return result;
  } catch (e) {
    console.log("error", e);
    return null;
  }
}

export function TpSlUpdater(): null {
  const tpSlQuoteData = useQuotesTpSlData();
  const setTpSlFunc = useSetTpSlDataCallback();
  const intervalFunctions = useRef<{ [quoteId: number]: () => void }>({});
  const AppName = useAppName();
  const { tpslUrl } = useHedgerInfo() || {};
  useEffect(() => {
    async function getData(
      quoteId: number,
      tp: string,
      sl: string,
      stateParam: TpSlDataStateParam,
      tpOpenPrice: string,
      slOpenPrice: string,
      state: TpSlDataState
    ) {
      const receiveTp = await getTpSlRequest(quoteId, AppName, tpslUrl);
      if (!receiveTp) {
        if (state !== TpSlDataState.FORCE_CHECKING) {
          setTpSlFunc(
            {
              tp: tp?.toString(),
              sl: sl?.toString(),
              tpOpenPrice,
              slOpenPrice,
              quoteId,
              tpSlState: TpSlDataState.NOT_FOUND,
            },
            quoteId
          );
        }
        return;
      }
      let tempTp = tp;
      let tempSl = sl;
      let tempTpOpenPrice = tpOpenPrice;
      let tempSlOpenPrice = slOpenPrice;
      for (const conditional_i of receiveTp) {
        if (
          conditional_i.conditional_order_type === "take_profit" &&
          conditional_i.state === "new"
        ) {
          tempTp = conditional_i.conditional_order_price.toString();
          tempTpOpenPrice = conditional_i.price.toString();
        } else if (
          conditional_i.conditional_order_type === "stop_loss" &&
          conditional_i.state === "new"
        ) {
          tempSl = conditional_i.conditional_order_price.toString();
          tempSlOpenPrice = conditional_i.price.toString();
        }
      }
      const tpFlag =
        tempTp !== tp &&
        (stateParam === TpSlDataStateParam.CHECK_TP ||
          stateParam === TpSlDataStateParam.CHECK_ANY_TP_SL ||
          stateParam === TpSlDataStateParam.CHECK_TP_SL);
      const slFlag =
        tempSl !== sl &&
        (stateParam === TpSlDataStateParam.CHECK_SL ||
          stateParam === TpSlDataStateParam.CHECK_ANY_TP_SL ||
          stateParam === TpSlDataStateParam.CHECK_TP_SL);
      const updateFlag =
        stateParam === TpSlDataStateParam.CHECK_TP_SL
          ? tpFlag && slFlag
          : tpFlag || slFlag;

      if (updateFlag || stateParam === TpSlDataStateParam.NONE) {
        setTpSlFunc(
          {
            tp: tempTp.toString(),
            sl: tempSl.toString(),
            tpOpenPrice: tempTpOpenPrice,
            slOpenPrice: tempSlOpenPrice,
            quoteId,
            tpSlState: TpSlDataState.VALID,
          },
          quoteId
        );
        if (intervalFunctions.current[quoteId]) {
          const targetFunc = intervalFunctions.current[quoteId];
          targetFunc();
          delete intervalFunctions.current[quoteId];
        }
      }
    }
    async function checkAndGetData() {
      for (const data_i in tpSlQuoteData) {
        if (tpSlQuoteData[data_i].tpSlState === TpSlDataState.LOADING) {
          getData(
            tpSlQuoteData[data_i].quoteId,
            tpSlQuoteData[data_i].tp,
            tpSlQuoteData[data_i].sl,
            TpSlDataStateParam.NONE,
            tpSlQuoteData[data_i].tpOpenPrice,
            tpSlQuoteData[data_i].slOpenPrice,
            tpSlQuoteData[data_i].tpSlState
          );
        } else if (
          tpSlQuoteData[data_i].tpSlState === TpSlDataState.FORCE_CHECKING
        ) {
          const intervalFunc = autoRefresh(
            () =>
              getData(
                tpSlQuoteData[data_i].quoteId,
                tpSlQuoteData[data_i].tp,
                tpSlQuoteData[data_i].sl,
                tpSlQuoteData[data_i].tpSlStateParam ??
                  TpSlDataStateParam.CHECK_ANY_TP_SL,
                tpSlQuoteData[data_i].tpOpenPrice,
                tpSlQuoteData[data_i].slOpenPrice,
                tpSlQuoteData[data_i].tpSlState
              ),
            5
          );
          intervalFunctions.current = {
            [tpSlQuoteData[data_i].quoteId]: intervalFunc,
          };
        }
      }
    }
    if (tpslUrl && tpslUrl.length > 0) {
      checkAndGetData();
    }
  }, [tpSlQuoteData, tpslUrl]);
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
