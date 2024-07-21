import React, { useCallback, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import Image from "next/image";
import ConnectWallet from "components/ConnectWallet";
import { Modal, ModalHeader } from "components/Modal";
import Column from "components/Column";
import InfoItem from "components/InfoItem";
import { Row, RowBetween, RowEnd } from "components/Row";
import useCurrencyLogo from "lib/hooks/useCurrencyLogo";
import { LongArrow, ShortArrow } from "components/Icons";

import { NumericalInput } from "components/Input";
import { useSetTpSlDataCallback } from "@symmio/frontend-sdk/state/quotes/hooks";

import { toast } from "react-hot-toast";
import { OrderType, PositionType } from "@symmio/frontend-sdk/types/trade";
import { formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { Quote } from "@symmio/frontend-sdk/types/quote";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  DEFAULT_PRECISION,
  DEFAULT_SLIPPAGE,
} from "@symmio/frontend-sdk/constants";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { useQuoteLeverage } from "@symmio/frontend-sdk/hooks/useQuotes";
import {
  useHedgerInfo,
  useMarketData,
} from "@symmio/frontend-sdk/state/hedger/hooks";
import { useSignMessage } from "@symmio/frontend-sdk/callbacks/useMultiAccount";
import { useTpSlConfigParams } from "@symmio/frontend-sdk/state/trade/hooks";
import { makeHttpRequestV2 } from "@symmio/frontend-sdk/utils/http";
import { getTargetPnl } from "utils/pnl";
import { checkTpSlCriteria } from "utils/tpSl";
import {
  TpSlDataState,
  TpSlDataStateParam,
} from "@symmio/frontend-sdk/state/quotes/types";
import { PrimaryButton } from "components/Button";
import { InfoStatementComponent } from "components/InfoItem/InfoStatement";
import { useAppName } from "@symmio/frontend-sdk/state/chains";

const Wrapper = styled(Column)<{
  tpCancelButton: boolean;
  slCancelButton: boolean;
}>`
  padding: 0px 12px 20px 12px;

  & > * {
    &:nth-child(2) {
      margin-top: 8px;
    }
    &:nth-child(3) {
      margin-top: 8px;
    }
    &:nth-child(4) {
      margin-top: 18px;
    }
    &:nth-child(6) {
      margin-top: 18px;
    }
    &:nth-child(7) {
      margin-top: 18px;
    }
    &:nth-child(11) {
      margin-top: 8px;
    }
    &:nth-child(12) {
      margin-top: 8px;
      margin-bottom: 12px;
    }
  }
  & .CustomInputTP {
    width: 100%;
    height: 40px;
  }
  & .CustomInputSL {
    width: 100%;
    height: 40px;
  }
  & .CustomInputTP::placeholder,
  .CustomInputSL::placeholder {
    color: ${({ theme }) => theme.text2};
  }
  & .CancelButtonTP_TP {
    width: 90px;
    padding: 8px 0px 8px 0px;
    font-size: 13px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const BreakLine = styled.div`
  border: 0.5px solid rgba(141, 144, 181, 0.5);
  width: 80%;
  margin: 30px auto;
`;
const SymbolRow = styled(RowBetween)`
  color: ${({ theme }) => theme.text1};
  padding: 0 3px;
  font-size: 14px;
`;
const SymbolText = styled(Row)`
  width: unset;
  color: ${({ theme }) => theme.white};
  gap: 4px;
`;

const LeverageText = styled(Row)<{ long?: boolean }>`
  width: unset;
  color: ${({ theme, long }) => (long ? theme.text1 : theme.red1)};
`;

const CustomModal = styled(Modal)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
max-height: 85%;
width: 90%;
overflow: scroll;
`};
`;
const ErrorTpSlText = styled.div`
  color: ${({ theme }) => theme.red2};
  font-size: 10px;
`;
const TriggerPriceWrapper = styled.div`
  width: 90%;
  background-color: ${({ theme }) => theme.bg4};
  padding: 0px 8px;
  border-radius: 6px;
  margin-top: 8px;
`;

const CancelButton = styled.div`
  width: 90px;
  padding: 6px 2px;
  color: ${({ theme }) => theme.white};
  background: ${({ theme }) => theme.text4};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  margin-top: 8px;
