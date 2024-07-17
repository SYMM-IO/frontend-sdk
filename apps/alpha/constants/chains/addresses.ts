import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { ChainType } from "@symmio/frontend-sdk/state/chains/reducer";

export enum FrontEndsName {
  ALPHA = "Alpha",
  INTENT_X = "IntentX",
  CORE = "Core",
  MORPHEX = "Morphex",
  BASED = "Based",
  CLOVERFIELD = "Cloverfield",
}

export const BSCChain: ChainType = {
  // COLLATERAL
  COLLATERAL_SYMBOL: "USDT",
  COLLATERAL_DECIMALS: 18,
  COLLATERAL_ADDRESS: "0x55d398326f99059ff775485246999027b3197955",

  DIAMOND_ADDRESS: "0x9A9F48888600FC9c05f11E03Eab575EBB2Fc2c8f",
  MULTI_ACCOUNT_ADDRESS: "0x650a2D6C263A93cFF5EdD41f836ce832F05A1cF3",
  PARTY_B_WHITELIST: "0x9fa01a45E245015fA685F21763e60C60832Ed2D6",

  SIGNATURE_STORE_ADDRESS: "0x6EA2EffEB3F0F2582DF5aD52cbe847FA50B628B2",
  MULTICALL3_ADDRESS: "0x963Df249eD09c358A4819E39d9Cd5736c3087184",
  USDC_ADDRESS: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  WRAPPED_NATIVE_ADDRESS: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",

  ANALYTICS_SUBGRAPH_ADDRESS:
    "https://api.thegraph.com/subgraphs/name/symmiograph/symmioanalytics_bnb_8_2",
  ORDER_HISTORY_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/main_bnb_8_2/version/latest",
  FUNDING_RATE_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/fundingrate_bnb_8_2/version/latest",
};

export const contractInfo: {
  [chainId: number]: { [name: string]: ChainType };
} = {
  [SupportedChainId.BSC]: {
    [FrontEndsName.ALPHA]: BSCChain,
  },
};
