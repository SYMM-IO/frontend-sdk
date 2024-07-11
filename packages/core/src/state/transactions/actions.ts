import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createAction } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import {
  SerializableTransactionReceipt,
  TransactionDetails,
  TransactionInfo,
} from "./types";

export const addTransaction = createAction<{
  chainId: number;
  from: string;
  hash: string;
  info: TransactionInfo;
  summary?: string;
}>("transactions/addTransaction");
export const clearAllTransactions = createAction<{ chainId: number }>(
  "transactions/clearAllTransactions"
);
export const finalizeTransaction = createAction<{
  chainId: number;
  hash: string;
  receipt: SerializableTransactionReceipt;
}>("transactions/finalizeTransaction");
export const checkedTransaction = createAction<{
  chainId: number;
  hash: string;
  blockNumber: number;
}>("transactions/checkedTransaction");

export const updateTransaction = createAction<
  TransactionDetails & { chainId: number }
>("transactions/updateTransaction");
