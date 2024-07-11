import React from "react";
import styled from "styled-components";

import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";

import { RowBetween, RowEnd } from "components/Row";
import { InnerCard } from "components/Card";
import SlippageTolerance from "components/App/SlippageTolerance";

const PriceWrap = styled(InnerCard)`
  background: ${({ theme }) => theme.bg2};
  padding-top: 8px;
  & > * {
    &:last-child {
      height: 28px;
      margin-top: 12px;
    }
  }
`;

const Title = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 12px;
  font-weight: 400;
`;

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

export default function MarketClose({
  price,
  symbol,
}: {
  price: string | undefined;
  symbol?: string;
}) {
  return (
    <>
      <PriceWrap>
        <RowBetween>
          <Title>Market Price</Title>
          <div>
            {formatAmount(price, 6)} {symbol}
          </div>
        </RowBetween>
        <RowBetween>
          <Title>Slippage</Title>
          <RowEnd>
            <SlippageTolerance />
          </RowEnd>
        </RowBetween>
      </PriceWrap>
    </>
  );
}
