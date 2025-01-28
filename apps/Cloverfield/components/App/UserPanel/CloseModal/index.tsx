import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import toast from "react-hot-toast";

import { WEB_SETTING } from "@symmio/frontend-sdk/config";
import { Quote } from "@symmio/frontend-sdk/types/quote";
import { makeHttpRequest } from "@symmio/frontend-sdk/utils/http";
import { PriceRange } from "@symmio/frontend-sdk/state/hedger/types";
import {
  ErrorState,
  OrderType,
  PositionType,
} from "@symmio/frontend-sdk/types/trade";
import {
  BN_ZERO,
  formatAmount,
  toBN,
  formatPrice,
  RoundMode,
} from "@symmio/frontend-sdk/utils/numbers";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { calculateString, calculationPattern } from "utils/calculationalString";

import {
  useActiveAccount,
  useBypassPrecisionCheckMode,
} from "@symmio/frontend-sdk/state/user/hooks";
import { useMarketData } from "@symmio/frontend-sdk/state/hedger/hooks";

import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { getAppNameHeader } from "@symmio/frontend-sdk/state/hedger/thunks";

import {
  useClosingLastMarketPrice,
  useQuoteUpnlAndPnl,
  useQuoteLeverage,
  useInstantCloseNotifications,
} from "@symmio/frontend-sdk/hooks/useQuotes";
import useInstantActions from "@symmio/frontend-sdk/hooks/useInstantActions";
import { useHedgerInfo } from "@symmio/frontend-sdk/state/hedger/hooks";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";

import { useClosePosition } from "@symmio/frontend-sdk/callbacks/useClosePosition";
import { useDelegateAccess } from "@symmio/frontend-sdk/callbacks/useDelegateAccess";
import { useAppName } from "@symmio/frontend-sdk/state/chains/hooks";

import ConnectWallet from "components/ConnectWallet";
import { TabModal } from "components/Tab";
import { Modal, ModalHeader } from "components/Modal";
import { CustomInputBox2 } from "components/InputBox";
import { PrimaryButton } from "components/Button";
import { DotFlashing } from "components/Icons";
import MarketClosePanel from "./MarketClose";
import LimitClose from "./LimitClose";
import Column from "components/Column";
import InfoItem, { DataRow, Label } from "components/InfoItem";
import { PnlValue } from "components/App/UserPanel/Common";
import GuidesDropDown from "components/App/UserPanel/CloseModal/GuidesDropdown";
import ErrorButton from "components/Button/ErrorButton";
import {
  DEFAULT_PRECISION,
  MARKET_PRICE_COEFFICIENT,
} from "@symmio/frontend-sdk/constants/misc";
import { useInstantClosesData } from "@symmio/frontend-sdk/state/quotes/hooks";
import { InstantCloseStatus } from "@symmio/frontend-sdk/state/quotes/types";
import { TransactionStatus } from "@symmio/frontend-sdk/utils/web3";

const Wrapper = styled(Column)`
  padding: 12px;
  padding-top: 0;
  & > * {
    &:nth-child(2) {
      margin-top: 16px;
    }
    &:nth-child(3) {
      margin-top: 16px;
    }
    &:nth-child(4) {
      margin-top: 20px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const MainButton = styled(PrimaryButton).attrs({
  height: "48px",
})`
  border-radius: 8px;
  font-weight: 700;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 18px;
  gap: 16px;
