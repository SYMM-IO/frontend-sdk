import { Config } from "@wagmi/core";
import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { setChains } from "./actions";
import { HedgerInfoMap } from "../../types/hedger";
import { SupportedChainId } from "../../constants/chains";

export interface ChainType {
  readonly COLLATERAL_SYMBOL: string;
  readonly COLLATERAL_DECIMALS: number;
  readonly COLLATERAL_ADDRESS: string;
  readonly DIAMOND_ADDRESS: string;
  readonly MULTI_ACCOUNT_ADDRESS: string;
  readonly PARTY_B_WHITELIST: string;
  readonly SIGNATURE_STORE_ADDRESS: string;
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

export interface ChainsState {
  readonly chains: { [chainId: number]: { [name: string]: ChainType } };
  readonly V3_CHAIN_IDS: number[];
  readonly FALLBACK_CHAIN_ID: number;
  readonly hedgers: HedgerInfoMap;
  readonly appName: string;
  readonly MuonData: { [chainId: number]: MuonDataType };
  readonly wagmiConfig: Config;
}

const initialState: ChainsState = {
  chains: {},
  V3_CHAIN_IDS: [],
  FALLBACK_CHAIN_ID: 1,
  hedgers: { [SupportedChainId.NOT_SET]: [] },
  appName: "",
  MuonData: {},
  wagmiConfig: {} as Config,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setChains, (state, { payload }) => {
    const {
      chains,
      V3_CHAIN_IDS,
      FALLBACK_CHAIN_ID,
      hedgers,
      appName,
      MuonData,
      wagmiConfig,
    } = payload;
    state.chains = chains;
    state.V3_CHAIN_IDS = V3_CHAIN_IDS;
    state.FALLBACK_CHAIN_ID = FALLBACK_CHAIN_ID;
    state.hedgers = hedgers;
    state.appName = appName;
    state.MuonData = MuonData;
    state.wagmiConfig = wagmiConfig;
  })
);
