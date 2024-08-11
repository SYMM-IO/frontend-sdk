import styled, { useTheme } from "styled-components";
import { lighten } from "polished";
import React, { useEffect, useMemo, useState } from "react";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { OrderType, PositionType } from "@symmio/frontend-sdk/types/trade";
import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import {
  formatAmount,
  formatDollarAmount,
  formatPrice,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";
import { titleCase } from "@symmio/frontend-sdk/utils/string";
import { ApiState } from "@symmio/frontend-sdk/types/api";

import {
  useMarketData,
  useMarketsStatus,
} from "@symmio/frontend-sdk/state/hedger/hooks";
import { useIsMobile } from "lib/hooks/useWindowSize";
import {
  useQuoteDetail,
  useQuoteInstantCloseData,
  useQuotesTpSlData,
  useSetQuoteDetailCallback,
} from "@symmio/frontend-sdk/state/quotes/hooks";
import {
  useQuoteSize,
  useQuoteLeverage,
  useQuoteUpnlAndPnl,
  useQuoteFillAmount,
  useClosingLastMarketPrice,
  useOpeningLastMarketPrice,
  useInstantCloseNotifications,
} from "@symmio/frontend-sdk/hooks/useQuotes";
import { useNotionalValue } from "@symmio/frontend-sdk/hooks/useTradePage";
import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";

import { Row, RowBetween, RowCenter, RowStart } from "components/Row";
import {
  EmptyPosition,
  Loader,
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
  PnlValue,
  LeverageWrap,
  MarketName,
  QuoteStatusValue,
  EmptyRow,
} from "./Common";
import { PositionActionButton } from "components/Button";
import CloseModal, { useInstantClosePosition } from "./CloseModal/index";
import CancelModal from "./CancelModal/index";
import Column from "components/Column";
import PositionDetails from "components/App/AccountData/PositionDetails";
import { useCheckQuoteIsExpired } from "lib/hooks/useCheckQuoteIsExpired";
import { getRemainingTime } from "@symmio/frontend-sdk/utils/time";
import {
  InstantCloseStatus,
  TpSlDataState,
} from "@symmio/frontend-sdk/state/quotes/types";
import ManageTpSlModal from "../TPSL/manage";
import EditPencil from "components/Icons/EditPencil";
import { useTpSlAvailable } from "@symmio/frontend-sdk/state/chains";
import { useForceCooldowns } from "@symmio/frontend-sdk/hooks/usePartyAStats";

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
export const TpWrapper = styled(Row)`
  flex-wrap: wrap;
  gap: 6px;
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

const TwoColumn = styled(Column)`
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  gap: 4px;

  & > * {
    &:first-child {
      color: ${({ theme }) => theme.text0};
    }
    &:nth-child(2) {
      color: ${({ theme }) => theme.text1};
    }
  }
`;

const TwoColumnPnl = styled(Column)<{ color?: string }>`
  gap: 4px;
  font-weight: 500;
  font-size: 10px;
  font-style: normal;
  color: ${({ theme }) => theme.text1};

  & > * {
    &:first-child {
      color: ${({ theme, color }) => color ?? theme.text0};
    }
  }
`;

export const SlIconWrapper = styled.div`
  margin-left: 2px;
  padding: 0px 0px 0px 4px;
  text-align: center;
`;

const ExpiredStatusValue = styled.div`
  color: ${({ theme }) => theme.warning};
`;

const LiquidatedStatusValue = styled.div`
  color: ${({ theme }) => theme.red1};
  font-size: 10px;
`;

const InstantCloseText = styled.div`
  position: absolute;
  width: 100%;
  height: 40px;
  font-size: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
`;

const HEADERS1 = [
  "Symbol-QID",
  "Size",
  "Position Value",
  "Market price",
  "Open Price",
  "Status/uPNL",
  "Actions",
];
const HEADERS2 = [
  "Symbol-QID",
  "Size",
  "Position Value",
  "Market price",
  "Open Price",
  "Status/uPNL",
  "tp/sl",
  "Actions",
];

function TableHeader({
  mobileVersion,
}: {
  mobileVersion: boolean;
}): JSX.Element | null {
  const tpSlAvailable = useTpSlAvailable();

  if (mobileVersion) return null;
  let HEADERS = HEADERS1;
  if (tpSlAvailable) {
    HEADERS = HEADERS2;
  }
  return (
    <HeaderWrap>
      {HEADERS.map((item, key) => {
        return <div key={key}>{item}</div>;
      })}
      <div style={{ width: "16px", height: "100%", paddingTop: "10px" }}></div>
    </HeaderWrap>
  );
}
function TableRow({
  quote,
  index,
  setQuote,
  toggleCloseModal,
  toggleCancelModal,
  mobileVersion,
}: {
  quote: Quote;
  index: number;
  setQuote: (q: Quote) => void;
  toggleCloseModal: () => void;
  toggleCancelModal: () => void;
  mobileVersion: boolean;
}) {
  const theme = useTheme();
  const { id, quoteStatus, statusModifyTimestamp } = quote;
  const activeAccountAddress = useActiveAccountAddress();
  const { liquidationStatus } = useAccountPartyAStat(activeAccountAddress);
  const { forceCancelCloseCooldown, forceCancelCooldown } = useForceCooldowns();
  const { expired, expiredColor } = useCheckQuoteIsExpired(quote);
  const { handleCancelClose } = useInstantClosePosition("0", "0", id);

  const instantCloseData = useQuoteInstantCloseData(id);
  useInstantCloseNotifications(quote);
  const instantCloseStatusInfo = useMemo(() => {
    if (instantCloseData) {
      switch (instantCloseData.status) {
        case InstantCloseStatus.PROCESSING:
        case InstantCloseStatus.STARTED:
          return {
            isInstantClose: true,
            text: "The trade has been closed off-chain and is being written on-chain by PartyB",
          };
        case InstantCloseStatus.FAILED:
          return {
            isInstantClose: true,
            text: "An error occurred in the solver. Please cancel the instant close request.",
          };
        default:
          return { isInstantClose: false, text: "" };
      }
    } else {
      return { isInstantClose: false, text: "" };
    }
  }, [instantCloseData]);

  const [remainingTime, setRemainingTime] = useState(getRemainingTime(0));
  useEffect(() => {
    const cooldown =
      quoteStatus === QuoteStatus.CANCEL_PENDING
        ? forceCancelCooldown
        : forceCancelCloseCooldown;

    const interval = setInterval(() => {
      const updatedTime = getRemainingTime(
        toBN(statusModifyTimestamp).plus(cooldown).times(1000).toNumber()
      );
      setRemainingTime(updatedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    forceCancelCloseCooldown,
    forceCancelCooldown,
    quoteStatus,
    statusModifyTimestamp,
  ]);

  const [buttonText, disableButton] = useMemo(() => {
    if (liquidationStatus) {
      return ["Liquidation...", true];
    } else if (instantCloseStatusInfo.isInstantClose) {
      return ["Cancel Close", false];
    } else if (quoteStatus === QuoteStatus.CLOSE_PENDING) {
      return ["Cancel Close", false];
    } else if (
      quoteStatus === QuoteStatus.PENDING ||
      quoteStatus === QuoteStatus.LOCKED
    ) {
      if (expired) return ["Unlock", false];
      return ["Cancel", false];
    } else if (
      quoteStatus === QuoteStatus.CANCEL_PENDING ||
      quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING
    ) {
      const enabled = remainingTime.diff > 0;

      const text = enabled ? (
        <React.Fragment>
          <RowCenter fontSize={"11px"}>Force Cancel</RowCenter>
          <RowCenter fontSize={"11px"}>
            {`${remainingTime.minutes.toString().padStart(2, "0")}
            :${remainingTime.seconds.toString().padStart(2, "0")}`}
          </RowCenter>
        </React.Fragment>
      ) : (
        "Force Cancel"
      );

      return [text, enabled];
    }

    return ["Close", false];
  }, [
    expired,
    instantCloseStatusInfo.isInstantClose,
    liquidationStatus,
    quoteStatus,
    remainingTime.diff,
    remainingTime.minutes,
    remainingTime.seconds,
  ]);

  function onClickCloseButton(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (disableButton) return;
    else if (instantCloseStatusInfo.isInstantClose) handleCancelClose();
    else if (quoteStatus === QuoteStatus.OPENED) toggleCloseModal();
    else toggleCancelModal();
    setQuote(quote);
  }

  return mobileVersion ? (
    <PositionDetails
      key={index}
      quote={quote}
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
      expired={expired}
      liquidatePending={liquidationStatus}
      customColor={
        instantCloseStatusInfo.isInstantClose ? theme.bg4 : expiredColor
      }
      onClickButton={onClickCloseButton}
      instantCloseStatusInfo={instantCloseStatusInfo}
    />
  );
}

function TableBody({
  quotes,
  setQuote,
  toggleCloseModal,
  toggleCancelModal,
  mobileVersion,
}: {
  quotes: Quote[];
  setQuote: (q: Quote) => void;
  toggleCloseModal: () => void;
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
              toggleCloseModal={toggleCloseModal}
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
    [
      account,
      loading,
      quotes,
      setQuote,
      toggleCancelModal,
      toggleCloseModal,
      mobileVersion,
    ]
  );
}

function QuoteRow({
  quote,
  buttonText,
  disableButton,
  expired,
  customColor,
  liquidatePending,
  onClickButton,
  instantCloseStatusInfo,
}: {
  quote: Quote;
  buttonText: string | JSX.Element;
  disableButton: boolean;
  expired: boolean;
  customColor: string | undefined;
  liquidatePending: boolean;
  instantCloseStatusInfo: { text: string; isInstantClose: boolean };
  onClickButton: (event: React.MouseEvent<HTMLDivElement>) => void;
}): JSX.Element | null {
  const theme = useTheme();
  const {
    id,
    quoteStatus,
    requestedOpenPrice,
    openedPrice,
    requestedCloseLimitPrice,
    quantity,
    closedAmount,
    quantityToClose,
    positionType,
    orderType,
    marketId,
  } = quote;
  const market = useMarket(marketId);
  const { name, pricePrecision } = market || {};
  const marketData = useMarketData(name);
  const leverage = useQuoteLeverage(quote);
  const quoteAvailableAmount = useQuoteSize(quote);
  const notionalValue = useNotionalValue(
    quoteAvailableAmount,
    marketData?.markPrice || 0
  );
  const openLastMarketPrice = useOpeningLastMarketPrice(quote, market);
  const closeLastMarketPrice = useClosingLastMarketPrice(quote, market);
  const [showTpSlModal, setShowTpSlModal] = useState(false);
  const tpSlQuoteData = useQuotesTpSlData();
  const { tpSlState, tp, sl, tpOpenPrice, slOpenPrice } = tpSlQuoteData[id] || {
    tp: "",
    sl: "",
    tpOpenPrice: "",
    slOpenPrice: "",
    tpSlState: TpSlDataState.VALID,
  };
  const [editIconHover, setEditIconHover] = useState(theme.text4);
  const tpSlAvailable = useTpSlAvailable();

  const quoteDetail = useQuoteDetail();
  const setQuoteDetail = useSetQuoteDetailCallback();

  const activeDetail = id === quoteDetail?.id;

  // usage: we should know change of quote for position details
  useEffect(() => {
    if (activeDetail) setQuoteDetail(quote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);
  const pendingQuote =
    !expired &&
    (quoteStatus === QuoteStatus.PENDING ||
      quoteStatus === QuoteStatus.CANCEL_PENDING ||
      quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING ||
      quoteStatus === QuoteStatus.CLOSE_PENDING ||
      quoteStatus === QuoteStatus.LOCKED);

  const fillAmount = useQuoteFillAmount(quote);
  const fillAmountPercent = useMemo(() => {
    if (fillAmount !== null && fillAmount !== undefined) {
      const fillAmountBN = toBN(fillAmount);
      if (fillAmountBN.isEqualTo(0)) {
        return "0% Filled";
      } else if (
        quoteStatus === QuoteStatus.CLOSE_PENDING ||
        quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING
      ) {
        return `${fillAmountBN
          .minus(closedAmount)
          .div(quantityToClose)
          .times(100)
          .toFixed(0)}% Filled`;
      } else {
        return `${fillAmountBN.div(quantity).times(100).toFixed(0)}% Filled`;
      }
    }
    return null;
  }, [closedAmount, fillAmount, quantity, quantityToClose, quoteStatus]);

  const [quoteSize, quoteMarketPrice, quoteOpenPrice] = useMemo(() => {
    if (
      quoteStatus === QuoteStatus.CLOSE_PENDING ||
      quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING
    ) {
      return [
        formatAmount(quoteAvailableAmount, 6, true),
        closeLastMarketPrice,
        `$${formatAmount(openedPrice, 6, true)}`,
      ];
    } else if (
      quoteStatus === QuoteStatus.PENDING ||
      quoteStatus === QuoteStatus.LOCKED ||
      quoteStatus === QuoteStatus.CANCEL_PENDING
    ) {
      return [
        formatAmount(quantity, 6, true),
        openLastMarketPrice,
        orderType === OrderType.LIMIT
          ? `$${formatAmount(requestedOpenPrice, 6, true)}`
          : "Market Price",
      ];
    }
    return [
      formatAmount(quoteAvailableAmount, 6, true),
      formatPrice(marketData?.markPrice ?? "0", pricePrecision),
      `$${formatAmount(openedPrice, 6, true)}`,
    ];
  }, [
    closeLastMarketPrice,
    marketData?.markPrice,
    openLastMarketPrice,
    openedPrice,
    orderType,
    pricePrecision,
    quantity,
    quoteAvailableAmount,
    quoteStatus,
    requestedOpenPrice,
  ]);

  const [upnl] = useQuoteUpnlAndPnl(
    quote,
    marketData?.markPrice ?? "0",
    undefined,
    undefined
  );

  const [value, color] = useMemo(() => {
    const upnlBN = toBN(upnl);
    if (!quoteMarketPrice || quoteMarketPrice === "0")
      return ["-", theme.text0];
    if (upnlBN.isGreaterThan(0))
      return [`+ $${formatAmount(upnlBN)}`, theme.green1];
    else if (upnlBN.isLessThan(0))
      return [`- $${formatAmount(Math.abs(upnlBN.toNumber()))}`, theme.red1];
    return [`$${formatAmount(upnlBN)}`, theme.text1];
  }, [
    quoteMarketPrice,
    theme.text0,
    theme.green1,
    theme.red1,
    theme.text1,
    upnl,
  ]);
  const upnlPercent = useMemo(() => {
    return toBN(upnl)
      .div(quoteAvailableAmount)
      .div(openedPrice)
      .times(leverage)
      .times(100)
      .toFixed(2);
  }, [leverage, upnl, openedPrice, quoteAvailableAmount]);

  return useMemo(
    () => (
      <>
        {" "}
        <QuoteWrap
          canceled={quoteStatus === QuoteStatus.CANCELED}
          onClick={() => setQuoteDetail(quote)}
          active={activeDetail}
          pending={pendingQuote}
          custom={customColor}
          liquidatePending={liquidatePending}
        >
          <RowStart>
            <PositionTypeWrap liquidatePending={liquidatePending}>
              {positionType === PositionType.LONG ? (
                <LongArrow
                  width={15}
                  height={12}
                  color={liquidatePending ? theme.text0 : theme.green1}
                />
              ) : (
                <ShortArrow
                  width={15}
                  height={12}
                  color={liquidatePending ? theme.text0 : theme.red1}
                />
              )}
            </PositionTypeWrap>
            <MarketName>
              <div>{name}</div>
              <div>-Q{id}</div>
            </MarketName>
            <LeverageWrap liquidatePending={liquidatePending}>
              {leverage}x
            </LeverageWrap>
          </RowStart>
          {quoteStatus === QuoteStatus.CLOSE_PENDING ? (
            <TwoColumn>
              <div>{quoteSize}</div>
              <div>{`Close Size: ${formatAmount(
                quantityToClose,
                6,
                true
              )}`}</div>
            </TwoColumn>
          ) : (
            <div>{quoteSize}</div>
          )}

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
          {quoteStatus === QuoteStatus.CLOSE_PENDING ? (
            <TwoColumn>
              <div>{quoteOpenPrice}</div>
              <div>{`Close Price: ${
                orderType === OrderType.LIMIT
                  ? `$${formatAmount(requestedCloseLimitPrice, 6, true)}`
                  : "Market"
              }`}</div>
            </TwoColumn>
          ) : (
            <div>{quoteOpenPrice}</div>
          )}
          {instantCloseStatusInfo.isInstantClose && (
            <InstantCloseText>{instantCloseStatusInfo.text}</InstantCloseText>
          )}
          {fillAmountPercent === null ? (
            liquidatePending ? (
              <LiquidatedStatusValue>Liquidation...</LiquidatedStatusValue>
            ) : quoteStatus === QuoteStatus.OPENED ? (
              <PnlValue color={color}>
                {value === "-"
                  ? value
                  : `${value} (${Math.abs(Number(upnlPercent))})%`}
              </PnlValue>
            ) : expired && quoteStatus === QuoteStatus.PENDING ? (
              <ExpiredStatusValue>Expired</ExpiredStatusValue>
            ) : quoteStatus === QuoteStatus.CLOSE_PENDING ||
              quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING ? (
              <TwoColumnPnl color={expired ? theme.warning : color}>
                <Row>
                  uPNL:
                  <PnlValue color={color}>{` ${value}`}</PnlValue>
                </Row>
                {expired ? (
                  <QuoteStatusValue liq={false} expired={true}>
                    Close EXPIRED
                  </QuoteStatusValue>
                ) : (
                  <QuoteStatusValue liq={false} expired={false}>
                    {titleCase(quoteStatus)}
                  </QuoteStatusValue>
                )}
              </TwoColumnPnl>
            ) : (
              <QuoteStatusValue liq={false} expired={false}>
                {titleCase(quoteStatus)}
              </QuoteStatusValue>
            )
          ) : (
            <TwoColumn>
              <QuoteStatusValue liq={false} expired={false}>
                {titleCase(quoteStatus)}
              </QuoteStatusValue>
              <QuoteStatusValue liq={false} expired={false}>
                {fillAmountPercent}
              </QuoteStatusValue>
            </TwoColumn>
          )}
          {tpSlAvailable && (
            <TpWrapper>
              {tpSlState === TpSlDataState.LOADING ||
              tpSlState === TpSlDataState.FORCE_CHECKING ? (
                <Loader />
              ) : (
                <Row gap="5px">
                  <Row width="unset">
                    <div>{tp} /</div>
                    <div>{sl}</div>
                  </Row>
                  <Row style={{ width: "unset", gap: "5px" }}>
                    <SlIconWrapper
                      onClick={() => {
                        setShowTpSlModal(true);
                      }}
                      onMouseEnter={() => {
                        setEditIconHover(theme.white);
                      }}
                      onMouseLeave={() => {
                        setEditIconHover(theme.text4);
                      }}
                    >
                      <EditPencil
                        width={18}
                        height={18}
                        color={editIconHover}
                      />
                    </SlIconWrapper>
                  </Row>
                </Row>
              )}
            </TpWrapper>
          )}
          <div>
            <PositionActionButton
              expired={expired}
              liquidatePending={liquidatePending}
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
        {showTpSlModal && (
          <ManageTpSlModal
            quote={{ ...quote }}
            tpSlMoreData={{ tp, sl, tpOpenPrice, slOpenPrice }}
            modalOpen={showTpSlModal}
            toggleModal={() => setShowTpSlModal(false)}
          />
        )}
      </>
    ),
    [
      quoteStatus,
      activeDetail,
      pendingQuote,
      customColor,
      liquidatePending,
      positionType,
      theme.text0,
      theme.green1,
      theme.red1,
      theme.warning,
      theme.white,
      theme.text4,
      name,
      id,
      leverage,
      quoteSize,
      quantityToClose,
      notionalValue,
      quoteMarketPrice,
      pricePrecision,
      quoteOpenPrice,
      orderType,
      requestedCloseLimitPrice,
      instantCloseStatusInfo.isInstantClose,
      instantCloseStatusInfo.text,
      fillAmountPercent,
      color,
      value,
      upnlPercent,
      expired,
      tpSlAvailable,
      tpSlState,
      tp,
      sl,
      editIconHover,
      disableButton,
      onClickButton,
      buttonText,
      showTpSlModal,
      quote,
      tpOpenPrice,
      slOpenPrice,
      setQuoteDetail,
    ]
  );
}

export default function Positions({ quotes }: { quotes: Quote[] }) {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isMobile = useIsMobile();
  const [quote, setQuote] = useState<Quote | null>(null);

  return (
    <>
      {showCloseModal && (
        <CloseModal
          quote={quote}
          modalOpen={showCloseModal}
          toggleModal={() => setShowCloseModal(false)}
        />
      )}
      {showCancelModal && (
        <CancelModal
          quote={quote}
          modalOpen={showCancelModal}
          toggleModal={() => setShowCancelModal(false)}
        />
      )}

      <Wrapper>
        <TableHeader mobileVersion={isMobile} />
        <TableBody
          quotes={quotes}
          setQuote={setQuote}
          toggleCloseModal={() => setShowCloseModal(true)}
          toggleCancelModal={() => setShowCancelModal(true)}
          mobileVersion={isMobile}
        />
      </Wrapper>
    </>
  );
}
