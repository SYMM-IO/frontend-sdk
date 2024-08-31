import { useCallback, useMemo } from "react";
import { AppState, useAppDispatch, useAppSelector } from "../declaration";
import { setChains } from "./actions";
import { ChainsState, MuonDataObject } from "./reducer";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import { useFEName } from "../user/hooks";
import { useHedgerInfo } from "../hedger/hooks";
import { useStateContext } from "../../context/configSdkContext";

type InputObject = {
  [chainId: number]: { [name: string]: any };
};

function compatibleWithLegacyStructure(chains, v3_ids, parameter_name) {
  return Object.keys(chains)
    .filter((key) => v3_ids.includes(parseInt(key)))
    .reduce((obj, key) => {
      obj[key] = Object.keys(chains[key]).reduce((obj, FeName) => {
        obj[FeName] = chains[key][FeName][parameter_name];
        return obj;
      }, {});
      return obj;
    }, {});
}

function getValuesByName(
  inputObj: InputObject,
  name: string
): { [chainId: number]: any } {
  const result: { [chainId: number]: any } = {};

  for (const chainId in inputObj) {
    if (inputObj[chainId].hasOwnProperty(name)) {
      result[Number(chainId)] = inputObj[chainId][name];
    }
  }

  return result;
}

export function useCollateralAddress(): {
  [chainId: number]: string;
} {
  const FE_NAME = useFEName();

  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "COLLATERAL_ADDRESS"
    );

    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useCollateralSymbol(): {
  [chainId: number]: string;
} {
  const FE_NAME = useFEName();

  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "COLLATERAL_SYMBOL"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useCollateralDecimal(): {
  [chainId: number]: number;
} {
  const FE_NAME = useFEName();

  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "COLLATERAL_DECIMALS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useDiamondAddress() {
  const FE_NAME = useFEName();
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "DIAMOND_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useMultiAccountAddress() {
  const FE_NAME = useFEName();

  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "MULTI_ACCOUNT_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useTpSlWalletAddress() {
  const FE_NAME = useFEName();
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "TP_SL_WALLET_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useTpSlAvailable() {
  const FE_NAME = useFEName();
  const { chains } = useStateContext();
  const { chainId } = useActiveWagmi();
  const { tpslUrl } = useHedgerInfo() || {};
  const isEnableTpSl = chains?.[chainId ?? 1]?.[FE_NAME]?.TP_SL_WALLET_ADDRESS;

  return (
    isEnableTpSl && isEnableTpSl.length > 0 && tpslUrl && tpslUrl.length > 0
  );
}

export function useAllMultiAccountAddresses() {
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    return compatibleWithLegacyStructure(
      chains,
      clientChain,
      "MULTI_ACCOUNT_ADDRESS"
    );
  }, [chains, clientChain]);
}

export function useSignatureStoreAddress() {
  const FE_NAME = useFEName();
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "SIGNATURE_STORE_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function usePartyBWhitelistAddress() {
  const FE_NAME = useFEName();
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "PARTY_B_WHITELIST"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useMultiCallAddress() {
  const FE_NAME = useFEName();
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "MULTICALL3_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useUSDCAddress() {
  const FE_NAME = useFEName();
  const { chains, clientChain } = useStateContext();

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      clientChain,
      "USDC_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, clientChain]);
}

export function useV3Ids(): number[] {
  const { clientChain } = useStateContext();
  return clientChain;
}

export function useFallbackChainId() {
  const { fallbackChainId } = useStateContext();
  return fallbackChainId;
}

export function useHedgerAddress() {
  const hedgers = useAppSelector((state: AppState) => state.chains.hedgers);
  return hedgers;
}

export function useAppName() {
  const { appName } = useStateContext();
  return appName;
}

export function useOrderHistorySubgraphAddress() {
  const { chainId } = useActiveWagmi();
  const frontEndName = useFEName();
  const { chains: chainsData } = useStateContext();

  let address = "";
  if (chainId && frontEndName && chainsData && chainsData[chainId]) {
    const frontEndData = chainsData[chainId][frontEndName];
    if (frontEndData && frontEndData.ORDER_HISTORY_SUBGRAPH_ADDRESS) {
      address = frontEndData.ORDER_HISTORY_SUBGRAPH_ADDRESS;
    }
  }
  return address;
}

export function useGetUniqueElementInChains(element: string) {
  const { chains: config } = useStateContext();

  const addresses: { chainId: string; url: string }[] = [];

  for (const chainId in config) {
    for (const projectName in config[chainId]) {
      const url = config[chainId][projectName][element];

      const isDuplicate = addresses.some(
        (address) => address.chainId === chainId && address.url === url
      );
      if (!isDuplicate) {
        addresses.push({ chainId, url });
      }
    }
  }

  return addresses;
}

export function useAnalyticsSubgraphAddress() {
  const { chainId } = useActiveWagmi();
  const frontEndName = useFEName();
  const { chains: chainsData } = useStateContext();

  let address = "";
  if (chainId && frontEndName && chainsData && chainsData[chainId]) {
    const frontEndData = chainsData[chainId][frontEndName];
    if (frontEndData && frontEndData.ANALYTICS_SUBGRAPH_ADDRESS) {
      address = frontEndData.ANALYTICS_SUBGRAPH_ADDRESS;
    }
  }

  return address;
}

export function useFundingRateSubgraphAddress() {
  const { chainId } = useActiveWagmi();
  const frontEndName = useFEName();
  const { chains: chainsData } = useStateContext();

  let address = "";
  if (chainId && frontEndName && chainsData && chainsData[chainId]) {
    const frontEndData = chainsData[chainId][frontEndName];
    if (frontEndData && frontEndData.FUNDING_RATE_SUBGRAPH_ADDRESS) {
      address = frontEndData.FUNDING_RATE_SUBGRAPH_ADDRESS;
    }
  }

  return address;
}

export function useMuonData(): MuonDataObject {
  const { muonData } = useStateContext();
  return muonData;
}

export function useWagmiConfig() {
  const { wagmiConfig } = useStateContext();
  return wagmiConfig;
}

export function useSetSdkConfig(): ({ hedgers }: ChainsState) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    ({ hedgers }: ChainsState) => {
      dispatch(
        setChains({
          hedgers,
        })
      );
    },
    [dispatch]
  );
}
