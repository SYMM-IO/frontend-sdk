import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { MuonDataType } from "@symmio/frontend-sdk/state/chains/reducer";
import {
  MUON_APP_NAME,
  BSC_MUON_BASE_URLS,
  POLYGON_MUON_BASE_URL,
} from "constants/chains/misc";

export const BSCChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: BSC_MUON_BASE_URLS,
};

export const PolygonChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: POLYGON_MUON_BASE_URL,
};

export const MuonInfo: { [chainId: number]: MuonDataType } = {
  [SupportedChainId.BSC]: BSCChain,
  [SupportedChainId.POLYGON]: PolygonChain,
};
