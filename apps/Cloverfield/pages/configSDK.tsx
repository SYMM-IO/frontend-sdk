import { useEffect } from "react";
import { useSetSdkConfig } from "@symmio/frontend-sdk/state/chains/hooks";

import { contractInfo } from "constants/chains/addresses";
import { ClientChain, FALLBACK_CHAIN_ID } from "constants/chains/chains";
import { HedgerInfo } from "constants/chains/hedgers";
import { APP_NAME } from "constants/chains/misc";
import { MuonInfo } from "constants/chains/muon";
import { wagmiConfig } from "pages/_app";
import { useStateContext } from "@symmio/frontend-sdk/context/configSdkContext";

export default function ConfigSDKComponent() {
  const setConfigCallBack = useSetSdkConfig();
  const {
    setChains,
    setClientChain,
    setFallbackChainId,
    setHedgerInfo,
    setAppName,
    setMuonData,
    setWagmiConfig,
  } = useStateContext();

  useEffect(() => {
    setChains(contractInfo);
    setClientChain(ClientChain);
    setFallbackChainId(FALLBACK_CHAIN_ID);
    setHedgerInfo(HedgerInfo);
    setAppName(APP_NAME);
    setMuonData(MuonInfo);
    setWagmiConfig(wagmiConfig);

    setConfigCallBack({
      hedgers: HedgerInfo,
    });
  }, [
    setAppName,
    setChains,
    setClientChain,
    setConfigCallBack,
    setFallbackChainId,
    setHedgerInfo,
    setMuonData,
    setWagmiConfig,
  ]);

  return <></>;
}