`;
export interface ConditionalOrderObject {
  quantity: string;
  price: string;
  conditional_price: string;
  order_type: number;
  conditional_order_type: string;
}

export interface TP_SLRequestBody {
  quote_id: number;
  conditional_orders: ConditionalOrderObject[];
  time_stamp: number;
  transaction_signature: { signature?: string };
}

interface ConditionalOrder {
  quantity: string;
  price: string;
  conditional_price: string;
  order_type: number;
  conditional_order_type: string;
}

export enum GAIN_MODE {
  PERCENT = "PERCENT",
  VALUE = "VALUE",
}

function createDeleteRequestBody(
  conditional_order_type: string,
  quoteId: number
) {
  return {
    quote_id: quoteId,
    conditional_order_type,
    time_stamp: Math.ceil(new Date().getTime() / 1000),
    transaction_signature: {},
  };
}

function createRequestBody(
  tp: string,
  sl: string,
  openedPriceTp: string,
  openedPriceSl: string,
  quantity: string,
  order_type: number,
  quoteId: number
): TP_SLRequestBody {
  const conditional_orders: ConditionalOrder[] = [];
  if (tp !== "") {
    conditional_orders.push({
      quantity,
      price: openedPriceTp,
      conditional_price: tp,
      order_type,
      conditional_order_type: "take_profit",
    });
  }
  if (sl !== "") {
    conditional_orders.push({
      quantity,
      price: openedPriceSl,
      conditional_price: sl,
      order_type,
      conditional_order_type: "stop_loss",
    });
  }
  return {
    quote_id: quoteId,
    conditional_orders,
    time_stamp: Math.ceil(new Date().getTime() / 1000),
    transaction_signature: {},
  };
}

async function handleDeleteTpSlRequest(
  body: string,
  appName: string,
  tpslUrl: string
) {
  const { href: tpSlUrl } = new URL(`conditional-order/delete/`, tpslUrl);
  const options = {
    headers: [
      ["App-Name", appName],
      ["Content-Type", "application/json"],
      ["accept", "application/json"],
    ],
    method: "POST",
    body,
  };
  try {
    const { result, status }: { result: any; status: number } =
      await makeHttpRequestV2(tpSlUrl, options);
    if (status !== 200 && result?.error_message) {
      toast.error(`Error on set TP/SL: ${result?.error_message}`);
      return null;
    }
    return result;
  } catch (e) {
    console.log("error", e);
    return null;
  }
}

export async function handleSignManageAndDeleteTpSlRequest(
  conditional_order: string,
  quoteId: number,
  appName: string,
  tpslUrl: string,
  signMessageCallback: ((message: string) => Promise<string>) | null,
  setLoading: (targetState: boolean) => void,
  setFunction: (inputString: string) => void,
  callBackFunction: (state: boolean) => void
) {
  if (conditional_order === "") {
    return;
  }
  if (!signMessageCallback) return;
  const message = createDeleteRequestBody(conditional_order, quoteId);
  try {
    setLoading(true);
    const txHash = await signMessageCallback(JSON.stringify(message));
    message["transaction_signature"] = { signature: txHash };
    const requestResult = await handleDeleteTpSlRequest(
      JSON.stringify(message),
      appName,
      tpslUrl
    );
    const tempMessage =
      conditional_order === "take_profit" ? "Take Profit" : "Stop Loss";

    if (requestResult && requestResult.successful) {
      toast.success(`You successfully deleted the ${tempMessage}`);
      setFunction("");
      callBackFunction(true);
    } else {
      toast.error(`Couldn't Delete the ${tempMessage}`);
      callBackFunction(false);
    }

    setLoading(false);
  } catch (e) {
    setLoading(false);
    callBackFunction(false);
    console.error(e);
  }
}

async function handleSetTpSlRequest(
  body: string,
  AppName: string,
  TpSlUrl: string
) {
  const { href: tpSlUrl } = new URL(`conditional-order/`, TpSlUrl);
  const options = {
    headers: [
      ["App-Name", AppName],
      ["Content-Type", "application/json"],
      ["accept", "application/json"],
    ],
    method: "POST",
    body,
  };
  try {
    const { result, status }: { result: any; status: number } =
      await makeHttpRequestV2(tpSlUrl, options);
    if (status !== 200 && result?.error_message) {
      toast.error(`Error on set TP/SL: ${result?.error_message}`);
      return { result: null, statusCode: status };
    }
    return { result, statusCode: 200 };
  } catch (e) {
    console.log("error", e);
    return { result: null, statusCode: 500 };
  }
}

export function priceSlippageCalculation(
  price: string,
  slippage: number,
  positionType: PositionType,
  precision: number
) {
  return positionType === PositionType.SHORT
    ? toBN(price)
        .times(1 + slippage / 100)
        .toFixed(precision)
    : toBN(price)
        .div(1 + slippage / 100)
        .toFixed(precision);
}

