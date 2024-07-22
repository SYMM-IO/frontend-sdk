import React, { useState, useEffect } from "react";
import { useTheme } from "styled-components";

import { Quote } from "@symmio/frontend-sdk/types/quote";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { formatTimestamp } from "@symmio/frontend-sdk/utils/time";

import {
  formatAmount,
  toBN,
  formatCurrency,
} from "@symmio/frontend-sdk/utils/numbers";

import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import {
  useQuoteLeverage,
  useQuoteSize,
} from "@symmio/frontend-sdk/hooks/useQuotes";

import { LongArrow, ShortArrow } from "components/Icons";
import {
  ContentWrapper,
  DataWrap,
  Label,
  Value,
  Row,
  TopWrap,
  PositionInfoBox,
  MarketName,
  Wrapper,
  Leverage,
  QuoteData,
  Chevron,
  FlexColumn,
  RowPnl,
} from "components/App/AccountData/PositionDetails/styles";
import { Row as RowComponent } from "components/Row";
import PositionDetailsNavigator from "./PositionDetailsNavigator";

export default function CanceledQuoteDetails({
  quote,
  mobileVersion = false,
}: {
  quote: Quote;
  mobileVersion: boolean;
}): JSX.Element {
  const theme = useTheme();
  const {
    id,
    quantity,
    positionType,
    marketId,
    requestedOpenPrice,
    orderType,
    statusModifyTimestamp,
  } = quote;
  const { symbol, asset } = useMarket(marketId) || {};
  const quoteSize = useQuoteSize(quote);
  const leverage = useQuoteLeverage(quote);
  const notionalValue = toBN(quoteSize).times(requestedOpenPrice);

  const [expanded, setExpanded] = useState(!mobileVersion);
  useEffect(() => {
    if (!mobileVersion) {
      setExpanded(true);
    }
  }, [mobileVersion]);

  return (
    <>
      <TopWrap
        onClick={() => {
          if (mobileVersion) {
            setExpanded(!expanded);
          }
        }}
        mobileVersion={mobileVersion}
        expand={expanded}
      >
        <FlexColumn flex={4} alignItems={"flex-start"}>
          <PositionInfoBox>
            <RowComponent width={"initial"}>
              <MarketName>
                <div>
                  {symbol}-{asset}
                </div>
                <div>-Q{id}</div>
              </MarketName>
              <Leverage>{leverage}x</Leverage>
              <QuoteData>
                {positionType}
                {positionType === PositionType.LONG ? (
                  <LongArrow width={16} height={12} color={theme.green1} />
                ) : (
                  <ShortArrow width={16} height={12} color={theme.red1} />
                )}
              </QuoteData>
            </RowComponent>
            {!mobileVersion && <PositionDetailsNavigator />}
          </PositionInfoBox>

          {mobileVersion && (
            <RowPnl>
              <Label>Canceled</Label>
            </RowPnl>
          )}
        </FlexColumn>
        {mobileVersion && (
          <FlexColumn flex={1} alignItems={"flex-end"}>
            <Chevron open={expanded} />
          </FlexColumn>
        )}
      </TopWrap>
      {expanded && (
        <Wrapper>
          {/* <Row>
            <ArrowWrap>
              <NextIcon />
            </ArrowWrap>
            <ArrowWrap>
              <PreviousIcon />
            </ArrowWrap>
          </Row> */}
          <DataWrap>
            <Row>
              <Label>Cancel Time:</Label>
              <Value>{formatTimestamp(statusModifyTimestamp * 1000)}</Value>
            </Row>
            <Row>
              <Label>Position Value:</Label>
              <Value>
                {toBN(notionalValue).isEqualTo(0)
                  ? "-"
                  : `${formatCurrency(notionalValue)} ${asset}`}
              </Value>
            </Row>
            <Row>
              <Label>Position Size:</Label>
              <Value>{`${formatAmount(quantity)} ${symbol}`}</Value>
            </Row>
            <Row>
              <Label>Order Price:</Label>
              <Value>{`${formatAmount(
                requestedOpenPrice,
                6,
                true
              )} ${asset}`}</Value>
            </Row>
            <Row>
              <Label>Locked Amount:</Label>
              <Value>-</Value>
            </Row>
          </DataWrap>
          <ContentWrapper>
            <Row>
              <Label>Created Time:</Label>
              <Value>{formatTimestamp(quote.createTimestamp * 1000)}</Value>
            </Row>
            <Row>
              <Label>Order Type:</Label>
              <Value>{orderType}</Value>
            </Row>
            <Row>
              <Label>Platform Fee:</Label>
              <Value>-</Value>
            </Row>
          </ContentWrapper>
        </Wrapper>
      )}
    </>
  );
}
