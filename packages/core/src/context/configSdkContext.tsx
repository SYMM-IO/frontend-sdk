import React, { createContext, useContext, useState } from "react";
import { SupportedChainId } from "../constants";
import { HedgerInfoMap } from "../types/hedger";
import { Config } from "@wagmi/core";

export interface ChainType {
  readonly COLLATERAL_SYMBOL: string;
  readonly COLLATERAL_DECIMALS: number;
  readonly COLLATERAL_ADDRESS: string;
  readonly DIAMOND_ADDRESS: string;
  readonly MULTI_ACCOUNT_ADDRESS: string;
  readonly PARTY_B_WHITELIST: string;
  readonly SIGNATURE_STORE_ADDRESS: string;
  readonly TP_SL_WALLET_ADDRESS: string;
  readonly MULTICALL3_ADDRESS: string;
  readonly USDC_ADDRESS: string;
  readonly WRAPPED_NATIVE_ADDRESS: string;
  readonly ANALYTICS_SUBGRAPH_ADDRESS: string;
  readonly ORDER_HISTORY_SUBGRAPH_ADDRESS: string;
  readonly FUNDING_RATE_SUBGRAPH_ADDRESS: string;
}

export interface MuonDataType {
  AppName: string;
  Urls: string[];
}

export interface MuonDataObject {
  [chainId: number]: MuonDataType;
}

export interface ChainsType {
  [chainId: number]: { [name: string]: ChainType };
}

export interface ChainsState {
  readonly hedgers: HedgerInfoMap;
}

// Define your context state and actions
interface State {
  clientChain: SupportedChainId[];
  setClientChain: (clientChain: SupportedChainId[]) => void;

  chains: ChainsType;
  setChains: (chains: ChainsType) => void;

  hedgerInfo: HedgerInfoMap;
  setHedgerInfo: (hedgers: HedgerInfoMap) => void;

  fallbackChainId: number;
  setFallbackChainId: (chainId: number) => void;

  appName: string;
  setAppName: (name: string) => void;

  muonData: MuonDataObject;
  setMuonData: (data: MuonDataObject) => void;

  wagmiConfig: Config;
  setWagmiConfig: (config: Config) => void;
}

// Create a default state
const defaultState: State = {
  clientChain: [],
  setClientChain: () => {},

  chains: {},
  setChains: () => {},

  hedgerInfo: {
    [SupportedChainId.NOT_SET]: [],
  },
  setHedgerInfo: () => {},

  fallbackChainId: 1,
  setFallbackChainId: () => {},

  appName: "",
  setAppName: () => {},

  muonData: {},
  setMuonData: () => {},

  wagmiConfig: {} as Config,
  setWagmiConfig: () => {},
};

// Create the context with the default state
const StateContext = createContext<State>(defaultState);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clientChain, setClientChain] = useState<SupportedChainId[]>([]);
  const [chains, setChains] = useState<ChainsType>({});
  const [hedgerInfo, setHedgerInfo] = useState<HedgerInfoMap>({
    [SupportedChainId.NOT_SET]: [],
  });
  const [fallbackChainId, setFallbackChainId] = useState<number>(1);
  const [appName, setAppName] = useState<string>("");
  const [muonData, setMuonData] = useState<MuonDataObject>({});

  const [wagmiConfig, setWagmiConfig] = useState<Config>({} as Config);

  const value = {
    clientChain,
    setClientChain,

    chains,
    setChains,

    hedgerInfo,
    setHedgerInfo,

    fallbackChainId,
    setFallbackChainId,

    appName,
    setAppName,

    muonData,
    setMuonData,

    wagmiConfig,
    setWagmiConfig,
  };

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
