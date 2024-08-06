import styled, { useTheme } from "styled-components";
import { lighten } from "polished";
import React, { useMemo, useState } from "react";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { OrderType, PositionType } from "@symmio/frontend-sdk/types/trade";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import {
  formatAmount,
  formatDollarAmount,
  formatPrice,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";
import { ApiState } from "@symmio/frontend-sdk/types/api";

import {
  useMarketData,
  useMarketsStatus,
} from "@symmio/frontend-sdk/state/hedger/hooks";
import { useIsMobile } from "lib/hooks/useWindowSize";
import {
  useQuoteDetail,
  useSetQuoteDetailCallback,
} from "@symmio/frontend-sdk/state/quotes/hooks";
import {
  useOpeningLastMarketPrice,
  useQuoteLeverage,
} from "@symmio/frontend-sdk/hooks/useQuotes";
import { useNotionalValue } from "@symmio/frontend-sdk/hooks/useTradePage";

import { RowBetween, RowStart } from "components/Row";
import {
  EmptyPosition,
  LongArrow,
  LottieCloverfield,
  NotConnectedWallet,
  Rectangle,
  ShortArrow,
} from "components/Icons";
import {
  BodyWrap,
  Wrapper,
  PositionTypeWrap,
  LeverageWrap,
  MarketName,
  EmptyRow,
} from "./Common";
import { PositionActionButton } from "components/Button";
import CancelModal from "./CancelModal/index";
import PositionDetails from "components/App/AccountData/PositionDetails";
import { InstantOpenItem } from "@symmio/frontend-sdk/state/quotes/types";
import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";

const TableStructure = styled(RowBetween)<{ active?: boolean }>`
  width: 100%;
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  font-weight: 400;

  & > * {
    width: 10%;
    &:first-child {
      width: 20%;
    }
  }
`;

const HeaderWrap = styled(TableStructure)`
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
  margin-bottom: 12px;

  & > * {
    &:first-child {
      padding-left: 25px;
    }
  }
`;

const QuoteWrap = styled(TableStructure)<{
  canceled?: boolean;
  pending?: boolean;
  custom?: string;
  liquidatePending?: boolean;
}>`
  @keyframes blinking {
    from {
      background: #242836;
    }

    to {
      background: #292c3b;
    }
  }
  height: 40px;
  opacity: ${({ canceled }) => (canceled ? 0.5 : 1)};
  color: ${({ theme, liquidatePending }) =>
    liquidatePending ? theme.red1 : theme.text0};
  background: ${({ theme, custom, liquidatePending }) =>
    liquidatePending ? theme.red5 : custom ? custom : theme.bg2};
  font-weight: 500;
  cursor: pointer;
  animation: ${({ pending, liquidatePending }) =>
    pending && !liquidatePending ? "blinking 1.2s linear infinite" : "none"};

  &:hover {
    animation: none;
    background: ${({ theme, custom }) =>
      custom ? lighten(0.05, custom) : theme.bg6};
  }
`;

const HEADERS1 = [
  "Symbol-QID",
  "Size",
  "Position Value",
  "Market price",
  "Open Price",
  "Actions",
];

function TableHeader({
  mobileVersion,
}: {
  mobileVersion: boolean;
}): JSX.Element | null {
  if (mobileVersion) return null;

  return (
    <HeaderWrap>
      {HEADERS1.map((item, key) => (
        <div key={key}>{item}</div>
      ))}
      <div style={{ width: "16px", height: "100%", paddingTop: "10px" }}></div>
    </HeaderWrap>
  );
}
function TableRow({
  quote,
  index,
  setQuote,
  toggleCancelModal,
  mobileVersion,
}: {
  quote: InstantOpenItem;
  index: number;
  setQuote: (q: InstantOpenItem) => void;
  toggleCancelModal: () => void;
  mobileVersion: boolean;
}) {
  const theme = useTheme();

  const [buttonText, disableButton] = ["Cancel", false];

  function onClickCloseButton(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (disableButton) return;
    else toggleCancelModal();
    setQuote(quote);
  }

  return mobileVersion ? (
    <PositionDetails
      key={index}
      quote={convertInstantOrderToQuote(quote)}
      disableButton={disableButton}
      buttonText={buttonText}
      onClickButton={onClickCloseButton}
    />
  ) : (
    <QuoteRow
      key={index}
      quote={quote}
      disableButton={disableButton}
      buttonText={buttonText}
      customColor={theme.bg4}
      onClickButton={onClickCloseButton}
    />
  );
}

function TableBody({
  quotes,
  setQuote,
  toggleCancelModal,
  mobileVersion,
}: {
  quotes: InstantOpenItem[];
  setQuote: (q: InstantOpenItem) => void;
  toggleCancelModal: () => void;
  mobileVersion: boolean;
}): JSX.Element | null {
  const { account } = useActiveWagmi();
  const loading = useMarketsStatus();

  return useMemo(
    () => (
      <BodyWrap>
        {!account ? (
          <EmptyRow>
            <NotConnectedWallet style={{ margin: "40px auto 16px auto" }} />
            Wallet is not connected
          </EmptyRow>
        ) : loading === ApiState.LOADING ? (
          <EmptyRow style={{ padding: "60px 0px" }}>
            <LottieCloverfield width={72} height={78} />
          </EmptyRow>
        ) : quotes.length ? (
          quotes.map((quote, index) => (
            <TableRow
              key={index}
              quote={quote}
              index={index}
              mobileVersion={mobileVersion}
              setQuote={setQuote}
              toggleCancelModal={toggleCancelModal}
            />
          ))
        ) : (
          <EmptyRow>
            <EmptyPosition style={{ margin: "40px auto 16px auto" }} />
            You have no positions!
          </EmptyRow>
        )}
      </BodyWrap>
    ),
    [account, loading, quotes, setQuote, toggleCancelModal, mobileVersion]
  );
}

function QuoteRow({
  quote,
  buttonText,
  disableButton,
  customColor,
  onClickButton,
}: {
  quote: InstantOpenItem;
  buttonText: string | JSX.Element;
  disableButton: boolean;
  customColor: string | undefined;
  onClickButton: (event: React.MouseEvent<HTMLDivElement>) => void;
}): JSX.Element | null {
  const theme = useTheme();
  const { id, requestedOpenPrice, quantity, positionType, orderType } = quote;
  const market = useMarket(quote.marketId);
  const { name, pricePrecision } = market || {};
  const marketData = useMarketData(name);
  const leverage = useQuoteLeverage(convertInstantOrderToQuote(quote));
  const quoteAvailableAmount = quantity;
  const notionalValue = useNotionalValue(
    quoteAvailableAmount,
    marketData?.markPrice || 0
  );
  const openLastMarketPrice = useOpeningLastMarketPrice(
    convertInstantOrderToQuote(quote),
    market
  );

  const quoteDetail = useQuoteDetail();
  const setQuoteDetail = useSetQuoteDetailCallback();

  const activeDetail = id === quoteDetail?.id;

  const [quoteSize, quoteMarketPrice, quoteOpenPrice] = useMemo(() => {
    return [
      formatAmount(quantity, 6, true),
      openLastMarketPrice,
      orderType === OrderType.LIMIT
        ? `$${formatAmount(requestedOpenPrice, 6, true)}`
        : "Market Price",
    ];
  }, [openLastMarketPrice, orderType, quantity, requestedOpenPrice]);

  return useMemo(
    () => (
      <>
        {" "}
        <QuoteWrap
          canceled={false}
          active={activeDetail}
          custom={customColor}
          onClick={() => setQuoteDetail(convertInstantOrderToQuote(quote))}
        >
          <RowStart>
            <PositionTypeWrap>
              {positionType === PositionType.LONG ? (
                <LongArrow width={15} height={12} color={theme.green1} />
              ) : (
                <ShortArrow width={15} height={12} color={theme.red1} />
              )}
            </PositionTypeWrap>
            <MarketName>
              <div>{name}</div>
              <div>-Q{id}</div>
            </MarketName>
            <LeverageWrap>{leverage}x</LeverageWrap>
          </RowStart>
          <div>{quoteSize}</div>
          <div>
            {toBN(notionalValue).isEqualTo(0)
              ? "-"
              : `${formatDollarAmount(notionalValue)}`}
          </div>
          <div>
            {toBN(quoteMarketPrice).isEqualTo(0)
              ? "-"
              : `$${formatPrice(quoteMarketPrice, pricePrecision, true)}`}
          </div>

          <div>{quoteOpenPrice}</div>

          <div>
            <PositionActionButton
              disabled={disableButton}
              onClick={onClickButton}
            >
              {buttonText}
            </PositionActionButton>
          </div>
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
      activeDetail,
      customColor,
      positionType,
      theme.green1,
      theme.red1,
      name,
      id,
      leverage,
      quoteSize,
      notionalValue,
      quoteMarketPrice,
      pricePrecision,
      quoteOpenPrice,
      disableButton,
      onClickButton,
      buttonText,
      quote,
      setQuoteDetail,
    ]
  );
}

export default function InstantOpenOrders({
  quotes,
}: {
  quotes: InstantOpenItem[];
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isMobile = useIsMobile();
  const [quote, setQuote] = useState<InstantOpenItem | null>(null);

  return (
    <>
      {showCancelModal && (
        <CancelModal
          quote={quote && convertInstantOrderToQuote(quote)}
          modalOpen={showCancelModal}
          toggleModal={() => setShowCancelModal(false)}
        />
      )}

      <Wrapper>
        <TableHeader mobileVersion={isMobile} />
        <TableBody
          quotes={quotes}
          setQuote={setQuote}
          toggleCancelModal={() => setShowCancelModal(true)}
          mobileVersion={isMobile}
        />
      </Wrapper>
    </>
  );
}

function convertInstantOrderToQuote(order: InstantOpenItem) {
  return {
    id: order.id,
    marketId: order.marketId,
    positionType: order.positionType,
    orderType: order.orderType,

    requestedOpenPrice: order.requestedOpenPrice,
    quantity: order.quantity,
    initialCVA: order.CVA,
    initialLF: order.LF,
    initialPartyAMM: order.partyAMM,
    initialPartyBMM: order.partyBMM,

    partyA: order.partyAAddress,
    quoteStatus: QuoteStatus.PENDING,

    createTimestamp: order.createTimestamp,
    statusModifyTimestamp: order.statusModifyTimestamp,
  } as Quote;
}
