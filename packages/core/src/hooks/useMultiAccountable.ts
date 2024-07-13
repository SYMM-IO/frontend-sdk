import { useCallback } from "react";
import { useActiveAccountAddress } from "../state/user/hooks";
import { GLOBAL_MULTI_ACCOUNTABLE_PAUSED } from "../constants/misc";
import { Abi, Address, encodeFunctionData } from "viem";
import { ConstructCallReturnType } from "../types/web3";
import useWagmi from "../lib/hooks/useWagmi";
import { ContractFunctionRevertedError, BaseError } from "viem";
import {
  useDiamondAddress,
  useMultiAccountAddress,
  useWagmiConfig,
} from "../state/chains";
import { simulateContract } from "@wagmi/core";
import { DIAMOND_ABI, MULTI_ACCOUNT_ABI } from "../constants";

export function useMultiAccountable(
  constructCall: () => ConstructCallReturnType,
  disable?: boolean
) {
  const activeAccountAddress = useActiveAccountAddress();
  const { account, chainId } = useWagmi();

  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const DIAMOND_ADDRESS = useDiamondAddress();

  const wagmiConfig = useWagmiConfig();

  return useCallback(async (): ConstructCallReturnType => {
    if (disable || GLOBAL_MULTI_ACCOUNTABLE_PAUSED)
      return await constructCall();

    let callData: any = null;
    try {
      if (
        !chainId ||
        !constructCall ||
        !activeAccountAddress ||
        !Object.keys(DIAMOND_ADDRESS).length ||
        !Object.keys(MULTI_ACCOUNT_ADDRESS).length ||
        !account
      ) {
        throw new Error("Missing in generating constructCall.");
      }

      const call = await constructCall();
      if ("error" in call) throw call;
      const { config, args: preArgs, functionName } = call;
      callData = { config, args: preArgs, functionName }; // Store the call data

      if (functionName) {
        // @ts-ignore
        await simulateContract(wagmiConfig, {
          args: preArgs,
          abi: DIAMOND_ABI as Abi,
          address: DIAMOND_ADDRESS[chainId] as Address,
          functionName,
          account: activeAccountAddress as Address,
          value: config.value || BigInt(0),
        });
      }

      const args = [activeAccountAddress as Address, [config.data]];
      return {
        args,
        functionName,
        config: {
          account,
          to: MULTI_ACCOUNT_ADDRESS[chainId] as Address,
          data: encodeFunctionData({
            abi: MULTI_ACCOUNT_ABI as Abi,
            functionName: "_call",
            args,
          }),
          value: config.value || BigInt(0),
        },
      };
    } catch (error) {
      if (error instanceof BaseError) {
        const revertError = error.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );
        if (revertError instanceof ContractFunctionRevertedError) {
          console.log(revertError.reason?.toString() || "");
          throw error;
        }
      }
      if (error && typeof error === "string") throw new Error(error);

      if (callData) return { ...callData, error };

      throw new Error("error3");
    }
  }, [
    DIAMOND_ADDRESS,
    MULTI_ACCOUNT_ADDRESS,
    account,
    activeAccountAddress,
    chainId,
    constructCall,
    disable,
    wagmiConfig,
  ]);
}
