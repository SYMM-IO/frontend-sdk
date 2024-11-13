import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { ChainType } from "@symmio/frontend-sdk/state/chains/reducer";

export enum FrontEndsName {
  ALPHA = "Alpha",
  INTENT_X = "IntentX",
  CORE = "Core",
  MORPHEX = "Morphex",
  BASED = "Based",
  CLOVERFIELD = "Cloverfield",
  NEW_CLOVERFIELD = "New Cloverfield",
  BEFI = "Befi",
  VIBE = "Vibe",
  PEAR = "Pear",
  ORBS = "Orbs",
}

// --------------------------------------------------------------------
const MantleChainOrbs: ChainType = {
  COLLATERAL_SYMBOL: "USDe",
  COLLATERAL_DECIMALS: 18,
  COLLATERAL_ADDRESS: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",

  DIAMOND_ADDRESS: "0x2Ecc7da3Cc98d341F987C85c3D9FC198570838B5",
  MULTI_ACCOUNT_ADDRESS: process.env.NEXT_PUBLIC_MANTLE_MULTIACCOUNT!,
  PARTY_B_WHITELIST: process.env.NEXT_PUBLIC_MANTLE_PARTY_B!,
  SIGNATURE_STORE_ADDRESS: "0x6EA2EffEB3F0F2582DF5aD52cbe847FA50B628B2",
  TP_SL_WALLET_ADDRESS: "",

  MULTICALL3_ADDRESS: "0xecAB00fA29A83023910b02d0C92831d3999b982B",
  USDC_ADDRESS: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  WRAPPED_NATIVE_ADDRESS: "0x29019c39EC418Ac4e7aFc1d88d6b962Ff172aBf6",
  ANALYTICS_SUBGRAPH_ADDRESS:
    "https://subgraph-api.mantle.xyz/subgraphs/name/analytics_mantle_8_2",
  ORDER_HISTORY_SUBGRAPH_ADDRESS:
    "https://subgraph-api.mantle.xyz/subgraphs/name/main_mantle_8_2",
  FUNDING_RATE_SUBGRAPH_ADDRESS:
    "https://subgraph-api.mantle.xyz/subgraphs/name/parties_mantle_8_2/graphql",
};

const ArbitrumChainOrbs: ChainType = {
  COLLATERAL_SYMBOL: "USDC",
  COLLATERAL_DECIMALS: 6,
  COLLATERAL_ADDRESS: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",

  DIAMOND_ADDRESS: "0x8F06459f184553e5d04F07F868720BDaCAB39395",
  MULTI_ACCOUNT_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_MULTIACCOUNT!,
  PARTY_B_WHITELIST: process.env.NEXT_PUBLIC_ARBITRUM_PARTY_B!,
  SIGNATURE_STORE_ADDRESS: "0x94eEa58De1C8945c342dB4bE9670301638E403e2",
  TP_SL_WALLET_ADDRESS: "",

  MULTICALL3_ADDRESS: "0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB",
  USDC_ADDRESS: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  WRAPPED_NATIVE_ADDRESS: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  ANALYTICS_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/analytics_arbitrum_8_2/version/latest",
  ORDER_HISTORY_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/main_arbitrum_8_2/version/latest",
  FUNDING_RATE_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/fundingrate_arbitrum_8_2/version/latest",
};

const BSCChainOrbs: ChainType = {
  COLLATERAL_SYMBOL: "USDT",
  COLLATERAL_DECIMALS: 18,
  COLLATERAL_ADDRESS: "0x55d398326f99059ff775485246999027b3197955",

  DIAMOND_ADDRESS: "0x9A9F48888600FC9c05f11E03Eab575EBB2Fc2c8f",
  TP_SL_WALLET_ADDRESS: "",
  MULTI_ACCOUNT_ADDRESS: process.env.NEXT_PUBLIC_BSC_MULTIACCOUNT!,
  PARTY_B_WHITELIST: process.env.NEXT_PUBLIC_BSC_PARTY_B!,

  SIGNATURE_STORE_ADDRESS: "0x6EA2EffEB3F0F2582DF5aD52cbe847FA50B628B2",
  MULTICALL3_ADDRESS: "0x963Df249eD09c358A4819E39d9Cd5736c3087184",
  USDC_ADDRESS: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  WRAPPED_NATIVE_ADDRESS: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",

  ANALYTICS_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/analytics_bnb_8_2/version/latest",
  ORDER_HISTORY_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/main_bnb_8_2/version/latest",
  FUNDING_RATE_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/fundingrate_bnb_8_2/version/latest",
};
// --------------------------------------------------------------------

