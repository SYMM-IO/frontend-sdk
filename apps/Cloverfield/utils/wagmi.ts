import { createConfig, http, webSocket } from "wagmi";
import { Chain } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rabbyWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  safeWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { ALL_CHAINS, WEBSOCKET_RPC_URLS } from "constants/chains/chains";
import { APP_NAME } from "constants/chains/misc";
import { SupportedChainId } from "@symmio/frontend-sdk/constants";

export const getWagmiConfig = () => {
  if (!process.env.NEXT_PUBLIC_INFURA_KEY) {
    throw new Error("NEXT_PUBLIC_INFURA_KEY not provided");
  }

  if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID not provided");
  }

  const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

  const chains: readonly [Chain, ...Chain[]] =
    ALL_CHAINS as unknown as readonly [Chain, ...Chain[]];

  const transports = chains.reduce((acc, chain: Chain) => {
    const url = WEBSOCKET_RPC_URLS[chain.id];
    acc[chain.id] = url ? webSocket(url) : http();
    return acc;
  }, {} as Record<SupportedChainId, ReturnType<typeof webSocket> | ReturnType<typeof http>>);

  const connectors = connectorsForWallets(
    [
      {
        groupName: "Popular",
        wallets: [
          injectedWallet,
          metaMaskWallet,
          rabbyWallet,
          walletConnectWallet,
        ],
      },
      {
        groupName: "Others",
        wallets: [rainbowWallet, coinbaseWallet, safeWallet],
      },
    ],
    {
      appName: APP_NAME,
      projectId,
    }
  );

  const config = createConfig({
    chains,
    transports,
    connectors,
    batch: { multicall: true },
    cacheTime: 2000,
    pollingInterval: 2000,
  });

  return {
    wagmiConfig: config,
    chains,
    initialChain: chains[0],
  };
};
