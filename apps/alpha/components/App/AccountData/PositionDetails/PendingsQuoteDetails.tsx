import React, { useState, useEffect } from "react";
import styled, { useTheme } from "styled-components";

import { Quote } from "@symmio/frontend-sdk/types/quote";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { formatTimestamp } from "@symmio/frontend-sdk/utils/time";
import {
  formatAmount,
  formatCurrency,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";

import { useMarketData } from "@symmio/frontend-sdk/state/hedger/hooks";

import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import {
  useLockedMargin,
  useQuoteLeverage,
  useQuoteSize,
} from "@symmio/frontend-sdk/hooks/useQuotes";
import { useNotionalValue } from "@symmio/frontend-sdk/hooks/useTradePage";
import useBidAskPrice from "@symmio/frontend-sdk/hooks/useBidAskPrice";

import { LongArrow, ShortArrow } from "components/Icons";
import BlinkingPrice from "components/App/FavoriteBar/BlinkingPrice";
import { Row as RowComponent } from "components/Row";
import {
  Wrapper,
  MarketName,
  Leverage,
  QuoteData,
  PositionInfoBox,
  TopWrap,
  ContentWrapper,
  DataWrap,
  Label,
  Value,
  Row,
  Chevron,
  FlexColumn,
  RowPnl,
} from "components/App/AccountData/PositionDetails/styles";
import { PositionActionButton } from "components/Button";
import PositionDetailsNavigator from "./PositionDetailsNavigator";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { useCheckQuoteIsExpired } from "lib/hooks/useCheckQuoteIsExpired";

const ExpiredStatus = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.warning};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

export default function PendingQuoteDetails({
  quote,
  platformFee,
  buttonText,
  disableButton,
  onClickButton,
  mobileVersion = false,
}: {
  quote: Quote;
  platformFee: string;
  buttonText?: string;
  disableButton?: boolean;
  onClickButton?: (event: React.MouseEvent<HTMLDivElement>) => void;
  mobileVersion: boolean;
}): JSX.Element {
  const theme = useTheme();
  const { chainId } = useActiveWagmi();
  const {
    id,
    quantity,
    quoteStatus,
    positionType,
    orderType,
    requestedOpenPrice,
    marketId,
    createTimestamp,
    deadline,
  } = quote;
  const market = useMarket(marketId);
  const { symbol, name, asset } = market || {};
  const { ask: askPrice, bid: bidPrice } = useBidAskPrice(market);
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const marketData = useMarketData(name);
  const quoteSize = useQuoteSize(quote);
  const leverage = useQuoteLeverage(quote);
  const lockedAmount = useLockedMargin(quote);
  const notionalValue = useNotionalValue(quoteSize, marketData?.markPrice || 0);
  const { expired } = useCheckQuoteIsExpired(quote);

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
        <FlexColumn flex={buttonText ? 2 : 4} alignItems={"flex-start"}>
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
              <Label>{quoteStatus}</Label>
            </RowPnl>
          )}
        </FlexColumn>
        {mobileVersion && (
          <FlexColumn flex={1} alignItems={"flex-end"}>
            {buttonText && (
              <PositionActionButton
                expired={expired}
                disabled={disableButton}
                onClick={onClickButton}
              >
                {buttonText}
              </PositionActionButton>
            )}
            <Chevron open={expanded} />
          </FlexColumn>
        )}
      </TopWrap>
      {expanded && (
        <Wrapper>
          <DataWrap>
            {expired ? (
              <Row>
                <ExpiredStatus>Expired in:</ExpiredStatus>
                <Value>{formatTimestamp(deadline * 1000)}</Value>
              </Row>
            ) : (
              <Row>
                <Label>Create Time:</Label>
                <Value>{formatTimestamp(createTimestamp * 1000)}</Value>
              </Row>
            )}

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
            {positionType === PositionType.LONG ? (
              <Row>
                <Label>Ask Price:</Label>
                <Value>
                  {askPrice === "0" ? (
                    "-"
                  ) : (
                    <BlinkingPrice
                      data={askPrice}
                      textSize={mobileVersion ? "12px" : "14px"}
                    />
                  )}
                </Value>
              </Row>
            ) : (
              <Row>
                <Label>Bid Price:</Label>
                <Value>
                  {bidPrice === "0" ? (
                    "-"
                  ) : (
                    <BlinkingPrice
                      data={bidPrice}
                      textSize={mobileVersion ? "12px" : "14px"}
                    />
                  )}
                </Value>
              </Row>
            )}

            <Row>
              <Label>Locked Amount:</Label>
              {expired ? (
                <ExpiredStatus>{`${formatAmount(lockedAmount, 6, true)} ${
                  collateralCurrency?.symbol
                }`}</ExpiredStatus>
              ) : (
                <Value>{`${formatAmount(lockedAmount, 6, true)} ${
                  collateralCurrency?.symbol
                }`}</Value>
              )}
            </Row>
          </DataWrap>

          <ContentWrapper>
            <Row>
              <Label>Order Type:</Label>
              <Value>{orderType}</Value>
            </Row>
            <Row>
              <Label>Platform Fee:</Label>
              <Value>{`${formatAmount(
                toBN(platformFee).div(2),
                3,
                true
              )} (OPEN) / ${formatAmount(
                toBN(platformFee).div(2),
                3,
                true
              )} (CLOSE) ${collateralCurrency?.symbol}`}</Value>
            </Row>
          </ContentWrapper>
        </Wrapper>
      )}
    </>
  );
}
