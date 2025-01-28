import React from "react";
import styled from "styled-components";

import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";

import { RowBetween, RowEnd } from "components/Row";
import { InnerCard } from "components/Card";
import SlippageTolerance from "components/App/SlippageTolerance";

// const DefaultOptionButton = styled.div<{ active?: boolean }>`
//   padding: 4px 8px;
//   font-size: 12px;
//   width: 100px;
//   height: 28px;
//   border-radius: 4px;
//   white-space: nowrap;
//   display: inline-flex;
//   justify-content: flex-end;
//   background: ${({ theme }) => theme.bg4};
//   color: ${({ theme }) => theme.text1};
//   border: 1px solid ${({ theme }) => theme.bg6};

//   &:hover {
//     cursor: pointer;
//   }

//   ${({ theme }) => theme.mediaWidth.upToSmall`
//       // margin-right: 5px;
//       white-space: normal;
//   `}
// `
const PriceWrap = styled(InnerCard)`
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
