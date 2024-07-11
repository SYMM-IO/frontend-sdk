import {
  sendTransaction,
  waitForTransactionReceipt,
  Config,
  estimateGas,
} from "@wagmi/core";
import { UserRejectedRequestError, parseEther } from "viem";
import { ContractFunctionRevertedError, BaseError } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

import { useTransactionAdder } from "../state/transactions/hooks";
import { TransactionInfo } from "../state/transactions/types";
import { ConstructCallReturnType } from "../types/web3";
import { toBN } from "./numbers";
import { WEB_SETTING } from "../config";
import { useExpertMode } from "../state/user/hooks";

export function calculateGasMargin(value: bigint): bigint {
  return BigInt(toBN(value.toString()).times(12_000).div(10_000).toFixed(0));
}

export enum TransactionCallbackState {
  INVALID = "INVALID",
  PENDING = "PENDING",
  VALID = "VALID",
}

export async function createTransactionCallback(
  functionName: string,
  constructCall: () => ConstructCallReturnType,
  addTransaction: ReturnType<typeof useTransactionAdder>,
  addRecentTransaction: ReturnType<typeof useAddRecentTransaction>,
  txInfo: TransactionInfo,
  wagmiConfig: Config,
  summary?: string,
  expertMode?: ReturnType<typeof useExpertMode>
) {
  let call: any;
  try {
    if (WEB_SETTING.notAllowedMethods.includes(functionName)) {
      throw new Error(`${functionName} not allowed`);
    }

    call = await constructCall();
    const gas: bigint = await estimateGas(wagmiConfig, call.config);

    let hash = await sendTransaction(wagmiConfig, {
      ...call.config,
      gas: calculateGasMargin(gas),
    });
    await waitForTransactionReceipt(wagmiConfig, {
      hash,
      onReplaced: (replace) => {
        hash = replace.transaction.hash;
      },
    });
    addTransaction(hash, txInfo, summary);
    addRecentTransaction({
      hash,
      description: summary || "-------",
    });
    return hash;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error", { error });

      if (expertMode && error) {
        console.log(
          "Proceeding with transaction despite the error due to expert mode"
        );

        const config = call.config;
        const tx = !config.value
          ? { from: config.account, to: config.to, data: config.data }
          : {
              from: config.account,
              to: config.to,
              data: config.data,
              value: parseEther(config.value),
            };
        const hash = await sendTransaction(wagmiConfig, tx);
        addTransaction(hash, txInfo, summary);
        addRecentTransaction({
          hash,
          description: summary || "-------",
        });
        return hash;
      }

      if (error instanceof BaseError) {
        if (error instanceof UserRejectedRequestError) {
          // TODO: error.cause
          console.log("UserRejectedRequestError", { error });
          // TODO: handle error in client
        } else if (error instanceof ContractFunctionRevertedError) {
          // TODO: error.cause
          console.log("ContractFunctionRevertedError", { error });
          // TODO: handle error in client
        } else {
          console.log("Error Else", { error });
          // TODO: handle error in client
        }
      } else {
        console.error("constructCall error :", error.message);
      }
    } else {
      console.error("Unexpected error. Could not construct calldata. ", error);
    }
  }
}
