import { Abi, Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { useContract } from "./contract";

/**
 * TODO
 * 1-Memoizing inputs
 */

export type ContractType = {
  address?: Address;
  abi?: Abi;
  read?: Record<string, any>;
};

export function useSingleContractMultipleData(
  contractAddress: string,
  contractAbi: Abi,
  functionName: string,
  callsData: any,
  option?: any
) {
  const configs = callsData.map((args) => ({
    address: contractAddress as Address,
    abi: contractAbi,
    functionName,
    args,
  }));
  return useReadContracts({
    contracts: configs,
    ...{ option },
    query: { refetchInterval: 2000 },
  });
}

interface CallData {
  functionName: string;
  callInputs: any[];
}

export function useSingleContractMultipleMethods(
  contractAddress: string,
  contractAbi: Abi,
  callsData?: CallData[],
  option?: any
) {
  const configs =
    (contractAddress &&
      contractAbi &&
      callsData
        ?.map(({ callInputs: args, functionName }) => {
          if (!functionName || !args) {
            console.error("Invalid call data:", { functionName, args });
            return null;
          }

          return {
            address: contractAddress as Address,
            abi: contractAbi,
            functionName,
            args,
          };
        })
        .filter(Boolean)) ||
    [];

  const readContractsConfig = {
    contracts: configs,
    ...option,
    query: { refetchInterval: 2000 },
  };
  const result = useReadContracts(readContractsConfig);

  return result;
}

export function useSingleCallResult(
  contract: ReturnType<typeof useContract>,
  functionName: string,
  callInputs?: any,
  option?: any
) {
  return useReadContract({
    ...{ contract },
    functionName,
    args: [...[callInputs]],
    ...{ option },
    query: { refetchInterval: 2000 },
  });
}

export function useMultipleContractSingleData(
  addresses: string[],
  abi: Abi,
  functionName: string,
  callInputs: any,
  option?: any
) {
  // TODO: fix any type
  const configs = addresses.map((address, i) => ({
    address: address as Address,
    abi,
    functionName,
    args: (callInputs && callInputs[i] ? [callInputs[i]] : []) as any,
  }));

  return useReadContracts({
    contracts: configs,
    ...{ option },
    query: { refetchInterval: 2000 },
  });
}
