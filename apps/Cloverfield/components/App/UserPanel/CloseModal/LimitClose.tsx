import React from "react";

import { toBN } from "@symmio/frontend-sdk/utils/numbers";

import { Quote } from "@symmio/frontend-sdk/types/quote";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { CustomInputBox2 } from "components/InputBox";
import { useBypassPrecisionCheckMode } from "@symmio/frontend-sdk/state/user/hooks";

export default function LimitClose({
  quote,
  price,
  setPrice,
  marketPrice,
  symbol,
  balanceTitle,
}: {
  quote: Quote | null;
  price: string;
  setPrice: (s: string) => void;
  marketPrice: string | null | undefined;
  symbol?: string;
  balanceTitle?: string;
}) {
  const userBypassPrecisionCheckMode = useBypassPrecisionCheckMode();
  const { pricePrecision } = useMarket(quote?.marketId) || {};
  const precision = userBypassPrecisionCheckMode ? undefined : pricePrecision;

  return (
    <CustomInputBox2
      title={"Price"}
      symbol={symbol}
      placeholder="0"
      precision={precision}
      balanceTitle={balanceTitle ?? "Offer Price:"}
      balanceDisplay={
        marketPrice && pricePrecision
          ? toBN(marketPrice).toFixed(pricePrecision)
          : "0"
      }
      balanceExact={
        marketPrice && pricePrecision
          ? toBN(marketPrice).toFixed(pricePrecision)
          : "0"
      }
      onChange={setPrice}
      value={price}
    />
  );
}
