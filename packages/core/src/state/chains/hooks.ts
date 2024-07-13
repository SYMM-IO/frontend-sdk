import { useCallback, useMemo } from "react";
import { AppState, useAppDispatch, useAppSelector } from "../declaration";
import { setChains } from "./actions";
import { ChainsState, MuonDataType } from "./reducer";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import { useFEName } from "../user/hooks";

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
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "COLLATERAL_ADDRESS"
    );

    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useCollateralSymbol(): {
  [chainId: number]: string;
} {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "COLLATERAL_SYMBOL"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useCollateralDecimal(): {
  [chainId: number]: number;
} {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "COLLATERAL_DECIMALS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useDiamondAddress() {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "DIAMOND_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useMultiAccountAddress() {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "MULTI_ACCOUNT_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useAllMultiAccountAddresses() {
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    return compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "MULTI_ACCOUNT_ADDRESS"
    );
  }, [chains, v3_ids]);
}

export function useSignatureStoreAddress() {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "SIGNATURE_STORE_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function usePartyBWhitelistAddress() {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "PARTY_B_WHITELIST"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useMultiCallAddress() {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(
      chains,
      v3_ids,
      "MULTICALL3_ADDRESS"
    );
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useUSDCAddress() {
  const FE_NAME = useFEName();
  const chains = useAppSelector((state: AppState) => state.chains.chains);
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);

  return useMemo(() => {
    const data = compatibleWithLegacyStructure(chains, v3_ids, "USDC_ADDRESS");
    return getValuesByName(data, FE_NAME);
  }, [FE_NAME, chains, v3_ids]);
}

export function useV3Ids(): number[] {
  const v3_ids = useAppSelector((state: AppState) => state.chains.V3_CHAIN_IDS);
  return v3_ids;
}

export function useFallbackChainId() {
  const fallbackChainId = useAppSelector(
    (state: AppState) => state.chains.FALLBACK_CHAIN_ID
  );
  return fallbackChainId;
}

export function useHedgerAddress() {
  const hedgers = useAppSelector((state: AppState) => state.chains.hedgers);
  return hedgers;
}

export function useAppName() {
  const appName = useAppSelector((state: AppState) => state.chains.appName);
  return appName;
}

export function useOrderHistorySubgraphAddress() {
  const { chainId } = useActiveWagmi();
  const frontEndName = useFEName();
  const chainsData = useAppSelector((state: AppState) => state.chains.chains);

  let address = "";
  if (chainId && frontEndName && chainsData && chainsData[chainId]) {
    const frontEndData = chainsData[chainId][frontEndName];
    if (frontEndData && frontEndData.ORDER_HISTORY_SUBGRAPH_ADDRESS) {
      address = frontEndData.ORDER_HISTORY_SUBGRAPH_ADDRESS;
    }
  }
  return address;
}

export function useAnalyticsSubgraphAddress() {
  const { chainId } = useActiveWagmi();
  const frontEndName = useFEName();
  const chainsData = useAppSelector((state: AppState) => state.chains.chains);

  let address = "";
  if (chainId && frontEndName && chainsData && chainsData[chainId]) {
    const frontEndData = chainsData[chainId][frontEndName];
    if (frontEndData && frontEndData.ANALYTICS_SUBGRAPH_ADDRESS) {
      address = frontEndData.ANALYTICS_SUBGRAPH_ADDRESS;
    }
  }

  return address;
}

export function useMuonData(): { [chainId: number]: MuonDataType } {
  const MuonData = useAppSelector((state: AppState) => state.chains.MuonData);
  return MuonData;
}

export function useWagmiConfig() {
  const wagmiConfig = useAppSelector(
    (state: AppState) => state.chains.wagmiConfig
  );
  return wagmiConfig;
}

export function useSetSdkConfig(): ({
  chains,
  V3_CHAIN_IDS,
  FALLBACK_CHAIN_ID,
  hedgers,
  appName,
  MuonData,
  wagmiConfig,
}: ChainsState) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    ({
      chains,
      V3_CHAIN_IDS,
      FALLBACK_CHAIN_ID,
      hedgers,
      appName,
      MuonData,
      wagmiConfig,
    }: ChainsState) => {
      dispatch(
        setChains({
          chains,
          V3_CHAIN_IDS,
          FALLBACK_CHAIN_ID,
          hedgers,
          appName,
          MuonData,
          wagmiConfig,
        })
      );
    },
    [dispatch]
  );
}
