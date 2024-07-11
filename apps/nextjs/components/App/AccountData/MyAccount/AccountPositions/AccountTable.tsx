import { useContext, useMemo } from "react";
import styled, { useTheme } from "styled-components";

import { formatPrice } from "@symmio/frontend-sdk/utils/numbers";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { ISingleQuoteInfo } from "@symmio/frontend-sdk/types/quotesOverview";
import { AccountPositionsContext } from "./context";
import { ConnectionStatus } from "@symmio/frontend-sdk/types/api";

import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { useTotalNotionalValue } from "@symmio/frontend-sdk/hooks/usePositionOverview";
import { useUpnlWebSocketStatus } from "@symmio/frontend-sdk/state/user/hooks";

import Column from "components/Column";
import { Row, RowBetween } from "components/Row";
import { LongArrow, ShortArrow } from "components/Icons";
import ShimmerAnimation from "components/ShimmerAnimation";

const TABLE_WIDTH = 377;

export const Container = styled.div`
  display: inline-block;
  margin: 31px 0 0;
  min-width: ${TABLE_WIDTH}px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    min-width: 100%;
  `}
`;

const TableStructure = styled(RowBetween)`
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  font-weight: 400;

  & > * {
    &:nth-child(1) {
      width: ${(48 * 100) / TABLE_WIDTH}%;
    }
    &:nth-child(2) {
      width: ${(99 * 100) / TABLE_WIDTH}%;
    }
    &:nth-child(3) {
      width: ${(91 * 100) / TABLE_WIDTH}%;
    }
    &:nth-child(4) {
      width: ${(65 * 100) / TABLE_WIDTH}%;
    }
    &:nth-child(5) {
      width: ${(74 * 100) / TABLE_WIDTH}%;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 10px;

    & > * {  
      &:nth-child(4) {
        width: ${(50 * 100) / TABLE_WIDTH}%;
      }
      &:nth-child(5) {
        width: ${(88 * 100) / TABLE_WIDTH}%;
      }
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;

    & > * {  
      &:nth-child(4) {
        width: ${(65 * 100) / TABLE_WIDTH}%;
      }
      &:nth-child(5) {
        width: ${(74 * 100) / TABLE_WIDTH}%;
      }
    }
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
    & > * {  
      &:nth-child(4) {
        width: ${(50 * 100) / TABLE_WIDTH}%;
      }
      &:nth-child(5) {
        width: ${(88 * 100) / TABLE_WIDTH}%;
      }
    }
  `}
`;

const RowWrap = styled(TableStructure)`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text0};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 12px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`;

const Circle = styled.div<{ color: string | undefined }>`
  width: 12px;
  height: 12px;
  border-radius: 100%;
  background-color: ${({ color }) => color};
`;

const ImageWrapper = styled.div`
  padding: 2px 8px;
`;

const PositionInfo = styled(Row)`
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    gap: 8px;
  `}
`;

const PositionText = styled.span`
  color: ${({ theme }) => theme.text3};
  font-size: 10px;
  font-weight: 400;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 8px;
  `}
`;

const HeaderWrap = styled(TableStructure)`
  color: ${({ theme }) => theme.text2};
  font-weight: 400;
  margin-bottom: 24px;
`;

const BodyWrap = styled(Column)`
  gap: 24px;
  overflow: scroll;
`;

function EmptyPositionRow() {
  return (
    <RowWrap>
      <div>
        <ShimmerAnimation width="24px" height="16px" />
      </div>
      <div>
        <ShimmerAnimation width="68px" height="17px" />
      </div>
      <div>
        <ShimmerAnimation width="68px" height="17px" />
      </div>
      <div>
        <ShimmerAnimation width="28px" height="17px" />
      </div>
      <div>
        <ShimmerAnimation width="68px" height="12px" />
      </div>
    </RowWrap>
  );
}

function PositionRow({
  marketQuoteInfo,
  totalValue,
  color,
}: {
  marketQuoteInfo: ISingleQuoteInfo;
  totalValue: number;
  color: string;
}): JSX.Element | null {
  const theme = useTheme();
  const { marketId, positionType, value, positionQuantity } = marketQuoteInfo;
  const valuePercent = useMemo(
    () => (value / totalValue) * 100 || 0,
    [value, totalValue]
  );
  const market = useMarket(marketId);

  return (
    <RowWrap>
      <ImageWrapper>
        {positionType === PositionType.LONG ? (
          <LongArrow width={15} height={12} color={theme.green1} />
        ) : (
          <ShortArrow width={15} height={12} color={theme.red1} />
        )}
      </ImageWrapper>
      <div>
        {market?.symbol || ""}-{market?.asset || ""}
      </div>
      <div>${formatPrice(value, 2, true)}</div>
      <div>{valuePercent.toFixed(1)}%</div>
      <PositionInfo>
        <Circle color={color} />
        <PositionText>
          {positionQuantity} position{positionQuantity > 1 ? "s" : ""}
        </PositionText>
      </PositionInfo>
    </RowWrap>
  );
}

function TableHeader(): JSX.Element | null {
  const HEADERS: string[] = ["Type", "Symbol", "TotalValue", "%", "#"];
  return (
    <HeaderWrap>
      {HEADERS.map((item, key) => (
        <div key={key}>{item}</div>
      ))}
    </HeaderWrap>
  );
}

function TableBody() {
  const { marketQuotesInfo, colors } = useContext(AccountPositionsContext);
  const upnlLoadingStatus = useUpnlWebSocketStatus();
  const loading = upnlLoadingStatus === ConnectionStatus.CLOSED;
  const totalNotionalValue = useTotalNotionalValue(marketQuotesInfo);

  return (
    <BodyWrap>
      {loading
        ? [...Array(5)].map((_, index) => <EmptyPositionRow key={index} />)
        : marketQuotesInfo.map((quoteInfo, index) => (
            <PositionRow
              marketQuoteInfo={quoteInfo}
              color={colors[index]}
              totalValue={totalNotionalValue}
              key={`${quoteInfo.marketId}-${quoteInfo.positionType}`}
            />
          ))}
    </BodyWrap>
  );
}

export default function AccountTable() {
  return (
    <Container>
      <TableHeader />
      <TableBody />
    </Container>
  );
}
