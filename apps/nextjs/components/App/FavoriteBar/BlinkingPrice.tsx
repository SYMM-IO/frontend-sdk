import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { Market } from "@symmio/frontend-sdk/types/market";
import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";

import { useMarketData } from "@symmio/frontend-sdk/state/hedger/hooks";

export const Price = styled.div<{
  positive: boolean;
  visible?: boolean;
  width?: string;
  size?: string;
  textAlign?: string;
}>`
  font-style: normal;
  font-weight: 500;
  font-size: ${({ size }) => (size ? size : "12px")};
  text-align: ${({ textAlign }) => textAlign ?? "left"};

  @keyframes blink {
    25% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }

  color: ${({ theme, positive }) => (positive ? theme.green1 : theme.red1)};
  animation: ${({ visible }) => (visible ? "blink 0.5s linear 1" : "none")};

  ${({ width }) =>
    width &&
    `
  width: ${width}px;
`};
`;

export default function BlinkingPrice({
  market,
  priceWidth,
  data,
  textSize,
  textAlign,
}: {
  market?: Market;
  priceWidth?: string;
  data?: string;
  textSize?: string;
  textAlign?: string;
}) {
  const { name, pricePrecision } = market || {};
  const marketData = useMarketData(name);
  const mark = useMemo(
    () =>
      data
        ? data
        : marketData
        ? parseFloat(marketData.markPrice).toFixed(pricePrecision)
        : 0,
    [marketData, pricePrecision, data]
  );

  const [markPrice, setMarkPrice] = useState(mark);
  const [visible, setVisible] = useState(true);

  const [upOrDown] = useMemo(() => {
    setMarkPrice(mark);
    return [markPrice > mark];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mark]);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [markPrice]);

  return (
    <Price
      positive={!upOrDown}
      visible={visible}
      width={priceWidth}
      size={textSize}
      textAlign={textAlign}
    >
      ${formatAmount(toBN(mark).toString())}
    </Price>
  );
}
