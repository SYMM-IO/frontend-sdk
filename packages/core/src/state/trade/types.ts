import { OrderType, PositionType, InputField } from "../../types/trade";

export interface TradeState {
  marketId: number | undefined;
  inputField: InputField;
  orderType: OrderType;
  positionType: PositionType;
  limitPrice: string;
  typedValue: string;
  cva: string | undefined;
  partyAmm: string | undefined;
  partyBmm: string | undefined;
  lf: string | undefined;
  tpSlOpened: boolean;
  tpSl: TpSlState;
  tpSlError: TpSlError;
  tpSlDelegateChecker: boolean;
  tpSlConfig: TpSlConfigParams;
}
export interface TpSlError {
  tpError: string;
  slError: string;
}

export interface TpSlConfigParams {
  state: TpSlConfigState;
  MaxRequestTimeDeltaSeconds: number;
  MinPriceDistancePercent: number;
  MinProfitStopLossSpreadPercent: number;
  MaxActiveOrdersPerUser: number;
}
export enum TpSlConfigState {
  VALID = "Valid",
  LOADING = "Loading",
  NOT_VALID = "NotValid",
}

export interface TpSlState {
  tp: string;
  sl: string;
  state: TpSlProcessState;
  quoteId: number;
  lastTimeUpdated: number;
  tpSlippage: number;
  slSlippage: number;
}

export enum TpSlProcessState {
  INITIALIZE = "Initialize",
  WAIT_FOR_QUOTE_RECEIVE = "WaitForQuoteReceive",
  WAIT_FOR_SEND_TP_SL_REQUEST = "sendTpSlRequest",
  TP_SL_REQUEST_SENDED = "tpSlRequestSended",
}
export interface TpSlUpdateProcessState {
  state: TpSlProcessState;
  lastTimeUpdated: number;
}
export interface GetLockedParamUrlResponse {
  cva: string;
  partyAmm: string;
  partyBmm: string;
  lf: string;
}
