import { Chain } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount } from "wagmi";

type useWagmiReturnType = {
  chainId: number | undefined;
  account: Address | undefined;
  chain:
    | (Chain & {
        unsupported?: boolean | undefined;
      })
    | undefined;
  isConnected: boolean;
  isConnecting: boolean;
};

export default function useWagmi(): useWagmiReturnType {
  const { address, isConnected, isConnecting, chain, chainId } = useAccount();
  return {
    chainId: chain?.id ?? chainId,
    account: address,

    chain,
    isConnected,
    isConnecting,
  };
}
