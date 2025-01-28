import React from "react";

import { Account } from "@symmio/frontend-sdk/types/user";
import { Quote } from "@symmio/frontend-sdk/types/quote";
import {
  NotificationMessages,
  NotificationDetails,
  LastSeenAction,
} from "@symmio/frontend-sdk/state/notifications/types";

import useCurrencyLogo, { useCollateralLogo } from "lib/hooks/useCurrencyLogo";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";

import { PartiallyFillText, PartiallyFillTitle } from "./styles";
import BaseItem from "components/Notifications/Cards/BaseCard";
import ShimmerAnimation from "components/ShimmerAnimation";
import { useQuoteInstantOpenData } from "@symmio/frontend-sdk/state/quotes/hooks";

export default function SuccessQuoteCard({
  notification,
  account,
  quote,
  loading,
}: {
  notification: NotificationDetails;
  account: Account;
  quote?: Quote;
  loading?: boolean;
}): JSX.Element {
  const { marketId, orderType } = quote || {};
  const {
    modifyTime,
    lastSeenAction,
    quoteId,
    tempQuoteId,
    orderType: nOrderType,
  } = notification;
  const { marketId: instantQuoteMarketId } =
    useQuoteInstantOpenData(tempQuoteId) || {};
  const { symbol, asset } = useMarket(marketId ?? instantQuoteMarketId) || {};
  const token1 = useCurrencyLogo(symbol);
  const token2 = useCollateralLogo();

  const getText = () => {
    let message = "";

    if (lastSeenAction === LastSeenAction.SEND_QUOTE_TRANSACTION) {
      message = `Temp Quote${tempQuoteId} converted to ${quoteId}`;
    } else if (lastSeenAction) {
      message = `"${NotificationMessages[lastSeenAction]}"`;
    }

    // Add "successful" if not SEND_QUOTE_TRANSACTION
    if (lastSeenAction !== LastSeenAction.SEND_QUOTE_TRANSACTION) {
      message += " successful";
    }

    return `${message}`;
  };

  return (
    <BaseItem
      title={
        <PartiallyFillTitle>
          {loading ? (
            <ShimmerAnimation width={"55px"} height={"14px"} />
          ) : (
            <div>
              {symbol}-{asset}{" "}
            </div>
          )}
          <div>
            {" "}
            - Q{quoteId} | {orderType ?? nOrderType}
          </div>
        </PartiallyFillTitle>
      }
      text={
        <PartiallyFillText>
          <div>{getText()}</div>
        </PartiallyFillText>
      }
      token1={token1}
      token2={token2}
      timestamp={modifyTime}
      accountName={account.name}
      loading={loading}
    />
  );
}
