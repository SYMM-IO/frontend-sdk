import React from "react";
import styled from "styled-components";

import { toBN } from "@symmio/frontend-sdk/utils/numbers";

import { Quote } from "@symmio/frontend-sdk/types/quote";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { CustomInputBox2 } from "components/InputBox";
import { useExpertMode } from "@symmio/frontend-sdk/state/user/hooks";

export const InputAmount = styled.input.attrs({ type: "number" })<{
  active?: boolean;
}>`
  border: 0;
  outline: none;
  width: 100%;
  margin-right: 2px;
  margin-left: 2px;
  font-size: 12px;
  background: transparent;
  color: ${({ theme }) => theme.text0};

  appearance: textfield;

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ${({ active, theme }) =>
    active &&
    `
    color: ${theme.text0};
  `}
`;

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
  const userExpertMode = useExpertMode();
  const { pricePrecision } = useMarket(quote?.marketId) || {};
  const precision = userExpertMode ? undefined : pricePrecision;

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