function slippageCalculation(conditionalPrice: number, price: number) {
  const value = Math.abs(((conditionalPrice - price) / price) * 100);
  const roundValue = Math.round(value);
  if (roundValue % 2 === 0) {
    return roundValue;
  } else {
    return Math.abs(value - (roundValue - 1)) <=
      Math.abs(value - (roundValue + 1))
      ? roundValue - 1
      : roundValue + 1;
  }
}

export async function handleSignManageAndTpSlRequest(
  targetTp: string,
  targetSl: string,
  openedPriceTp: string,
  openedPriceSl: string,
  quantity: string,
  orderType: string,
  quoteId: number,
  appName: string,
  tpslUrl: string,
  signMessageCallback: ((message: string) => Promise<string>) | null,
  setLoading: (targetState: boolean) => void,
  callBackFunction: (state: boolean) => void
) {
  if (targetTp === "" && targetSl === "") {
    return;
  }
  if (!signMessageCallback) return;
  const message = createRequestBody(
    targetTp,
    targetSl,
    openedPriceTp,
    openedPriceSl,
    quantity,
    orderType === OrderType.MARKET ? 1 : 0,
    quoteId
  );
  try {
    setLoading(true);
    const txHash = await signMessageCallback(JSON.stringify(message));
    message["transaction_signature"] = { signature: txHash };
    const { result: requestResult } = await handleSetTpSlRequest(
      JSON.stringify(message),
      appName,
      tpslUrl
    );
    if (requestResult && requestResult.successful) {
      const arrayConditionalOrder: ConditionalOrderObject[] =
        message.conditional_orders;
      let tempMessage = "";

      for (const field1 of arrayConditionalOrder) {
        if (tempMessage.length) tempMessage += " and ";
        tempMessage +=
          field1.conditional_order_type === "take_profit"
            ? `Take Profit to ${field1.conditional_price}`
            : `Stop Loss to ${field1.conditional_price}`;
      }
      toast.success(`Successfully set the ${tempMessage}`);
      callBackFunction(true);
    } else {
      callBackFunction(false);
    }

    setLoading(false);
  } catch (e) {
    setLoading(false);
    console.error(e);
    callBackFunction(false);
  }
}

interface ManageTpSlData {
  tp: string;
  sl: string;
  tpOpenPrice: string;
  slOpenPrice: string;
}

