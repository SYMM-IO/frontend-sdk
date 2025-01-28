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

export enum TransactionStatus {
  SUCCESS = "Success",
  EXECUTE_IN_DEV_MODE = "Execute In Dev Mode",
  REJECTED_BY_USER = "Rejected By User",
  CONTRACT_FUNCTION_REVERTED_ERROR = "Contract Function Reverted Error",
  CONSTRUCT_CALL_ERROR = "Construct Call Error",
  UNEXPECTED_ERROR = "Unexpected Error",
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
): Promise<{ status: TransactionStatus; message: string }> {
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
    return { status: TransactionStatus.SUCCESS, message: hash };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error", { error });

      if (expertMode && !error.message.includes("User rejected the request")) {
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
        return { status: TransactionStatus.EXECUTE_IN_DEV_MODE, message: hash };
      }

      if (error instanceof BaseError) {
        if (error instanceof UserRejectedRequestError) {
          console.log("UserRejectedRequestError", { error });
          return {
            status: TransactionStatus.REJECTED_BY_USER,
            message: error.details,
          };
        } else if (error instanceof ContractFunctionRevertedError) {
          console.log("ContractFunctionRevertedError", { error });
          return {
            status: TransactionStatus.CONTRACT_FUNCTION_REVERTED_ERROR,
            message: error.details,
          };
        } else {
          console.log("Error Else", { error });
          return {
            status: TransactionStatus.REJECTED_BY_USER,
            message: error.details,
          };
        }
      } else {
        return {
          status: TransactionStatus.CONSTRUCT_CALL_ERROR,
          message: error.message,
        };
      }
    } else {
      console.error("Unexpected error. Could not construct calldata. ", error);
      return {
        status: TransactionStatus.CONSTRUCT_CALL_ERROR,
        message: "Unexpected error. Could not construct calldata.",
      };
    }
  }
}
