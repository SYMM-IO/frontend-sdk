import { useEffect, useMemo } from "react";
import isEmpty from "lodash/isEmpty.js";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { useUserAccounts } from "../../hooks/useAccounts";
import { useAppDispatch } from "../declaration";
import useIsWindowVisible from "../../lib/hooks/useIsWindowVisible";
import { useHedgerInfo } from "../hedger/hooks";
import { AccountUpnl } from "../../types/user";
import { updateAllAccountsUpnl } from "./actions";

export function AllAccountsUpdater() {
  const accounts = useUserAccounts();

  if (!accounts?.accounts?.length) {
    return null;
  }

  return (
    <>
      {accounts.accounts.map((account) => (
        <AccountUpdater
          key={account.accountAddress}
          account={account.accountAddress}
        />
      ))}
    </>
  );
}

function AccountUpdater({ account }: { account: string }) {
  const dispatch = useAppDispatch();
  const windowVisible = useIsWindowVisible();
  const { webSocketUpnlUrl } = useHedgerInfo() || {};

  const url = useMemo(() => {
    if (webSocketUpnlUrl) {
      return webSocketUpnlUrl;
    }
    return null;
  }, [webSocketUpnlUrl]);

  const {
    readyState: upnlWebSocketState,
    sendMessage: sendAddress,
    lastJsonMessage: upnlWebSocketMessage,
  } = useWebSocket(url, {
    reconnectAttempts: 2,
    onOpen: () => console.log("websocket connection opened"),
    shouldReconnect: () => true,
    onError: (e) => console.log("WebSocket connection has error ", e),
  });

  useEffect(() => {
    if (upnlWebSocketState === ReadyState.OPEN && account) {
      sendAddress(account);
    }
  }, [upnlWebSocketState, account, sendAddress, windowVisible]);

  useEffect(() => {
    try {
      if (!upnlWebSocketMessage || isEmpty(upnlWebSocketMessage)) {
        dispatch(
          updateAllAccountsUpnl({
            account,
            upnl: {
              upnl: 0,
              timestamp: 0,
            },
          })
        );
        return;
      }

      const msg = upnlWebSocketMessage as any;

      const lastMessage: AccountUpnl = {
        upnl: msg.upnl,
        timestamp: msg.timestamp,
      };

      dispatch(updateAllAccountsUpnl({ account, upnl: lastMessage }));
    } catch (error) {
      dispatch(
        updateAllAccountsUpnl({
          account,
          upnl: {
            upnl: 0,
            timestamp: 0,
          },
        })
      );
    }
  }, [dispatch, upnlWebSocketMessage, windowVisible]);

  return null;
}