`;

interface FetchPriceRangeResponseType {
  max_price: number;
  min_price: number;
}

export default function CloseModal({
  modalOpen,
  toggleModal,
  quote,
}: {
  modalOpen: boolean;
  toggleModal: () => void;
  quote: Quote | null;
}) {
  const theme = useTheme();
  const { chainId } = useActiveWagmi();
  const { CVA, partyAMM, LF, openedPrice, marketId, positionType } =
    quote || {};
  const market = useMarket(marketId);
  const {
    name: marketName,
    symbol,
    quantityPrecision,
    pricePrecision,
    minAcceptableQuoteValue,
  } = market || {};
  const userBypassPrecisionCheckMode = useBypassPrecisionCheckMode();
  const qPrecision = userBypassPrecisionCheckMode
    ? undefined
    : quantityPrecision;
  const availableAmount = useMemo(
    () =>
      quote && quantityPrecision !== null && quantityPrecision !== undefined
        ? toBN(quote.quantity)
            .minus(quote.closedAmount)
            .toFixed(quantityPrecision)
        : "0",
    [quote, quantityPrecision]
  );

  const [size, setSize] = useState(availableAmount);
  const [price, setPrice] = useState("");
  const [activeTab, setActiveTab] = useState(OrderType.MARKET);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [awaitingCloseConfirmation, setAwaitingCloseConfirmation] =
    useState(false);
  const isPendingTxs = useIsHavePendingTransaction();
  const appName = useAppName();

  const { accountAddress: account } = useActiveAccount() || {};

  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const correctOpenPrice = formatPrice(openedPrice ?? "0", pricePrecision);
  const marketData = useMarketData(marketName);
  const { markPrice } = marketData || {};
  const { baseUrl, fetchData } = useHedgerInfo() || {};
  const [calculationMode, setCalculationMode] = useState(false);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const markPriceBN = useMemo(
    () => toBN(markPrice ?? "0").toString(),
    [markPrice]
  );
  const lastMarketPrice = useClosingLastMarketPrice(quote, market);

  const leverage = useQuoteLeverage(quote ?? ({} as Quote));
  const [marketUpnlBN] = useQuoteUpnlAndPnl(
    quote ?? ({} as Quote),
    markPriceBN,
    undefined,
    undefined
  );
  const [, limitPnl] = useQuoteUpnlAndPnl(
    quote || ({} as Quote),
    marketData?.markPrice || 0,
    size,
    price
  );

  useEffect(() => {
    async function fetchPriceRange() {
      try {
        if (fetchData && marketName && baseUrl) {
          const { href: priceRangeUrl } = new URL(
            `price-range/${marketName}`,
            baseUrl
          );
          const tempResponse =
            await makeHttpRequest<FetchPriceRangeResponseType>(
              priceRangeUrl,
              getAppNameHeader(appName)
            );
          if (!tempResponse) return;
          const priceRangeRes = tempResponse;

          const priceRange: PriceRange = {
            name: marketName,
            minPrice: priceRangeRes.min_price,
            maxPrice: priceRangeRes.max_price,
          };
          setPriceRange(priceRange);
          return;
        }
        setPriceRange(null);
      } catch (err) {
        setPriceRange(null);
      }
    }
    fetchPriceRange();
  }, [appName, baseUrl, fetchData, marketName]);

  const { callback: closeCallback, error } = useClosePosition(
    quote,
    activeTab,
    price,
    size
  );

  const quoteLockedMargin = useMemo(() => {
    return CVA && partyAMM && LF
      ? toBN(CVA).plus(partyAMM).plus(LF).toString()
      : BN_ZERO.toString();
  }, [CVA, LF, partyAMM]);

  const outOfRangePrice = useMemo(() => {
    // check limit price range)
    if (!priceRange || !quote) return false;
    const { name, maxPrice, minPrice } = priceRange;
    if (activeTab === OrderType.LIMIT && marketName === name) {
      if (quote.positionType === PositionType.LONG) {
        return toBN(price).isGreaterThan(maxPrice);
      } else {
        return toBN(price).isLessThan(minPrice);
      }
    }
    return false;
  }, [priceRange, marketName, quote, activeTab, price]);

  const balanceTitle = useMemo(() => {
    if (!quote) return;
    if (quote.positionType === PositionType.LONG) {
      return "Bid Price:";
    } else {
      return "Ask Price:";
    }
  }, [quote]);

  const availableToClose = useMemo(() => {
    if (!minAcceptableQuoteValue) return BN_ZERO.toString();

    const amount = toBN(
      formatPrice(
        toBN(quoteLockedMargin)
          .minus(minAcceptableQuoteValue)
          .div(quoteLockedMargin)
          .times(availableAmount),
        quantityPrecision
      )
    );
    return amount.toString();
  }, [
    availableAmount,
    quoteLockedMargin,
    minAcceptableQuoteValue,
    quantityPrecision,
  ]);

  function getPnlData(value: string) {
    if (!quote) return [`$${formatAmount(value)}`, "0", theme.text1];
    const valueBN = toBN(value);
    const valuePercent = valueBN
      .div(availableAmount)
      .div(quote.openedPrice)
      .times(leverage)
      .times(100)
      .toFixed(2);

    if (valueBN.isGreaterThan(0))
      return [`+ $${formatAmount(valueBN)}`, valuePercent, theme.green1];
    else if (valueBN.isLessThan(0))
      return [
        `- $${formatAmount(Math.abs(valueBN.toNumber()))}`,
        valuePercent,
        theme.red1,
      ];
    return [`$${formatAmount(valueBN)}`, "0"];
  }

  const [limitValue, limitValuePercent, limitValueColor] = getPnlData(limitPnl);
  const [marketValue, marketValuePercent, marketValueColor] =
    getPnlData(marketUpnlBN);

  const state = useMemo(() => {
    if (toBN(availableAmount).isLessThan(size)) {
      return ErrorState.INSUFFICIENT_BALANCE;
    }

    if (outOfRangePrice) {
      return ErrorState.OUT_OF_RANGE_PRICE;
    }

    if (
      toBN(availableToClose).minus(size).lt(0) &&
      !toBN(size).isEqualTo(availableAmount)
    ) {
      return ErrorState.REMAINING_AMOUNT_UNDER_10;
    }

    return ErrorState.VALID;
  }, [availableAmount, size, outOfRangePrice, availableToClose]);

  const closeModal = useCallback(() => {
    setSize("");
    setPrice("");
    toggleModal();
  }, [toggleModal]);

  const handleManage = useCallback(async () => {
    if (!closeCallback) {
      toast.error(error);
      return;
    }
    setAwaitingCloseConfirmation(true);
    const { status, message } = await closeCallback();
    if (status !== TransactionStatus.SUCCESS) {
      toast.error(message);
    }
    setAwaitingCloseConfirmation(false);
    closeModal();
  }, [closeCallback, error, closeModal]);

  const autoSlippage = market ? market.autoSlippage : MARKET_PRICE_COEFFICIENT;
  const instantClosePrice =
    positionType === PositionType.SHORT
      ? toBN(markPriceBN)
          .times(autoSlippage)
          .toFixed(pricePrecision ?? DEFAULT_PRECISION, RoundMode.ROUND_DOWN)
      : toBN(markPriceBN)
          .div(autoSlippage)
          .toFixed(pricePrecision ?? DEFAULT_PRECISION, RoundMode.ROUND_DOWN);

  const instantClosesData = useInstantClosesData();
  const { handleInstantClose, text, loading } = useInstantClosePosition(
    size,
    instantClosePrice,
    quote?.id,
    closeModal
  );
  const instantCloseEnabled =
    quote &&
    instantClosesData[quote.id] &&
    instantClosesData[quote.id].status === InstantCloseStatus.STARTED
      ? false
      : true;

  useInstantCloseNotifications(quote ?? ({} as Quote));

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />;
    else if (isPendingTxs) {
      return (
        <MainButton disabled>
          Transacting <DotFlashing />
        </MainButton>
      );
    } else if (awaitingCloseConfirmation) {
      return (
        <MainButton disabled>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      );
    } else if (state) {
      return (
        <ErrorButton state={state} exclamationMark={true} disabled={true} />
      );
    } else if (calculationLoading) {
      return (
        <MainButton disabled>
          calculating
          <DotFlashing />
        </MainButton>
      );
    } else if (calculationMode) {
      return <MainButton onClick={onEnterPress}>calculate Amount</MainButton>;
    }

    return (
      <React.Fragment>
        <MainButton
          height={"48px"}
          onClick={handleManage}
          disabled={!instantCloseEnabled}
        >
          Close Position
        </MainButton>
        {activeTab === OrderType.MARKET && (
          <React.Fragment>
            <MainButton
              height={"48px"}
              marginTop={"10px"}
              onClick={handleInstantClose}
              disabled={!instantCloseEnabled}
            >
              {text}
              {(loading || !instantCloseEnabled) && <DotFlashing />}
            </MainButton>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  function onEnterPress() {
    setCalculationLoading(true);
    setCalculationMode(false);
    const tempPrice = price ? price : lastMarketPrice;
    const result = calculateString(
      size,
      availableAmount,
      quantityPrecision,
      tempPrice
    );
    setPrice(tempPrice);
    setSize(result);
    setCalculationLoading(false);
  }

  function onChangeAmount(value: string) {
    if (calculationPattern.test(value)) {
      setCalculationMode(true);
    } else if (calculationMode) {
      setCalculationMode(false);
    }
    setSize(value);
  }

  return (
    <Modal
      isOpen={quote ? modalOpen : false}
      onBackgroundClick={closeModal}
      onEscapeKeydown={closeModal}
    >
      <ModalHeader
        onClose={closeModal}
        title={"Close " + marketName + "-Q" + quote?.id}
        positionType={positionType}
      />
      <Wrapper>
        <TabModal
          tabOptions={Object.values(OrderType)}
          activeOption={activeTab}
          onChange={(tab: string) => setActiveTab(tab as OrderType)}
        />

        {activeTab === OrderType.LIMIT ? (
          <>
            <LimitClose
              symbol={collateralCurrency?.symbol}
              quote={quote}
              price={price}
              setPrice={setPrice}
              balanceTitle={balanceTitle}
              marketPrice={lastMarketPrice}
            />
            <CustomInputBox2
              title={"Amount"}
              symbol={symbol}
              precision={qPrecision}
              placeholder="0"
              balanceTitle={"Balance:"}
              balanceDisplay={formatAmount(availableAmount)}
              balanceExact={availableAmount}
              value={size}
              calculationEnabled={WEB_SETTING.calculationalInput}
              calculationMode={calculationMode}
              calculationLoading={calculationLoading}
              onChange={onChangeAmount}
              onEnterPress={onEnterPress}
            />
          </>
        ) : (
          <>
            <MarketClosePanel
              price={lastMarketPrice}
              symbol={collateralCurrency?.symbol}
            />
            <CustomInputBox2
              title={"Amount"}
              symbol={symbol}
              precision={qPrecision}
              placeholder="0"
              balanceTitle={"Balance:"}
              balanceDisplay={formatAmount(availableAmount)}
              balanceExact={availableAmount}
              value={size}
              calculationEnabled={WEB_SETTING.calculationalInput}
              calculationMode={calculationMode}
              calculationLoading={calculationLoading}
              onChange={onChangeAmount}
              onEnterPress={onEnterPress}
            />
          </>
        )}
        <GuidesDropDown
          symbol={symbol}
          setSize={setSize}
          setActiveTab={setActiveTab}
          notionalValue={formatPrice(
            toBN(markPriceBN).times(availableAmount),
            pricePrecision
          )}
          availableAmount={availableAmount}
          availableToClose={availableToClose}
        />

        <InfoWrapper>
          <DataRow>
            <Label>Estimated PNL:</Label>
            {activeTab === OrderType.MARKET ? (
              marketData ? (
                <PnlValue
                  color={marketValueColor}
                  style={{ fontSize: "12px" }}
                >{`${marketValue} (${Math.abs(
                  Number(marketValuePercent)
                )}%)`}</PnlValue>
              ) : (
                "-"
              )
            ) : toBN(limitPnl).isNaN() ? (
              "-"
            ) : (
              <PnlValue
                color={limitValueColor}
                style={{ fontSize: "12px" }}
              >{`${limitValue} (${Math.abs(
                Number(limitValuePercent)
              )}%)`}</PnlValue>
            )}
          </DataRow>
          <InfoItem
            label={"Open Price:"}
            amount={`$${toBN(correctOpenPrice).toFormat()}`}
          />
        </InfoWrapper>

        {getActionButton()}

        {/* <div>* This position cannot be market closed as it may result in direct account liquidation.</div> */}
      </Wrapper>
    </Modal>
  );
}

export function useInstantClosePosition(
  size: string,
  price: string | undefined,
  id: number | undefined,
  closeModal?: () => void
) {
  const { instantClose, isAccessDelegated, cancelInstantAction } =
    useInstantActions();
  const { callback: delegateAccessCallback, error } = useDelegateAccess();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAccessDelegated) setText("Instant Close");
    else setText("Delegate Access");
  }, [isAccessDelegated]);

  const handleInstantClose = useCallback(async () => {
    if (!isAccessDelegated && delegateAccessCallback) {
      setLoading(true);
      setText("Delegating ...");
      const { status, message } = await delegateAccessCallback();
      if (status !== TransactionStatus.SUCCESS) {
        setText("Delegate Access");
        toast.error(message);
      }
      setLoading(false);
    }

    if (!instantClose) {
      toast.error(error);
      return;
    }

    if (!id || !price) {
      toast.error("missing props");
      return;
    }

    try {
      setLoading(true);
      await instantClose(id, price, size);
      setLoading(false);
      closeModal && closeModal();
      toast.success("close sent to hedger");
    } catch (e) {
      setLoading(false);
      toast.error(e.message);
      console.error(e);
    }
  }, [
    instantClose,
    id,
    price,
    isAccessDelegated,
    delegateAccessCallback,
    error,
    size,
    closeModal,
  ]);

  const handleCancelClose = useCallback(async () => {
    if (!cancelInstantAction) {
      toast.error(error);
      return;
    }
    if (!id) {
      toast.error("missing quote id");
      return;
    }
    try {
      await cancelInstantAction(id);
    } catch (e) {
      setLoading(false);
      toast.error(e.message);
      console.error(e);
    }
  }, [cancelInstantAction, error, id]);

  return {
    handleInstantClose,
    handleCancelClose,
    text,
    loading,
  };
}
