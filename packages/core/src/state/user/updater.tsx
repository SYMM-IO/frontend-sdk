import { useEffect, useMemo, useRef } from "react";
import isEmpty from "lodash/isEmpty.js";
import { AppDispatch, AppThunkDispatch, useAppDispatch } from "../declaration";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket.js";

// TODO: fix this { ReadyState } from "react-use-websocket"
enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import useIsWindowVisible from "../../lib/hooks/useIsWindowVisible";

import { AccountUpnl } from "../../types/user";
import { useHedgerInfo } from "../hedger/hooks";

import { updateAccountUpnl, updateMatchesDarkMode } from "./actions";
import {
  useActiveAccountAddress,
  useSetUpnlWebSocketStatus,
  useUserWhitelist,
} from "./hooks";
import { getIsWhiteList, getTotalDepositsAndWithdrawals } from "./thunks";
import {
  useAnalyticsSubgraphAddress,
  useAppName,
  useMultiAccountAddress,
} from "../chains/hooks";
import { ConnectionStatus } from "../../types/api";
import { useAnalyticsApolloClient } from "../../apollo/client/balanceHistory";
import { useContractDelegateTpSl } from "../../hooks/useTpSl";
import {
  useSetDelegateTpSl,
  useSetTpSlConfig,
  useTpSlDelegate,
} from "../trade/hooks";
import { autoRefresh } from "../../utils/retry";
import { makeHttpRequestV2 } from "../../utils/http";

export function UserUpdater(): null {
  const dispatch = useAppDispatch();
  const thunkDispatch: AppThunkDispatch = useAppDispatch();
  const { account, chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const client = useAnalyticsApolloClient();
  const subgraphAddress = useAnalyticsSubgraphAddress();
  const appName = useAppName();
  const delegateChecker = useContractDelegateTpSl();
  const prevDelegate = useTpSlDelegate();
  const setDelegateTpSl = useSetDelegateTpSl();
  const setTpSlConfig = useSetTpSlConfig();
  const configRequestRef = useRef<() => void>();
  const { baseUrl, fetchData, tpslUrl } = useHedgerInfo() || {};

  useUpnlWebSocket(dispatch);

  useEffect(() => {
    if (delegateChecker && delegateChecker.length > 1) {
      if ((delegateChecker[0] && delegateChecker[1]) !== prevDelegate) {
        setDelegateTpSl(delegateChecker[0] && delegateChecker[1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegateChecker, setDelegateTpSl]);

  useEffect(() => {
    async function getConfig() {
      const res = await getTpSlConfigRequest(tpslUrl, appName);
      if (res) {
        setTpSlConfig(res);
        if (configRequestRef.current) {
          configRequestRef.current();
        }
      }
    }
    if (tpslUrl?.length > 0 && appName?.length > 0) {
      const intervalFunc = autoRefresh(getConfig, 5);
      configRequestRef.current = intervalFunc;
    }

    return () => {
      if (configRequestRef?.current) {
        configRequestRef?.current();
      }
    };
  }, [tpslUrl, appName]);

  useEffect(() => {
    if (
      fetchData &&
      account &&
      Object.keys(MULTI_ACCOUNT_ADDRESS).length &&
      chainId
    )
      thunkDispatch(
        getIsWhiteList({
          baseUrl,
          account,
          multiAccountAddress: MULTI_ACCOUNT_ADDRESS[chainId],
          appName,
        })
      );
  }, [
    thunkDispatch,
    baseUrl,
    account,
    fetchData,
    appName,
    MULTI_ACCOUNT_ADDRESS,
    chainId,
  ]);

  useEffect(() => {
    if (chainId)
      thunkDispatch(
        getTotalDepositsAndWithdrawals({
          account: activeAccountAddress,
          chainId,
          client,
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccountAddress, chainId, subgraphAddress, thunkDispatch]);

  // keep dark mode in sync with the system
  useEffect(() => {
    const darkHandler = (match: MediaQueryListEvent) => {
      dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }));
    };

    const match = window?.matchMedia("(prefers-color-scheme: dark)");
    dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }));

    if (match?.addListener) {
      match?.addListener(darkHandler);
    } else if (match?.addEventListener) {
      match?.addEventListener("change", darkHandler);
    }

    return () => {
      if (match?.removeListener) {
        match?.removeListener(darkHandler);
      } else if (match?.removeEventListener) {
        match?.removeEventListener("change", darkHandler);
      }
    };
  }, [dispatch]);

  return null;
}
async function getTpSlConfigRequest(TP_SL_URL: string, APP_NAME: string) {
  const { href: tpSlUrl } = new URL(
    `conditional-order/dev/configs/`,
    TP_SL_URL
  );
  const options = {
    headers: [["App-Name", APP_NAME]],
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

function useUpnlWebSocket(dispatch: AppDispatch) {
  const windowVisible = useIsWindowVisible();
  const activeAccountAddress = useActiveAccountAddress();
  const updateWebSocketStatus = useSetUpnlWebSocketStatus();
  const isAccountWhiteList = useUserWhitelist();
  const { webSocketUpnlUrl } = useHedgerInfo() || {};

  const url = useMemo(() => {
    if (isAccountWhiteList && webSocketUpnlUrl) {
      return webSocketUpnlUrl;
    }
    return null;
  }, [isAccountWhiteList, webSocketUpnlUrl]);

  const {
    readyState: upnlWebSocketState,
    sendMessage: sendAddress,
    lastJsonMessage: upnlWebSocketMessage,
  } = useWebSocket<{
    upnl: number;
    timestamp: number;
    available_balance: number;
  }>(url, {
    reconnectAttempts: 2,
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    shouldReconnect: () => true,
    onError: (e) => console.log("WebSocket connection has error ", e),
  });

  const connectionStatus = useMemo(() => {
    if (upnlWebSocketState === ReadyState.OPEN) {
      return ConnectionStatus.OPEN;
    } else {
      return ConnectionStatus.CLOSED;
    }
  }, [upnlWebSocketState]);

  useEffect(() => {
    updateWebSocketStatus(connectionStatus);
  }, [connectionStatus, updateWebSocketStatus]);

  useEffect(() => {
    if (upnlWebSocketState === ReadyState.OPEN && activeAccountAddress) {
      sendAddress(activeAccountAddress);
    }
  }, [upnlWebSocketState, activeAccountAddress, sendAddress, windowVisible]);

  useEffect(() => {
    try {
      if (!upnlWebSocketMessage || isEmpty(upnlWebSocketMessage)) {
        dispatch(
          updateAccountUpnl({
            upnl: 0,
            timestamp: 0,
            available_balance: 0,
          })
        );
        return;
      }

      // TODO: we should add type checking here

      const lastMessage: AccountUpnl = upnlWebSocketMessage ?? {
        upnl: 0,
        timestamp: 0,
        available_balance: 0,
      };
      dispatch(updateAccountUpnl(lastMessage));
    } catch (error) {
      dispatch(
        updateAccountUpnl({
          upnl: 0,
          timestamp: 0,
          available_balance: 0,
        })
      );
    }
  }, [dispatch, upnlWebSocketMessage, windowVisible]);
}
