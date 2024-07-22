import React from "react";

import { Account } from "@symmio/frontend-sdk/types/user";
import { Quote } from "@symmio/frontend-sdk/types/quote";
import {
  NotificationMessages,
  NotificationDetails,
} from "@symmio/frontend-sdk/state/notifications/types";

import useCurrencyLogo, { useCollateralLogo } from "lib/hooks/useCurrencyLogo";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";

import { PartiallyFillText, PartiallyFillTitle } from "./styles";
import BaseItem from "components/Notifications/Cards/BaseCard";
import ShimmerAnimation from "components/ShimmerAnimation";

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
  const { modifyTime, lastSeenAction, quoteId } = notification;
  const { symbol, asset } = useMarket(marketId) || {};
  const token1 = useCurrencyLogo(symbol);
  const token2 = useCollateralLogo();

  const text =
    lastSeenAction !== null ? NotificationMessages[lastSeenAction] : "";

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
            - Q{quoteId} | {orderType}
          </div>
        </PartiallyFillTitle>
      }
      text={
        <PartiallyFillText>
          <div>&#34;{text}&#34; successful</div>
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