export default function ManageTpSlModal({
  modalOpen,
  toggleModal,
  quote,
  pendingQuote,
  tpSlMoreData,
}: {
  modalOpen: boolean;
  toggleModal: () => void;
  quote: Quote;
  pendingQuote?: boolean;
  tpSlMoreData: ManageTpSlData;
}) {
  const { account, chainId } = useActiveWagmi();

  const {
    id: quoteId,
    marketId,
    quantity,
    positionType,
    orderType,
    openedPrice,
    requestedOpenPrice,
  } = quote || {};
  const {
    tp: prevTp,
    sl: prevSl,
    tpOpenPrice: prevTpOpenPrice,
    slOpenPrice: prevSlOpenPrice,
  } = tpSlMoreData;

  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [tpSlippage, setTpSlippage] = useState(DEFAULT_SLIPPAGE);
  const [slSlippage, setSlSlippage] = useState(DEFAULT_SLIPPAGE);
  const {
    name: marketName,
    symbol,
    asset,
    pricePrecision,
    quantityPrecision,
  } = useMarket(marketId) || {};
  const theme = useTheme();
  const leverage = useQuoteLeverage(quote);
  const positionSize = toBN(quantity)
    .div(leverage)
    .toFixed(quantityPrecision ?? DEFAULT_PRECISION);
  const marketData = useMarketData(marketName);
  const targetPrice = pendingQuote
    ? requestedOpenPrice
    : marketData?.markPrice ?? openedPrice;
  const showTargetPrice = pendingQuote ? requestedOpenPrice : openedPrice;

  const tokenLogo = useCurrencyLogo(symbol);
  const { callback: signMessageCallback } = useSignMessage();
  const [awaitingTpSlConfirmation, setAwaitingTpSlConfirmation] =
    useState(false);
  const setTpSlFunc = useSetTpSlDataCallback();
  const tpSlConfig = useTpSlConfigParams();
  const { tpslUrl } = useHedgerInfo() || {};
  const appName = useAppName();

  const [{ tpError, slError }, setTpSlError] = useState({
    tpError: "",
    slError: "",
  });
  const disableLogic =
    (tp === prevTp && sl === prevSl) ||
    awaitingTpSlConfirmation ||
    tpError !== "" ||
    slError !== "";
  useEffect(() => {
    const { pnlPercent: percentOfChanges } = getTargetPnl(
      tp === prevTp ? "" : tp,
      targetPrice,
      positionSize,
      positionType === PositionType.SHORT,
      leverage
    );
    const { error, message } = checkTpSlCriteria(
      parseFloat(percentOfChanges),
      tpSlConfig.MinPriceDistancePercent,
      targetPrice
    );

    if (error) {
      setTpSlError({ tpError: message, slError });
    } else if (tpError) {
      setTpSlError({ tpError: "", slError });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tp]);

  useEffect(() => {
    const { pnlPercent: percentOfChanges } = getTargetPnl(
      sl === prevSl ? "" : sl,
      targetPrice,
      positionSize,
      positionType !== PositionType.SHORT,
      leverage
    );
    const { error, message } = checkTpSlCriteria(
      parseFloat(percentOfChanges),
      tpSlConfig.MinPriceDistancePercent,
      targetPrice
    );

    if (error) {
      setTpSlError({ tpError, slError: message });
    } else if (slError) {
      setTpSlError({ tpError, slError: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sl]);

  useEffect(() => {
    if (prevTp) {
      setTp(prevTp);
      const tempTp = parseFloat(prevTp);
      const tempOpenPriceTp = parseFloat(prevTpOpenPrice);
      const tempSlippage = slippageCalculation(tempTp, tempOpenPriceTp);
      setTpSlippage(tempSlippage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevTp]);

  useEffect(() => {
    if (prevSl) {
      setSl(prevSl);
      const tempSl = parseFloat(prevSl);
      const tempOpenPriceSl = parseFloat(prevSlOpenPrice);
      const tempSlippage = slippageCalculation(tempSl, tempOpenPriceSl);
      setSlSlippage(tempSlippage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevSl]);

  console.log("tpError-SlError", tpError, slError);
  const onClickConfirmButton = useCallback(() => {
    if (disableLogic) {
      return;
    }
    const tempOpenPriceTp =
      tp === prevTp
        ? ""
        : priceSlippageCalculation(
            tp,
            tpSlippage,
            positionType,
            pricePrecision ?? DEFAULT_PRECISION
          );
    const tempOpenPriceSl =
      sl === prevSl
        ? ""
        : priceSlippageCalculation(
            sl,
            slSlippage,
            positionType,
            pricePrecision ?? DEFAULT_PRECISION
          );
    handleSignManageAndTpSlRequest(
      tp === prevTp ? "" : tp,
      sl === prevSl ? "" : sl,
      tempOpenPriceTp,
      tempOpenPriceSl,
      quantity,
      orderType,
      quoteId,
      appName,
      tpslUrl,
      signMessageCallback,
      setAwaitingTpSlConfirmation,
      (resultStatus: boolean) => {
        toggleModal();
        if (resultStatus) {
          const tpFlag: boolean = tp === prevTp;
          const slFlag: boolean = sl === prevSl;
          let targetStateParam = TpSlDataStateParam.CHECK_ANY_TP_SL;
          if (!tpFlag || !slFlag) {
            if (!tpFlag && !slFlag) {
              targetStateParam = TpSlDataStateParam.CHECK_TP_SL;
            } else if (!tpFlag) {
              targetStateParam = TpSlDataStateParam.CHECK_TP;
            } else {
              targetStateParam = TpSlDataStateParam.CHECK_SL;
            }
          }
          setTpSlFunc(
            {
              tp: prevTp,
              sl: prevSl,
              tpSlState: TpSlDataState.FORCE_CHECKING,
              tpSlStateParam: targetStateParam,
              tpOpenPrice: prevTpOpenPrice,
              slOpenPrice: prevSlOpenPrice,
              quoteId,
            },
            quoteId
          );
        }
      }
    );
  }, [
    appName,
    orderType,
    positionType,
    prevSl,
    prevSlOpenPrice,
    prevTp,
    prevTpOpenPrice,
    pricePrecision,
    quantity,
    quoteId,
    setTpSlFunc,
    signMessageCallback,
    sl,
    slSlippage,
    toggleModal,
    tp,
    tpslUrl,
    tpSlippage,
  ]);

  function getActionButtonConfirm(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />;

    return (
      <PrimaryButton onClick={onClickConfirmButton} disabled={disableLogic}>
        {awaitingTpSlConfirmation ? "Awaiting..." : "Confirm"}
      </PrimaryButton>
    );
  }

  function getActionButtonCancel(
    callBackButton: () => void
  ): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />;
    return <CancelButton onClick={callBackButton}>Cancel</CancelButton>;
  }

  return (
    <CustomModal
      isOpen={quote ? modalOpen : false}
      onBackgroundClick={() => toggleModal()}
      onEscapeKeydown={() => toggleModal()}
      width="434px"
    >
      <ModalHeader
        onClose={() => toggleModal()}
        title={"TP/SL for whole position"}
      />
      <Wrapper tpCancelButton={!!prevTp} slCancelButton={!!prevSl}>
        <SymbolRow>
          <div>Symbol:</div>
          <RowEnd>
            <SymbolText>
              <Image src={tokenLogo} width={16} height={16} alt={`icon`} />
              &nbsp;
              {symbol}/{asset}
              &nbsp;
            </SymbolText>
            <LeverageText long={positionType === PositionType.LONG}>
              {leverage}x {positionType[0]}
              {positionType.slice(1, positionType.length).toLowerCase()}
              &nbsp;
              {positionType === PositionType.LONG ? (
                <LongArrow width={15} height={12} color={theme.blue1} />
              ) : (
                <ShortArrow width={15} height={12} color={theme.red1} />
              )}
            </LeverageText>
          </RowEnd>
        </SymbolRow>
        <InfoItem
          label={`Open Price (${asset}):`}
          amount={`${
            showTargetPrice ? formatPrice(showTargetPrice, pricePrecision) : "-"
          }`}
        />
        <InfoItem
          label={`Current Price (${asset}):`}
          amount={`${
            marketData?.markPrice
              ? formatPrice(marketData?.markPrice, pricePrecision)
              : "-"
          } `}
        />
        <InfoItem label="Take Profit Price:" amount={``} />
        <Row gap="10px">
          <TriggerPriceWrapper>
            <NumericalInput
              placeholder=""
              precision={pricePrecision}
              onUserInput={(valueSelected) => {
                setTp(valueSelected);
              }}
              value={tp}
              height={"20px"}
              className="CustomInputTP"
            />
          </TriggerPriceWrapper>
          {prevTp &&
            getActionButtonCancel(() => {
              handleSignManageAndDeleteTpSlRequest(
                "take_profit",
                quoteId,
                appName,
                tpslUrl,
                signMessageCallback,
                setAwaitingTpSlConfirmation,
                setTp,
                (resultStatus) => {
                  if (resultStatus) {
                    setTpSlFunc(
                      {
                        tp: "",
                        sl,
                        tpOpenPrice: "",
                        slOpenPrice: prevSlOpenPrice,
                        tpSlState: TpSlDataState.VALID,
                        quoteId,
                      },
                      quoteId
                    );
                    setTpSlippage(0);
                  }
                }
              );
            })}
        </Row>
        <ErrorTpSlText>{tpError}</ErrorTpSlText>
        <InfoStatementComponent
          firstValue="When the Market Price reaches "
          pointValue={`${tp.length === 0 ? "-" : tp} ${asset}`}
          secondValue=", the entire position will be closed."
        />

        <BreakLine />

        <InfoItem label="Stop Loss Price:" amount={``} />
        <Row gap="10px">
          <TriggerPriceWrapper>
            <NumericalInput
              placeholder=""
              precision={pricePrecision}
              onUserInput={(valueSelected) => {
                setSl(valueSelected);
              }}
              value={sl}
              height={"20px"}
              className="CustomInputSL"
            />
          </TriggerPriceWrapper>
          {prevSl &&
            getActionButtonCancel(() => {
              handleSignManageAndDeleteTpSlRequest(
                "stop_loss",
                quoteId,
                appName,
                tpslUrl,
                signMessageCallback,
                setAwaitingTpSlConfirmation,
                setSl,
                (resultStatus) => {
                  if (resultStatus) {
                    setTpSlFunc(
                      {
                        tp,
                        sl: "",
                        tpOpenPrice: prevTpOpenPrice,
                        slOpenPrice: "",
                        tpSlState: TpSlDataState.VALID,
                        quoteId,
                      },
                      quoteId
                    );
                    setSlSlippage(0);
                  }
                }
              );
            })}
        </Row>
        <ErrorTpSlText>{slError}</ErrorTpSlText>
        <InfoStatementComponent
          firstValue="When the Market Price reaches "
          pointValue={`${sl.length === 0 ? "-" : sl} ${asset}`}
          secondValue=", the entire position will be closed."
        />

        <Row gap="10px">{getActionButtonConfirm()}</Row>
      </Wrapper>
    </CustomModal>
  );
}
