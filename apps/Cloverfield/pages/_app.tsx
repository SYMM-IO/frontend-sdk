import React, { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import dynamic from "next/dynamic";
import type { AppProps } from "next/app";
import store, { ReduxProvider } from "@symmio/frontend-sdk/state/declaration";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { getWagmiConfig } from "utils/wagmi";
import ThemeProvider, { ThemedGlobalStyle } from "theme";
import { ModalProvider } from "styled-react-modal";
import { Toaster } from "react-hot-toast";
import { ModalBackground } from "components/Modal";
import Layout from "components/Layout";
import Popups from "components/Popups";
import { BlockNumberProvider } from "@symmio/frontend-sdk/lib/hooks/useBlockNumber";
import ConfigSDKComponent from "./configSDK";
import { setUseWhatChange } from "@simbathesailor/use-what-changed";
import Updaters from "@symmio/frontend-sdk/state/updaters";
import ErrorBoundary from "components/App/ErrorBoundaries";
import { StateProvider } from "@symmio/frontend-sdk/context/configSdkContext";

// const Updaters = dynamic(() => import("@symmio/frontend-sdk/state/updaters"), {
//   ssr: false,
// });

const { wagmiConfig, initialChain } = getWagmiConfig();
export default function MyApp({ Component, pageProps }: AppProps) {
  if (process.env.NODE_ENV === "development") {
    setUseWhatChange(true);
  }
  const [showChild, setShowChild] = useState(false);
  const queryClient = new QueryClient();
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }
  if (typeof window === undefined) {
    return <></>;
  }
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              initialChain={initialChain}
              showRecentTransactions={true}
              theme={darkTheme({
                accentColor: "#AEE3FA",
                accentColorForeground: "#151A1F",
                borderRadius: "small",
                fontStack: "system",
                overlayBlur: "small",
              })}
            >
              <ThemeProvider>
                <ThemedGlobalStyle />
                <ModalProvider backgroundComponent={ModalBackground}>
                  <Toaster position="bottom-center" />
                  <BlockNumberProvider wagmiConfig={wagmiConfig}>
                    <StateProvider>
                      <Popups />
                      <Updaters />
                      <ConfigSDKComponent />
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </StateProvider>
                  </BlockNumberProvider>
                </ModalProvider>
              </ThemeProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export { wagmiConfig };