export const ModeChainCloverfieldFE: ChainType = {
  COLLATERAL_SYMBOL: "USDC",
  COLLATERAL_DECIMALS: 18,
  COLLATERAL_ADDRESS: "0xd988097fb8612cc24eeC14542bC03424c656005f",

  DIAMOND_ADDRESS: "0x3d17f073cCb9c3764F105550B0BCF9550477D266",
  MULTI_ACCOUNT_ADDRESS: "0xd1215e77eD4468a7Ec287daeC2Bc89178a138C9a",
  PARTY_B_WHITELIST: "0x87FC464fa528260F1eeaB94FA20F73FeD8536Eb7",
  SIGNATURE_STORE_ADDRESS: "N/A",
  TP_SL_WALLET_ADDRESS: "",

  MULTICALL3_ADDRESS: "0xcA11bde05977b3631167028862bE2a173976CA11",
  USDC_ADDRESS: "0xd988097fb8612cc24eeC14542bC03424c656005f",
  WRAPPED_NATIVE_ADDRESS: "N/A",
  ANALYTICS_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/analytics_arbitrum_8_2/version/latest",
  ORDER_HISTORY_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/main_arbitrum_8_2/version/latest",
  FUNDING_RATE_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/fundingrate_arbitrum_8_2/version/latest",
};

export const BaseChainOrbs: ChainType = {
  COLLATERAL_SYMBOL: "USDC",
  COLLATERAL_DECIMALS: 18,
  COLLATERAL_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",

  DIAMOND_ADDRESS: "0x91Cf2D8Ed503EC52768999aA6D8DBeA6e52dbe43",
  SIGNATURE_STORE_ADDRESS: "N/A",
  TP_SL_WALLET_ADDRESS: "",

  MULTI_ACCOUNT_ADDRESS: process.env.NEXT_PUBLIC_BASE_MULTIACCOUNT!,
  PARTY_B_WHITELIST: process.env.NEXT_PUBLIC_BASE_PARTY_B!,

  MULTICALL3_ADDRESS: "0xcA11bde05977b3631167028862bE2a173976CA11",
  USDC_ADDRESS: "0xd988097fb8612cc24eeC14542bC03424c656005f",
  WRAPPED_NATIVE_ADDRESS: "N/A",
  ANALYTICS_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/analytics_base_8_2/version/latest",
  ORDER_HISTORY_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/main_base_8_2/version/latest",
  FUNDING_RATE_SUBGRAPH_ADDRESS:
    "https://api.studio.thegraph.com/query/62454/fundingrate_base_8_2/version/latest",
}

export const contractInfo: {
  [chainId: number]: { [name: string]: ChainType };
} = {
  [SupportedChainId.FANTOM]: {},

  [SupportedChainId.POLYGON]: {},

  [SupportedChainId.BASE]: {
    [FrontEndsName.ORBS]: BaseChainOrbs,
  },
  [SupportedChainId.BLAST]: {},

  [SupportedChainId.BSC]: {
    [FrontEndsName.ORBS]: BSCChainOrbs,
  },
  [SupportedChainId.MANTLE]: {
    [FrontEndsName.ORBS]: MantleChainOrbs,
  },
  [SupportedChainId.ARBITRUM]: {
    [FrontEndsName.ORBS]: ArbitrumChainOrbs,
  },

  [SupportedChainId.MODE]: {
    [FrontEndsName.ORBS]: ModeChainCloverfieldFE,
  },
};
