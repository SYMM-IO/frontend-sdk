import React, { createContext, useContext, useState } from "react";
import { SupportedChainId } from "../constants";
import { ChainsType, MuonDataObject } from "../state/chains/reducer";
import { HedgerInfoMap } from "../types/hedger";
import { Config } from "@wagmi/core";

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
