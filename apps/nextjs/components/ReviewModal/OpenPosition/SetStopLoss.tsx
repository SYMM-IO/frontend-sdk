import React, { ChangeEvent, useMemo } from "react";
import styled from "styled-components";

import InfoItem from "components/InfoItem";
import ActionButton from "./ActionButton";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useActiveMarket,
  useSetIsActiveStopLoss,
  useSetStopLossPrice,
  useStopLossValues,
} from "@symmio/frontend-sdk/state/trade/hooks";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import useTradePage, {
  useLockedValues,
  useNotionalValue,
} from "@symmio/frontend-sdk/hooks/useTradePage";
import { DEFAULT_PRECISION } from "@symmio/frontend-sdk/constants/misc";
import { toBN } from "@symmio/frontend-sdk/utils/numbers";
import SwitchInput from "components/Input/SwitchInput";

const Info = styled.p`
  color: ${({ theme }) => theme.text4};
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
`;

export default function SetStopLoss() {
  const { chainId } = useActiveWagmi();

  const { isActive, stopLossPrice } = useStopLossValues();
  const setPrice = useSetStopLossPrice();
  const setIsActive = useSetIsActiveStopLoss();

  const market = useActiveMarket();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const { price, formattedAmounts } = useTradePage();

  const [pricePrecision] = useMemo(
    () => (market ? [market.pricePrecision] : [DEFAULT_PRECISION]),
    [market]
  );

  const quantityAsset = useMemo(
    () => (toBN(formattedAmounts[1]).isNaN() ? "0" : formattedAmounts[1]),
    [formattedAmounts]
  );

  const notionalValue = useNotionalValue(quantityAsset, price);

  const { total: lockedValue } = useLockedValues(notionalValue);

  const tradingFee = useMemo(() => {
    const notionalValueBN = toBN(notionalValue);
    if (!market || notionalValueBN.isNaN()) return "-";
    return market.tradingFee
      ? `${notionalValueBN.times(market.tradingFee).toString()} ${
          collateralCurrency?.symbol
        }`
      : "ss-";
  }, [market, notionalValue, collateralCurrency?.symbol]);

  const info = useMemo(() => {
    const lockedValueBN = toBN(lockedValue);
    return [
      {
        title: "Locked Value:",
        value: `${
          lockedValueBN.isNaN() ? "0" : lockedValueBN.toFixed(pricePrecision)
        } ${collateralCurrency?.symbol}`,
      },
      { title: "Platform Fee:", value: tradingFee },
    ];
  }, [lockedValue, pricePrecision, collateralCurrency?.symbol, tradingFee]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleSwitchChange = () => {
    setIsActive(!isActive);
    setPrice("");
  };

  return (
    <>
      <SwitchInput
        label="Stop-Loss (Delta-Neutral)"
        id="stop-loss-modal"
        isSwitchOn={isActive}
        onSwitchChange={handleSwitchChange}
        value={stopLossPrice}
        onValueChange={handleInputChange}
        placeholder="Stop Price / Loss Percentage"
      />
      {info.map((info, index) => {
        return <InfoItem label={info.title} amount={info.value} key={index} />;
      })}
      <Info>
        <p>some warning and notes about Delta-Neutral. like:</p>
        <p>1- it&apos;s a reverse position</p>
        <p>2- Separated Platform fee + Funding</p>
        <p>3- Something about that we Lock Value exactly</p>
        <p>.....</p>
      </Info>
      <ActionButton />
    </>
  );
}
