import { CloseQuote, PositionType, TradeState } from "../../types/trade";
import { TransferTab } from "../../types/transfer";

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: string;
}

/**
 * Be careful adding to this enum, always assign a unique value (typescript will not prevent duplicate values).
 * These values is persisted in state and if you change the value it will cause errors
 */
export enum TransactionType {
  APPROVAL = 0,
  MINT,
  TRADE,
  CANCEL,
  ADD_ACCOUNT,
  TRANSFER_COLLATERAL,
  SIGN_MESSAGE,
}

interface BaseTransactionInfo {
  type: TransactionType;
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.APPROVAL;
  tokenAddress: string;
  spender: string;
}
export interface TradeTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.TRADE;
  state: TradeState;
  positionType: PositionType;
  slippage: string | null;
  name: string;
  amount: string;
  price: string;
  hedger: string;
  id?: string;
}

export interface CancelQuoteTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.CANCEL;
  name: string;
  id: string;
  positionType: PositionType;
  closeQuote: CloseQuote;
  hedger: string;
}

export interface AddAccountTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.ADD_ACCOUNT;
  name: string;
}

export interface SignMessageTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.SIGN_MESSAGE;
  text: string;
}

export interface TransferCollateralTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.TRANSFER_COLLATERAL;
  transferType: TransferTab;
  amount: string;
  accountName: string;
  accountAddress: string;
}

export interface MintTransactionInfo extends BaseTransactionInfo {
  type: TransactionType.MINT;
  amount: string;
}

export type TransactionInfo =
  | ApproveTransactionInfo
  | TradeTransactionInfo
  | CancelQuoteTransactionInfo
  | AddAccountTransactionInfo
  | TransferCollateralTransactionInfo
  | MintTransactionInfo
  | SignMessageTransactionInfo;

export interface TransactionDetails {
  hash: string;
  summary?: string;
  receipt?: SerializableTransactionReceipt;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  waitForReceipt?: boolean;
  from: string;
  info: TransactionInfo;
}
