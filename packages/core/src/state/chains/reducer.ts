import * as toolkitRaw from "@reduxjs/toolkit/dist/redux-toolkit.cjs.production.min.js";
const { createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;
import { setChains } from "./actions";
import { HedgerInfoMap } from "../../types/hedger";
import { SupportedChainId } from "../../constants";

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

const initialState: ChainsState = {
  hedgers: { [SupportedChainId.NOT_SET]: [] },
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setChains, (state, { payload }) => {
    const { hedgers } = payload;
    state.hedgers = hedgers;
  })
);
