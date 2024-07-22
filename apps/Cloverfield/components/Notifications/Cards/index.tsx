import React from "react";

import { Quote } from "@symmio/frontend-sdk/types/quote";

import {
  NotificationDetails,
  NotificationType,
} from "@symmio/frontend-sdk/state/notifications/types";
import { useGetExistedQuoteByIdsCallback } from "@symmio/frontend-sdk/state/quotes/hooks";

import { useGetQuoteByIds } from "@symmio/frontend-sdk/hooks/useQuotes";
import { useUserAccounts } from "@symmio/frontend-sdk/hooks/useAccounts";

import TransferCollateral from "./TransferCollateralCard";
import LiquidationAlert from "./LiquidationAlertCard";
import PartiallyFill from "./PartialFillCard";
import SeenByHedger from "./SeenCard";
import SuccessQuote from "./SuccessQuoteCard";
import HedgerError from "./ErrorCard";
import Default from "./DefaultCard";

export default function Cards({
  notification,
}: {
  notification: NotificationDetails;
}) {
  // TODO:handling state when user account didn't selected
  const { quoteId, notificationType, counterpartyAddress } = notification;
  const { accounts } = useUserAccounts();
  const subAccount = accounts.find(
    (account) =>
      account.accountAddress.toLowerCase() ===
      counterpartyAddress?.toLowerCase()
  );
  const existedQuoteCallback = useGetExistedQuoteByIdsCallback();
  const existedQuote = existedQuoteCallback(quoteId);
  const { quotes, loading } = useGetQuoteByIds([Number(quoteId)]);
  const quoteData = existedQuote
    ? existedQuote
    : !loading
    ? quotes[0]
    : ({} as Quote);

  if (!subAccount) return <></>;

  switch (notificationType) {
    case NotificationType.TRANSFER_COLLATERAL:
      return (
        <TransferCollateral notification={notification} account={subAccount} />
      );

    case NotificationType.LIQUIDATION_ALERT:
      return (
        <LiquidationAlert
          notification={notification}
          account={subAccount}
          loading={loading}
        />
      );

    case NotificationType.PARTIAL_FILL:
      return (
        <PartiallyFill
          notification={notification}
          account={subAccount}
          quote={quoteData}
          loading={loading}
        />
      );

    case NotificationType.SEEN_BY_HEDGER:
      return (
        <SeenByHedger
          notification={notification}
          account={subAccount}
          quote={quoteData}
          loading={loading}
        />
      );

    case NotificationType.SUCCESS:
      return (
        <SuccessQuote
          notification={notification}
          account={subAccount}
          quote={quoteData}
          loading={loading}
        />
      );

    case NotificationType.HEDGER_ERROR:
      return (
        <HedgerError
          notification={notification}
          account={subAccount}
          quote={quoteData}
          loading={loading}
        />
      );

    case NotificationType.OTHER:
      return <></>;

    default:
      return (
        <Default
          notification={notification}
          account={subAccount}
          quote={quoteData}
          loading={loading}
        />
      );
  }
}
