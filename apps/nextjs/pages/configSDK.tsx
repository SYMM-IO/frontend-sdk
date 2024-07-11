import { useEffect } from "react";
import { useSetSdkConfig } from "@symmio/frontend-sdk/state/chains/hooks";

import { contractInfo } from "constants/chains/addresses";
import { ClientChain, FALLBACK_CHAIN_ID } from "constants/chains/chains";
import { AbisInfo } from "constants/chains/abi";
import { HedgerInfo } from "constants/chains/hedgers";
import { APP_NAME } from "constants/chains/misc";
import { MuonInfo } from "constants/chains/muon";
import { wagmiConfig } from "pages/_app";

export default function ConfigSDKComponent() {
  const setConfigCallBack = useSetSdkConfig();

  useEffect(() => {
    setConfigCallBack({
      chains: contractInfo,
      V3_CHAIN_IDS: ClientChain,
      contract_ABIs: AbisInfo,
      FALLBACK_CHAIN_ID,
      hedgers: HedgerInfo,
      appName: APP_NAME,
      MuonData: MuonInfo,
      wagmiConfig,
    });
  }, [setConfigCallBack]);

  return <></>;
}
