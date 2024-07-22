import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { DEFAULT_PRECISION } from "@symmio/frontend-sdk/constants/misc";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import {
  RoundMode,
  formatPrice,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { InputField } from "@symmio/frontend-sdk/types/trade";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useActiveMarket,
  useActiveMarketPrice,
  useSetTypedValue,
} from "@symmio/frontend-sdk/state/trade/hooks";
import { useLeverage } from "@symmio/frontend-sdk/state/user/hooks";

import InfoItem from "components/InfoItem";

export default function MinPositionInfo() {
  const { chainId } = useActiveWagmi();
  const setTypedValue = useSetTypedValue();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const leverage = useLeverage();
  const market = useActiveMarket();
  const marketPrice = useActiveMarketPrice();
  const [
    outputTicker,
    pricePrecision,
    quantityPrecision,
    minAcceptableQuoteValue,
  ] = useMemo(
    () =>
      market
        ? [
            market.symbol,
            market.pricePrecision,
            market.quantityPrecision,
            market.minAcceptableQuoteValue,
            market.maxLeverage,
          ]
        : ["", DEFAULT_PRECISION, DEFAULT_PRECISION, 10],
    [market]
  );
  const [minPositionValue, minPositionQuantity] = useMemo(() => {
    // find maximum quantity between min quote value & minimum value base on quantity precision
    const quantity = BigNumber.max(
      toBN(minAcceptableQuoteValue)
        .div(marketPrice)
        .times(leverage)
        .toFixed(quantityPrecision, RoundMode.ROUND_UP),
      toBN(10)
        .pow(quantityPrecision * -1)
        .toFixed(quantityPrecision, RoundMode.ROUND_UP)
    );
    const value = toBN(quantity).times(marketPrice).div(leverage);

    if (value.isNaN()) return ["-", "-"];
    return [
      value.toFixed(pricePrecision, RoundMode.ROUND_UP),
      quantity.toFixed(quantityPrecision, RoundMode.ROUND_UP),
    ];
  }, [
    leverage,
    marketPrice,
    minAcceptableQuoteValue,
    pricePrecision,
    quantityPrecision,
  ]);

  return (
    <InfoItem
      label={"Minimum position size:"}
      balanceExact={formatPrice(
        minPositionValue,
        pricePrecision,
        false,
        RoundMode.ROUND_UP
      )}
      amount={`${minPositionValue} ${collateralCurrency?.symbol} (${
        toBN(minPositionQuantity).eq(0) ? "-" : minPositionQuantity
      } ${outputTicker})`}
      onClick={(value) => setTypedValue(value, InputField.PRICE)}
    />
  );
}
