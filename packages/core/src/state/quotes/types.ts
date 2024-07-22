import { ApiState } from "../../types/api";
import { Quote } from "../../types/quote";

export interface QuotesState {
  history: { [chainId: number]: Quote[] };
  pendings: Quote[];
  positions: Quote[];
  listeners: number[];
  quoteDetail: Quote | null;
  historyState: ApiState;
  hasMoreHistory?: boolean;
  instantClosesStates: InstantCloseObject;
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
  deadline: string;
  partyBsWhiteList: string[];
  symbolId: string;
  timeStamp: string;
  marketPrice: string;
  fillAmount: string;
  closedAmount: string;
  averageClosedPrice: string;
  liquidateAmount: string;
  liquidatePrice: string;
  initialData: {
    cva: string;
    lf: string;
    partyAmm: string;
    partyBmm: string;
    timeStamp: string;
  };
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

export interface InstantCloseObject {
  [id: number]: InstantCloseItem;
}

export interface InstantCloseResponse {
  quantity_to_close: number;
  quote_id: number;
  close_price: number;
}

export type InstantCloseResponseType = InstantCloseResponse[];

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
