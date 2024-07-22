import { useMemo } from "react";
// import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'
import TradingViewWidget from "./TVChart2";

const TVChart = ({ symbol }: { symbol: string }) => {
  return useMemo(() => <TradingViewWidget symbol={symbol} />, [symbol]);
  // return useMemo(
  //   () => <AdvancedRealTimeChart symbol={symbol} theme="dark" autosize interval="1" allow_symbol_change={false} />,
  //   [symbol]
  // )
};

export default TVChart;
