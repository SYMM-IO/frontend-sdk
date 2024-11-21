import { useMemo } from "react";
// import BigNumber from "bignumber.js";

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
  // useActiveMarketPrice,
  useSetTypedValue,
} from "@symmio/frontend-sdk/state/trade/hooks";

import useTradePage from "@symmio/frontend-sdk/hooks/useTradePage";

import InfoItem from "components/InfoItem";

export default function MinPositionInfo() {
  const { chainId } = useActiveWagmi();
  const setTypedValue = useSetTypedValue();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const market = useActiveMarket();
  const tradePage = useTradePage();
  const [outputTicker, pricePrecision] = useMemo(
    () =>
      market ? [market.symbol, market.pricePrecision] : ["", DEFAULT_PRECISION],
    [market]
  );

  const [value, quantity] = useMemo(
    () =>
      tradePage
        ? [tradePage.minPositionValue, tradePage.minPositionQuantity]
        : ["-", "-"],
    [tradePage]
  );

  return (
    <InfoItem
      label={"Minimum position size:"}
      balanceExact={formatPrice(
        value,
        pricePrecision,
        false,
        RoundMode.ROUND_UP
      )}
      amount={`${value} ${collateralCurrency?.symbol} (${toBN(quantity).eq(0) ? "-" : quantity
        } ${outputTicker})`}
      onClick={(value) => setTypedValue(value, InputField.PRICE)}
    />
  );
}
