import useWagmi from "./useWagmi";
import { useInjectedAddress } from "../../state/application/hooks";
import { Address } from "viem";

export default function useActiveWagmi() {
  const wagmiData = useWagmi();
  const injectedAddress = useInjectedAddress();
  const context =
    injectedAddress === ""
      ? wagmiData
      : { ...wagmiData, account: injectedAddress as Address };

  return context;
}
