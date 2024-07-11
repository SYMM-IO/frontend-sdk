import { useMemo } from "react";
import { useTheme } from "styled-components";

import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";

export function useCheckQuoteIsExpired(quote: Quote): {
  expired: boolean;
  expiredColor: string | undefined;
} {
  const theme = useTheme();
  const { quoteStatus, deadline } = quote;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  return useMemo(() => {
    const checkDeadline = currentTimestamp > Number(deadline);
    if (quoteStatus === QuoteStatus.PENDING && checkDeadline)
      return { expired: checkDeadline, expiredColor: theme.bgWarning };
    if (quoteStatus === QuoteStatus.CLOSE_PENDING)
      return { expired: checkDeadline, expiredColor: undefined };
    return { expired: false, expiredColor: undefined };
  }, [currentTimestamp, deadline, quoteStatus, theme.bgWarning]);
}
