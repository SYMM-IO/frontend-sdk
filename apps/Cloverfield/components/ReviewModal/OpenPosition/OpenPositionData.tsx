import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";

import InfoItem from "components/InfoItem";
import { DisplayLabel } from "components/InputLabel";
import Column from "components/Column";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useActiveMarket,
  useOrderType,
  useTradeTpSl,
} from "@symmio/frontend-sdk/state/trade/hooks";
import { useLeverage } from "@symmio/frontend-sdk/state/user/hooks";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import useTradePage, {
  useLockedValues,
  useNotionalValue,
} from "@symmio/frontend-sdk/hooks/useTradePage";
import {
  DEFAULT_PRECISION,
  MARKET_ORDER_DEADLINE,
} from "@symmio/frontend-sdk/constants/misc";
import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { OrderType } from "@symmio/frontend-sdk/types/trade";
import ActionButton from "./ActionButton";

const LabelsWrapper = styled(Column)`
  gap: 12px;
`;

const ErrorMsgStyle = styled.div<{ color?: string; size?: string }>`
  color: ${({ theme, color }) => color ?? theme.red2};
  font-size: ${({ size }) => size ?? "12px"};
`;

export default function OpenPositionData() {
  const theme = useTheme();
  const { chainId } = useActiveWagmi();

  const orderType = useOrderType();
  const market = useActiveMarket();
  const userLeverage = useLeverage();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const { formattedAmounts, minPositionQuantity, price } = useTradePage();

  const [symbol, pricePrecision] = useMemo(
    () =>
      market ? [market.symbol, market.pricePrecision] : ["", DEFAULT_PRECISION],
    [market]
  );
  const quantityAsset = useMemo(
    () => (toBN(formattedAmounts[1]).isNaN() ? "0" : formattedAmounts[1]),
    [formattedAmounts]
  );
  const { tp, sl } = useTradeTpSl();
  const notionalValue = useNotionalValue(quantityAsset, price);

  const { total: lockedValue } = useLockedValues(notionalValue);

  const tradingFee = useMemo(() => {
    const notionalValueBN = toBN(notionalValue);
    if (!market || notionalValueBN.isNaN()) return "-";
    return market.tradingFee
      ? notionalValueBN.times(market.tradingFee).toString()
      : "0";
  }, [market, notionalValue]);

  const info = useMemo(() => {
    const lockedValueBN = toBN(lockedValue);
    const basedInfo = [
      {
        title: "Locked Value:",
        value: `${
          lockedValueBN.isNaN() ? "0" : lockedValueBN.toFixed(pricePrecision)
        } ${collateralCurrency?.symbol}`,
      },
      { title: "Leverage:", value: `${userLeverage} X` },
      {
        title: "Open Price:",
        value: `${
          price === "" ? "-" : orderType === OrderType.MARKET ? "Market" : price
        }`,
        valueColor: theme.primaryBlue,
      },
      {
        title: "Platform Fee:",
        value: !toBN(tradingFee).isNaN()
          ? `${formatAmount(
              toBN(tradingFee).div(2),
              3,
              true
            )} (OPEN) / ${formatAmount(
              toBN(tradingFee).div(2),
              3,
              true
            )} (CLOSE) ${collateralCurrency?.symbol}`
          : `0 (OPEN) / 0 (CLOSE) ${collateralCurrency?.symbol}`,
      },
      {
        title: "Order Expire Time:",
        value: `${
          orderType === OrderType.MARKET
            ? `${MARKET_ORDER_DEADLINE} seconds`
            : "Unlimited"
        }`,
      },
    ];
    if (tp || sl) {
      basedInfo.push({ title: "TP/SL:", value: `${tp}/${sl}` });
    }
    return basedInfo;
  }, [
    lockedValue,
    pricePrecision,
    collateralCurrency?.symbol,
    userLeverage,
    price,
    orderType,
    theme.primaryBlue,
    tradingFee,
    tp,
    sl,
  ]);

  const errorMsg =
    "Caution: The trade size might be smaller than the threshold while the order is being filled.";

  return (
    <React.Fragment>
      <LabelsWrapper>
        <DisplayLabel
          label="Position Value"
          value={toBN(lockedValue).toFixed(pricePrecision)}
          leverage={userLeverage}
          symbol={collateralCurrency?.symbol}
          precision={pricePrecision}
        />

        <DisplayLabel
          label="Receive"
          value={formattedAmounts[1]}
          symbol={symbol}
        />
      </LabelsWrapper>
      {info.map((info, index) => {
        return (
          <InfoItem
            label={info.title}
            amount={info.value}
            valueColor={info?.valueColor}
            key={index}
          />
        );
      })}
      <ErrorMsgStyle>
        <div>
          {toBN(formattedAmounts[1]).lt(minPositionQuantity) && errorMsg}
        </div>
      </ErrorMsgStyle>
      <ActionButton />
    </React.Fragment>
  );
}
