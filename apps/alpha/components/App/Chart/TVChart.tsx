import { useMemo } from "react";
import TradingViewWidget from "./TVChart2";

const TVChart = ({ symbol }: { symbol: string }) => {
  return useMemo(() => <TradingViewWidget symbol={symbol} />, [symbol]);
};

export default TVChart;
