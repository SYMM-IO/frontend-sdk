import BigNumber from "bignumber.js";
import { toBN } from "./numbers";
import { ReadContractsData } from "wagmi/query";

export function getMultipleBN(result: unknown): BigNumber[] {
  if (!Array.isArray(result)) return [];
  return result.map((r: bigint) => toBN(r.toString()));
}

//TODO: fix types
export function getSingleWagmiResult<T>(
  result?:
    | (
        | {
            error: Error;
            result?: undefined;
            status: "failure";
          }
        | {
            error?: undefined;
            result: unknown;
            status: "success";
          }
      )[]
    | undefined
    | ReadContractsData<any, true>,
  index?: number
): T | null {
  return result && result[index || 0]?.status === "success"
    ? (result[index || 0].result as T)
    : null;
}
