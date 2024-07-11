import React, { useMemo } from "react";

import { toBN } from "@symmio/frontend-sdk/utils/numbers";
import { Account } from "@symmio/frontend-sdk/types/user";
import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";

import {
  LastSeenAction,
  NotificationDetails,
} from "@symmio/frontend-sdk/state/notifications/types";

import useCurrencyLogo, { useCollateralLogo } from "lib/hooks/useCurrencyLogo";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";

import BaseItem from "components/Notifications/Cards/BaseCard";
import ShimmerAnimation from "components/ShimmerAnimation";
import { PartiallyFillText, PartiallyFillTitle } from "./styles";

export default function PartiallyFillCard({
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
  const {
    lastSeenAction,
    quoteId,
    modifyTime,
    filledAmountClose,
    filledAmountOpen,
  } = notification;
  const { marketId, quoteStatus, quantity, quantityToClose } = quote || {};
  const { symbol, asset } = useMarket(marketId) || {};
  const amount = useMemo(() => {
    if (
      quoteStatus === QuoteStatus.CLOSE_PENDING ||
      quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING
    )
      return quantityToClose;
    return quantity;
  }, [quantityToClose, quantity, quoteStatus]);
  // const text = lastSeenAction === LastSeenAction.SEND_QUOTE ? 'Position Opened' : 'Position Closed'
  const fillAmountBN =
    lastSeenAction === LastSeenAction.SEND_QUOTE
      ? toBN(filledAmountOpen ?? "0")
      : toBN(filledAmountClose ?? "0");
  const token1 = useCurrencyLogo(symbol);
  const token2 = useCollateralLogo();

  return (
    <>
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

            <div> - Q{quoteId}</div>
          </PartiallyFillTitle>
        }
        text={
          <PartiallyFillText>
            <div>
              ({`${fillAmountBN.toString()} ${symbol} of ${amount} ${symbol}`})
            </div>
          </PartiallyFillText>
        }
        token1={token1}
        token2={token2}
        timestamp={modifyTime}
        accountName={account.name}
        loading={loading}
      />
    </>
  );
}
