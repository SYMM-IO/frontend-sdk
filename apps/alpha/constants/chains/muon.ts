import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { MuonDataType } from "@symmio/frontend-sdk/state/chains/reducer";
import { MUON_APP_NAME, MUON_BASE_URLS } from "constants/chains/misc";

export const BSCChain: MuonDataType = {
  AppName: MUON_APP_NAME,
  Urls: MUON_BASE_URLS,
};

export const MuonInfo: { [chainId: number]: MuonDataType } = {
  [SupportedChainId.BSC]: BSCChain,
};
