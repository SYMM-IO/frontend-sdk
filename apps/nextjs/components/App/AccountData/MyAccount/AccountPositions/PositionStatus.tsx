import React, { useContext } from "react";
import styled, { useTheme } from "styled-components";

import { formatPrice } from "@symmio/frontend-sdk/utils/numbers";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { ConnectionStatus } from "@symmio/frontend-sdk/types/api";

import { DefaultHeader } from "../styles";
import { Row } from "components/Row";
import Column from "components/Column";
import { LongArrow, ShortArrow } from "components/Icons";
import { IQuotesInfo } from "@symmio/frontend-sdk/types/quotesOverview";
import { useTotalNotionalValue } from "@symmio/frontend-sdk/hooks/usePositionOverview";
import ShimmerAnimation from "components/ShimmerAnimation";
import { AccountPositionsContext } from "./context";

import { useUpnlWebSocketStatus } from "@symmio/frontend-sdk/state/user/hooks";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto) 1fr;
  column-gap: 60px;
  row-gap: 24px;

  background-color: ${({ theme }) => theme.bg1};
  padding: 16px 24px;
  border-radius: 4px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  `}
`;

const PositionInfo = styled(Column)`
  gap: 12px;
`;

const PositionTotalValue = styled(PositionInfo)`
  justify-self: end;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: initial;
    grid-column: 2;
    grid-row: 1;
  `}
`;

const PositionNumber = styled(DefaultHeader)`
  padding: 0;
  font-size: 24px;
`;

const PositionText = styled(Row)`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.text2};
`;

function getPositionNumbers(quotesInfo: IQuotesInfo) {
  const calcArraySum = (inQuotesInfo: IQuotesInfo) =>
    inQuotesInfo
      .map((quoteInfo) => quoteInfo.positionQuantity)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const shortPositions = quotesInfo.filter(
    (quoteInfo) => quoteInfo.positionType === PositionType.SHORT
  );
  const longPositions = quotesInfo.filter(
    (quoteInfo) => quoteInfo.positionType === PositionType.LONG
  );

  const totalPositionNumber = calcArraySum(quotesInfo);
  const shortPositionNumber = calcArraySum(shortPositions);
  const longPositionNumber = calcArraySum(longPositions);

  return {
    totalPositionNumber,
    shortPositionNumber,
    longPositionNumber,
  };
}

function EmptyPositionStatusBody() {
  return (
    <>
      <PositionInfo>
        <ShimmerAnimation width="89px" height="28px" />
        <ShimmerAnimation width="48px" height="14px" />
      </PositionInfo>
      <PositionInfo>
        <ShimmerAnimation width="89px" height="28px" />
        <ShimmerAnimation width="48px" height="14px" />
      </PositionInfo>
      <PositionInfo>
        <ShimmerAnimation width="89px" height="28px" />
        <ShimmerAnimation width="48px" height="14px" />
      </PositionInfo>
      <PositionTotalValue>
        <ShimmerAnimation width="130px" height="28px" />
        <ShimmerAnimation width="68px" height="14px" />
      </PositionTotalValue>
    </>
  );
}

function PositionStatusBody() {
  const theme = useTheme();
  const { marketQuotesInfo } = useContext(AccountPositionsContext);

  const { totalPositionNumber, longPositionNumber, shortPositionNumber } =
    getPositionNumbers(marketQuotesInfo);
  const totalPositionValue = useTotalNotionalValue(marketQuotesInfo);

  return (
    <>
      <PositionInfo>
        <PositionNumber>{totalPositionNumber}</PositionNumber>
        <PositionText>Open Position</PositionText>
      </PositionInfo>
      <PositionInfo>
        <PositionNumber>{longPositionNumber}</PositionNumber>
        <PositionText gap={"4px"}>
          Longs
          <LongArrow width={12} height={8} color={theme.green1} />
        </PositionText>
      </PositionInfo>
      <PositionInfo>
        <PositionNumber>{shortPositionNumber}</PositionNumber>
        <PositionText gap={"4px"}>
          Shorts
          <ShortArrow width={12} height={8} color={theme.red1} />
        </PositionText>
      </PositionInfo>
      <PositionTotalValue>
        <PositionNumber>
          ${formatPrice(totalPositionValue, 2, true)}
        </PositionNumber>
        <PositionText gap={"4px"}>Position Total Value</PositionText>
      </PositionTotalValue>
    </>
  );
}

export default function PositionStatus() {
  const upnlLoadingStatus = useUpnlWebSocketStatus();
  const loading = upnlLoadingStatus === ConnectionStatus.CLOSED;
  return (
    <Container>
      {loading ? <EmptyPositionStatusBody /> : <PositionStatusBody />}
    </Container>
  );
}
