import { OrderType } from "../../types/trade";
import { TransferTab } from "../../types/transfer";

export enum LastSeenAction {
  SEND_QUOTE = "SendQuote",
  FAILED_TO_PUT_ON_BINANCE = "FailedToPutOnBinance",
  REQUEST_TO_CANCEL_QUOTE = "RequestToCancelQuote",
  REQUEST_TO_CLOSE_POSITION = "RequestToClosePosition",
  UNLOCK_QUOTE = "UnlockQuote",
  REQUEST_TO_CANCEL_CLOSE_REQUEST = "RequestToCancelCloseRequest",
  LIQUIDATE_POSITION = "LiquidatePosition",
  FILL_LIMIT_ORDER_OPEN = "FillLimitOrderOpen",
  FILL_LIMIT_ORDER_CLOSE = "FillLimitOrderClose",
  INSTANT_REQUEST_TO_CLOSE_POSITION = "InstantRequestToClosePosition",
  FILL_ORDER_INSTANT_CLOSE = "FillOrderInstantClose",
  INSTANT_RFQ = "InstantRFQ",
  SEND_QUOTE_TRANSACTION = "SendQuoteTransaction",
}

export const NotificationMessages: { [status: string]: string } = {
  [LastSeenAction.SEND_QUOTE]: "Open Order",
  [LastSeenAction.FAILED_TO_PUT_ON_BINANCE]: "Failed To Put On Binance",
  [LastSeenAction.REQUEST_TO_CANCEL_QUOTE]: "Cancel Open Order",
  [LastSeenAction.REQUEST_TO_CLOSE_POSITION]: "Close Position",
  [LastSeenAction.UNLOCK_QUOTE]: "Unlock Quote",
  [LastSeenAction.REQUEST_TO_CANCEL_CLOSE_REQUEST]: "Cancel Close Position",
  [LastSeenAction.LIQUIDATE_POSITION]: "Liquidate Position",
  [LastSeenAction.FILL_LIMIT_ORDER_OPEN]: "Fill Limit Order Open",
  [LastSeenAction.FILL_LIMIT_ORDER_CLOSE]: "Fill Limit Order Close",
  [LastSeenAction.INSTANT_REQUEST_TO_CLOSE_POSITION]: "Instant Close",
  [LastSeenAction.FILL_ORDER_INSTANT_CLOSE]: "Fill Instant Order Close",
  [LastSeenAction.INSTANT_RFQ]: "Instant Open",
  [LastSeenAction.SEND_QUOTE_TRANSACTION]: "Send Quote Transaction",
};

export enum FailureType {
  SOLVENCY_PROBLEM = "Solvency Problem",
  CONDITION_MISMATCH = "condition_missmatch",
  SYSTEM_UNABLE_TO_HANDEL_EXCEPTION = "system Unable to handel exception",
}

export enum ActionStatus {
  FAILED = "failed",
  SUCCESS = "success",
  SEEN = "seen",
}

export enum StateType {
  REPORT = "report",
  ALERT = "alert",
}

export enum NotificationType {
  PARTIAL_FILL = "Partial Fill",
  LIQUIDATION_ALERT = "Liquidation Alert",
  TRANSFER_COLLATERAL = "Transfer Collateral",
  MINT_COLLATERAL = "Mint Collateral",
  SEEN_BY_HEDGER = "Seen by hedger",
  SUCCESS = "Success",
  HEDGER_ERROR = "Hedger Error",
  EXPIRED_ORDER = "Expired Order",
  TRADE = "Trade",
  CANCEL = "Cancel",
  OTHER = "Other",
}

export interface NotificationDetails {
  id: string;
  quoteId: string | null;
  stateType: string | null;
  createTime: string;
  modifyTime: string;
  counterpartyAddress: string | null;
  notificationType: NotificationType | null;
  showInModal: boolean; // this for show notification in modal or not
  version?: string;
  filledAmountOpen: string | null;
  filledAmountClose: string | null;
  lastSeenAction: string | null;
  actionStatus: string | null;
  failureType: string | null;
  failureMessage: string | null;
  errorCode: number | null;
  transferAmount?: string;
  tempQuoteId?: number;
  orderType?: OrderType;
  transferType?: TransferTab;
}

export interface NotificationResponse {
  id: string;
  quote_id: number;
  create_time: number;
  modify_time: number;
  counterparty_address: string;
  filled_amount_open: string | null;
  filled_amount_close: string | null;
  last_seen_action: string | null;
  action_status: string | null;
  failure_type: string | null;
  failure_message: string | null;
  error_code: number | null;
  state_type: string | null;
  version?: number;
  temp_quote_id?: number;
  order_type?: number;
}

export interface NotificationUrlResponseType {
  position_state: NotificationResponse[];
}
