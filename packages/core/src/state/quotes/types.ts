import { ApiState } from "../../types/api";
import { Quote } from "../../types/quote";
import { OrderType, PositionType } from "../../types/trade";

export interface QuotesState {
  history: { [chainId: number]: Quote[] };
  pendings: Quote[];
  positions: Quote[];
  listeners: number[];
  quoteDetail: Quote | null;
  historyState: ApiState;
  hasMoreHistory?: boolean;
  instantClosesStates: InstantCloseObject;
  instantOpensStates: InstantCloseObject;
  openInstantClosesState: ApiState;
  tpSlQuoteData: { [quoteId: number]: TpSlContent };
}

export interface SubGraphData {
  orderTypeOpen: number;
  partyAmm: string;
  partyBmm: string;
  lf: string;
  cva: string;
  partyA: string;
  partyB: string;
  quoteId: string;
  quoteStatus: number;
  symbol: string;
  positionType: number;
  quantity: string;
  orderTypeClose: number;
  openedPrice: string;
  requestedOpenPrice: string;
  closedPrice: string;
  quantityToClose: string;
  closePrice: string;
  openDeadline: string;
  partyBsWhiteList: string[];
  symbolId: string;
  timestamp: string;
  marketPrice: string;
  fillAmount: string;
  closedAmount: string;
  averageClosedPrice: string;
  liquidateAmount: string;
  liquidatePrice: string;
  initialLf: string;
  initialCva: string;
  initialPartyAmm: string;
  initialPartyBmm: string;
}

export enum InstantCloseStatus {
  STARTED,
  PROCESSING,
  FAILED,
  FINISHED,
}

export interface InstantCloseItem {
  amount: string;
  timestamp: number;
  status: InstantCloseStatus;
}

export interface InstantOpenItem {
  positionType: PositionType;
  orderType: OrderType;
  id: number;
  marketId: number;
  requestedOpenPrice: string;
  quantity: string;
  partyAAddress: string;
  CVA: string;
  LF: string;
  partyAMM: string;
  partyBMM: string;
  createTimestamp: number;
  statusModifyTimestamp: number;
  version: number;
}

export interface InstantCloseObject {
  [id: number]: InstantCloseItem;
}
export interface InstantOpenObject {
  [id: number]: InstantOpenItem;
}

export interface InstantCloseResponse {
  quantity_to_close: number;
  quote_id: number;
  close_price: number;
  status: InstantCloseStatus;
}

export interface InstantOpenResponse {
  position_type: number;
  order_type: number;
  temp_quote_id: number;
  symbol_id: number;
  requested_open_price: number;
  quantity: number;
  party_a_address: string;
  cva: number;
  partyAmm: number;
  partyBmm: number;
  lf: number;
  id: string;
  create_time: number;
  modify_time: number;
  version: number;
}

export type InstantCloseResponseType = InstantCloseResponse[];
export type InstantOpenResponseType = InstantOpenResponse[];

export enum TpSlDataState {
  VALID = "Valid",
  LOADING = "Loading",
  FORCE_CHECKING = "ForceChecking",
  NOT_FOUND = "NotFount",
  NEED_ACCEPT = "NeedAccept",
}

export enum TpSlDataStateParam {
  CHECK_TP = "CheckTp",
  CHECK_SL = "CheckSl",
  CHECK_TP_SL = "CheckTpSl",
  CHECK_ANY_TP_SL = "CheckAnyTpSl",
  NONE = "None",
}

export interface TpSlContent {
  tp: string;
  sl: string;
  tpOpenPrice: string;
  slOpenPrice: string;
  tpSlState: TpSlDataState;
  tpSlStateParam?: TpSlDataStateParam;
  quoteId: number;
}

export interface TpSlEditContent {
  tp: string;
  sl: string;
  tpSlState: TpSlDataState;
}
