import React, { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

let tvScriptLoadingPromise: any;

const WidgetContainer = styled.div`
  height: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium` 
    height:280px;
  `};
`;

export default function TradingViewWidget({ symbol }: { symbol: string }) {
  const onLoadScriptRef = useRef<any>();

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );
    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (
        typeof window !== "undefined" &&
        document.getElementById("tradingview_c6655") &&
        !!window.TradingView
      ) {
        new window.TradingView.widget({
          symbol,
          autosize: true,
          interval: "1",
          timezone: "exchange",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: isMobile ? true : false,
          withdateranges: isMobile ? false : true,
          container_id: "tradingview_c6655",
        });
      }
    }
  }, [symbol]);

  return (
    <WidgetContainer className="tradingview-widget-container">
      <div id="tradingview_c6655" style={{ height: "100%" }} />
    </WidgetContainer>
  );
}
