import { createConfig, http } from "wagmi";
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

import { APP_CHAINS } from "constants/chains/chains";
import { APP_NAME } from "constants/chains/misc";

export const getWagmiConfig = () => {
  if (!process.env.NEXT_PUBLIC_INFURA_KEY) {
    throw new Error("NEXT_PUBLIC_INFURA_KEY not provided");
  }

  if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID not provided");
  }

  const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

  const chains: readonly [Chain, ...Chain[]] =
    APP_CHAINS as unknown as readonly [Chain, ...Chain[]];

  const transports = chains.reduce((acc, chain) => {
    acc[chain.id] = http();
    return acc;
  }, {});

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
