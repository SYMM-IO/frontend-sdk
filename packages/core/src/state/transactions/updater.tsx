import React, { useCallback, useMemo } from "react";

import LibUpdater from "../../lib/hooks/transactions/updater";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";

import { useAppDispatch, useAppSelector } from "../declaration";
import { useAddPopup } from "../application/hooks";
import { L2_CHAIN_IDS } from "../../constants/chains";
import {
  DEFAULT_TXN_DISMISS_MS,
  L2_TXN_DISMISS_MS,
} from "../../constants/misc";

import { checkedTransaction, finalizeTransaction } from "./actions";
import { useSetNewNotificationFlag } from "../notifications/hooks";
import { TransactionReceipt } from "viem";

export function TransactionUpdater() {
  const { chainId } = useActiveWagmi();
  const newPopupNotifier = useSetNewNotificationFlag();
  const isL2 = Boolean(chainId && L2_CHAIN_IDS.includes(chainId));

  const transactions = useAppSelector((state) => state.transactions);

  // Show popup on confirm
  const addPopup = useAddPopup();

  const dispatch = useAppDispatch();
  const onCheck = useCallback(
    ({
      chainId,
      hash,
      blockNumber,
    }: {
      chainId: number;
      hash: string;
      blockNumber: number;
    }) => dispatch(checkedTransaction({ chainId, hash, blockNumber })),
    [dispatch]
  );

  const onReceipt = useCallback(
    ({
      chainId,
      hash,
      receipt,
    }: {
      chainId: number;
      hash: string;
      receipt: TransactionReceipt;
    }) => {
      dispatch(
        finalizeTransaction({
          chainId,
          hash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: Number(receipt.blockNumber),
            contractAddress: receipt.contractAddress || "",
            from: receipt.from,
            status: receipt.status,
            to: receipt.to || "",
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
          },
        })
      );
      const transaction = transactions[chainId][hash];
      newPopupNotifier();
      addPopup(
        {
          txn: {
            hash,
            success: receipt.status === "success",
            summary: transaction?.summary,
            info: transaction?.info,
          },
        },
        hash,
        isL2 ? L2_TXN_DISMISS_MS : DEFAULT_TXN_DISMISS_MS
      );
    },
    [addPopup, dispatch, isL2, newPopupNotifier, transactions]
  );

  const pendingTransactions = useMemo(
    () => (chainId ? transactions[chainId] ?? {} : {}),
    [chainId, transactions]
  );

  return (
    <LibUpdater
      pendingTransactions={pendingTransactions}
      onCheck={onCheck}
      onReceipt={onReceipt}
    />
  );
}
