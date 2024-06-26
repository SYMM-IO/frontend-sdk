import { Abi, erc20Abi, erc721Abi } from "viem";
import { useContract } from "../lib/hooks/contract";

import {
  useCollateralAddress,
  useDiamondAddress,
  useMultiAccountAddress,
  useMultiCallAddress,
  useCollateralABI,
  useDiamondABI,
  useMultiAccountABI,
  useERC20BYTES20ABI,
  useMulticall3ABI,
  useSignatureStoreAddress,
  useSignatureStoreABI,
} from "../state/chains/hooks";

/* ###################################
                        CloverField
################################### */

export function useCollateralContract() {
  const COLLATERAL_ADDRESS = useCollateralAddress();
  const COLLATERAL_ABI = useCollateralABI();
  return useContract(COLLATERAL_ADDRESS, COLLATERAL_ABI);
}

export function useDiamondContract() {
  const DIAMOND_ADDRESS = useDiamondAddress();
  const DIAMOND_ABI = useDiamondABI();
  return useContract(DIAMOND_ADDRESS, DIAMOND_ABI);
}

export function useMultiAccountContract(): ReturnType<typeof useContract> {
  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const MULTI_ACCOUNT_ABI = useMultiAccountABI();
  return useContract(MULTI_ACCOUNT_ADDRESS, MULTI_ACCOUNT_ABI);
}

export function useSignatureStoreContract(): ReturnType<typeof useContract> {
  const SIGNATURE_STORE_ADDRESS = useSignatureStoreAddress();
  const SIGNATURE_STORE_ABI = useSignatureStoreABI();
  return useContract(SIGNATURE_STORE_ADDRESS, SIGNATURE_STORE_ABI);
}

/* ###################################
                      THIRD PARTY
################################### */

export function useERC20Contract(tokenAddress: string | null | undefined) {
  return useContract(tokenAddress, erc20Abi);
}
export function useERC721Contract(
  tokenAddress: string | null | undefined,
  ABI?: Abi
) {
  return useContract(tokenAddress, ABI ?? erc721Abi);
}

export function useBytes32TokenContract(tokenAddress?: string) {
  const ERC20_BYTES32_ABI = useERC20BYTES20ABI();
  return useContract(tokenAddress, ERC20_BYTES32_ABI);
}

export function useMultiCall3Contract() {
  const MULTICALL3_ADDRESS = useMultiCallAddress();
  const MULTICALL3_ABI = useMulticall3ABI();
  return useContract(MULTICALL3_ADDRESS, MULTICALL3_ABI);
}
