import { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import BigNumber from "bignumber.js";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { PositionType } from "@symmio/frontend-sdk/types/trade";
import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { formatTimestamp } from "@symmio/frontend-sdk/utils/time";
import { titleCase } from "@symmio/frontend-sdk/utils/string";

import {
  useQuoteLeverage,
  useQuoteUpnlAndPnl,
} from "@symmio/frontend-sdk/hooks/useQuotes";
import {
  useHistoryQuotes,
  useQuoteDetail,
  useSetQuoteDetailCallback,
} from "@symmio/frontend-sdk/state/quotes/hooks";
import { useMarketsStatus } from "@symmio/frontend-sdk/state/hedger/hooks";
import { ApiState } from "@symmio/frontend-sdk/types/api";

import { useIsMobile } from "lib/hooks/useWindowSize";
import PositionDetails from "components/App/AccountData/PositionDetails";
import {
  EmptyPosition,
  LongArrow,
  LottieCloverfield,
  NotConnectedWallet,
  Rectangle,
  ShortArrow,
} from "components/Icons";
import { RowBetween, RowStart } from "components/Row";
import {
  BodyWrap,
  Wrapper,
  PositionTypeWrap,
  PnlValue,
  MarketName,
  QuoteStatusValue,
  EmptyRow,
  LeverageWrap,
} from "./Common";

const TableStructure = styled(RowBetween)`
  width: 100%;
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  font-weight: 400;

  & > * {
    width: 12%;

    &:first-child {
      width: 25%;
    }
    &:nth-last-child(2) {
      width: 15%;
      text-align: right;
    }
  }
`;

const HeaderWrap = styled(TableStructure)`
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
  margin-bottom: 12px;

  & > * {
    &:first-child {
      padding-left: 28px;
    }
  }
`;

const QuoteWrap = styled(TableStructure)<{
  canceled?: boolean;
}>`
  height: 40px;
  /* opacity: ${({ canceled }) => (canceled ? 0.5 : 1)}; */
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg1};
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.bg6};
  }

  /* ${({ canceled }) =>
    canceled &&
    `& > * {
      opacity: 0.5;
  }
  `} */

  & > * {
    opacity: ${({ canceled }) => (canceled ? 0.5 : 1)};

    &:last-child {
      opacity: 1;
    }
  }
`;

const Timestamp = styled.div`
  font-weight: 400;
  font-size: 10px;
  color: ${({ theme }) => theme.text1};
`;

const HEADERS = [
  "Symbol-QID",
  "Size",
  "Open Price",
  "Close Price",
  "Status",
  "PNL",
  "End Time",
];

function TableHeader({
  mobileVersion,
}: {
  mobileVersion: boolean;
}): JSX.Element | null {
  if (mobileVersion) return null;
  return (
    <HeaderWrap>
      {HEADERS.map((item, key) => (
        <div key={key}>{item}</div>
      ))}
      <div style={{ width: "16px", height: "100%", paddingTop: "10px" }}></div>
    </HeaderWrap>
  );
}

function TableBody({
  quotes,
  mobileVersion,
}: {
  quotes: Quote[];
  mobileVersion: boolean;
}): JSX.Element | null {
  const { account } = useActiveWagmi();
  const loading = useMarketsStatus();
  const { state: historyState } = useHistoryQuotes();

  return useMemo(
    () => (
      <BodyWrap>
        {!account ? (
          <EmptyRow>
            <NotConnectedWallet style={{ margin: "40px auto 16px auto" }} />
            Wallet is not connected
          </EmptyRow>
        ) : loading === ApiState.LOADING ||
          historyState === ApiState.LOADING ? (
          <EmptyRow style={{ padding: "60px 0px" }}>
            <LottieCloverfield width={72} height={78} />
          </EmptyRow>
        ) : quotes.length ? (
          quotes.map((quote, index) =>
            mobileVersion ? (
              <PositionDetails key={index} quote={quote} />
            ) : (
              <QuoteRow key={index} quote={quote} />
            )
          )
        ) : (
          <EmptyRow>
            <EmptyPosition style={{ margin: "40px auto 16px auto" }} />
            You have no positions!
          </EmptyRow>
        )}
      </BodyWrap>
    ),
    [account, loading, historyState, quotes, mobileVersion]
  );
}

function QuoteRow({ quote }: { quote: Quote }): JSX.Element | null {
  const theme = useTheme();
  const {
    id,
    quantity,
    positionType,
    openedPrice,
    avgClosedPrice,
    statusModifyTimestamp,
    quoteStatus,
    liquidatePrice,
    liquidateAmount,
    closedAmount,
  } = quote;
  const { name } = useMarket(quote.marketId) || {};

  const [, pnl] = useQuoteUpnlAndPnl(quote, 0);
  const [value, color] = useMemo(() => {
    const pnlBN = toBN(pnl);
    if (pnlBN.isGreaterThan(0))
      return [`+ $${formatAmount(pnlBN)}`, theme.green1];
    else if (pnlBN.isLessThan(0))
      return [`- $${formatAmount(Math.abs(pnlBN.toNumber()))}`, theme.red1];
    return [`$${formatAmount(pnlBN)}`, theme.text1];
  }, [pnl, theme]);
  const leverage = useQuoteLeverage(quote);
  const upnlPercent = useMemo(() => {
    return toBN(pnl)
      .div(quantity)
      .div(openedPrice)
      .times(leverage)
      .times(100)
      .toFixed(2);
  }, [leverage, pnl, openedPrice, quantity]);

  const quoteDetail = useQuoteDetail();
  const setQuoteDetail = useSetQuoteDetailCallback();

  const activeDetail = id === quoteDetail?.id;
  const canceledOrExpired =
    quoteStatus === QuoteStatus.CANCELED || quoteStatus === QuoteStatus.EXPIRED;

  const averagePrice = toBN(liquidatePrice)
    .times(liquidateAmount)
    .plus(toBN(avgClosedPrice).times(closedAmount))
    .div(quantity);

  function formatPrice(price: BigNumber.Value) {
    return price === "0" ? "-" : formatAmount(price, 6, true);
  }

  return useMemo(
    () => (
      <>
        <QuoteWrap
          canceled={canceledOrExpired}
          onClick={() => setQuoteDetail(quote)}
        >
          <RowStart>
            <PositionTypeWrap>
              {positionType === PositionType.LONG ? (
                <LongArrow width={16} height={12} color={theme.green1} />
              ) : (
                <ShortArrow width={16} height={12} color={theme.red1} />
              )}
            </PositionTypeWrap>
            <MarketName>
              <div>{name}</div>
              <div>-Q{id}</div>
            </MarketName>
            <LeverageWrap>{leverage}x</LeverageWrap>
          </RowStart>
          <div>{formatAmount(quantity, 6, true)}</div>
          <div>{formatPrice(openedPrice)}</div>
          <div>
            {quoteStatus === QuoteStatus.LIQUIDATED
              ? formatPrice(averagePrice)
              : formatPrice(avgClosedPrice)}
          </div>
          <QuoteStatusValue
            liq={quoteStatus === QuoteStatus.LIQUIDATED}
            expired={quoteStatus === QuoteStatus.EXPIRED}
          >
            {titleCase(quoteStatus)}
          </QuoteStatusValue>
          {canceledOrExpired ? (
            <div>-</div>
          ) : (
            <PnlValue color={color}>{`${value} (${Math.abs(
              Number(upnlPercent)
            )}%)`}</PnlValue>
          )}

          <Timestamp>{formatTimestamp(statusModifyTimestamp * 1000)}</Timestamp>
          <div
            style={{
              width: "12px",
              height: "100%",
              paddingTop: "10px",
              marginLeft: "4px",
            }}
          >
            {activeDetail && <Rectangle />}
          </div>
        </QuoteWrap>
      </>
    ),
    [
      canceledOrExpired,
      positionType,
      theme.green1,
      theme.red1,
      name,
      id,
      leverage,
      quantity,
      openedPrice,
      quoteStatus,
      averagePrice,
      avgClosedPrice,
      color,
      value,
      upnlPercent,
      statusModifyTimestamp,
      activeDetail,
      setQuoteDetail,
      quote,
    ]
  );
}

export default function History({ quotes }: { quotes: Quote[] }) {
  const mobileVersion = useIsMobile();
  return (
    <>
      <Wrapper>
        <TableHeader mobileVersion={mobileVersion} />
        <TableBody quotes={quotes} mobileVersion={mobileVersion} />
      </Wrapper>
    </>
  );
}
