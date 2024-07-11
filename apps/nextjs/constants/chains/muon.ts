import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { MuonDataType } from "@symmio/frontend-sdk/state/chains/reducer";
import {
  MUON_APP_NAME,
  BSC_MUON_BASE_URLS,
  POLYGON_MUON_BASE_URL,
  MANTLE_MUON_BASE_URL,
  BASE_MUON_BASE_URL,
  BLAST_MUON_BASE_URL,
  ARBITRUM_MUON_BASE_URL,
} from "constants/chains/misc";

export const BSCChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: BSC_MUON_BASE_URLS,
};

export const PolygonChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: POLYGON_MUON_BASE_URL,
};

export const MantleChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: MANTLE_MUON_BASE_URL,
};

export const BaseChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: BASE_MUON_BASE_URL,
};

export const BlastChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: BLAST_MUON_BASE_URL,
};

export const ArbitrumChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: ARBITRUM_MUON_BASE_URL,
};

export const MuonInfo: { [chainId: number]: MuonDataType } = {
  [SupportedChainId.BSC]: BSCChain,
  [SupportedChainId.POLYGON]: PolygonChain,
  [SupportedChainId.MANTLE]: MantleChain,
  [SupportedChainId.BASE]: BaseChain,
  [SupportedChainId.BLAST]: BlastChain,
  [SupportedChainId.ARBITRUM]: ArbitrumChain,
};
