import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { mix } from "polished";

import { WEB_SETTING } from "@symmio/frontend-sdk/config";

import { calculateString, calculationPattern } from "utils/calculationalString";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { APP_NAME } from "constants/chains/misc";
import {
  DEFAULT_PRECISION,
  MAX_LEVERAGE_VALUE,
  MIN_LEVERAGE_VALUE,
} from "@symmio/frontend-sdk/constants/misc";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { InputField, OrderType } from "@symmio/frontend-sdk/types/trade";

import {
  useExpertMode,
  useLeverage,
  useSetLeverageCallback,
} from "@symmio/frontend-sdk/state/user/hooks";
import {
  useOrderType,
  useActiveMarket,
  useSetTypedValue,
  useGetLockedPercentages,
} from "@symmio/frontend-sdk/state/trade/hooks";

import useTradePage from "@symmio/frontend-sdk/hooks/useTradePage";
import useDebounce from "@symmio/frontend-sdk/lib/hooks/useDebounce";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { LeverageIcon } from "components/Icons";
import { InputAmount } from "components/ReviewModal";
import LimitPriceBox from "components/App/TradePanel/LimitPanel";
import { InputLabel as ReceiveLabel } from "components/InputLabel";
import MarketPriceBox from "components/App/TradePanel/MarketPanel";
import { LeverageSlider } from "components/App/TradePanel/LeverageSlider";
import { CustomInputBox2 as CollateralInput } from "components/InputBox";
import { RowStart } from "components/Row";

const CollateralWrap = styled.div`
  & > * {
    &:first-child {
      margin-bottom: 4px;
    }
    &:nth-child(2) {
      position: relative;
      margin: 0 auto;
      margin-top: -17px;
    }
    &:nth-child(3) {
      margin-top: -13px;
    }
  }
`;

const LeverageWrap = styled.div`
  font-weight: 400;
  font-size: 12px;
  border-radius: 4px;
  padding: 8px 10px;
  height: 70px;
  background: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text0};
`;

const LeverageValue = styled(RowStart)`
  width: 84px;
  height: 28px;
  font-size: 12px;
  padding: 8px;
  padding-left: 12px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg5};
  border: 2px solid ${({ theme }) => theme.bg};
`;

const LeverageInput = styled(InputAmount)`
  font-weight: 500;
  font-size: 14px;
  text-align: left;
  background: "transparent";
  color: ${({ theme }) => theme.text0};
`;
export default function AmountsPanel() {
  const { chainId } = useActiveWagmi();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const market = useActiveMarket();
  const userExpertMode = useExpertMode();

  const orderType = useOrderType();

  const userLeverage = useLeverage();
  const setLeverageCallback = useSetLeverageCallback();

  const [leverage, setLeverage] = useState(userLeverage);
  const debouncedLeverage = useDebounce(leverage, 10) as number;
  const lockedParamsLeverage = useDebounce(leverage, 300) as number;
  const [customLeverage, setCustomLeverage] = useState<string | number>(
    leverage
  );
  const [calculationMode, setCalculationMode] = useState(false);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const setTypedValue = useSetTypedValue();

  const getLockedPercentages = useGetLockedPercentages(lockedParamsLeverage);

  useEffect(() => {
    const controller = new AbortController();
    if (market && lockedParamsLeverage)
      getLockedPercentages({
        signal: controller.signal,
        headers: [["App-Name", APP_NAME]],
      });
    return () => {
      controller.abort();
    };
  }, [market, lockedParamsLeverage, getLockedPercentages]);

  const { formattedAmounts, balance } = useTradePage();

  const [outputTicker, pricePrecision, quantityPrecision, maxLeverage] =
    useMemo(() => {
      if (market) {
        const { symbol, pricePrecision, quantityPrecision, maxLeverage } =
          market;
        if (userExpertMode) return [symbol, undefined, undefined, maxLeverage];
        return [symbol, pricePrecision, quantityPrecision, maxLeverage];
      }
      return ["", DEFAULT_PRECISION, DEFAULT_PRECISION, MAX_LEVERAGE_VALUE];
    }, [userExpertMode, market]);

  useEffect(() => {
    if (leverage > maxLeverage) setLeverage(5);
  }, [market, maxLeverage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLeverageCallback(debouncedLeverage);
    setCustomLeverage(debouncedLeverage);
  }, [debouncedLeverage, setLeverageCallback]);

  useEffect(() => {
    if (customLeverage) {
      setCustomLeverage(debouncedLeverage);
    }
  }, [debouncedLeverage, customLeverage]);

  const mixedColor = mix(leverage / maxLeverage, "#fd4545", "#6AFF78");

  const handleCustomLeverage = useCallback(
    (e: any) => {
      const value = e.currentTarget.value;
      if (!value) {
        setCustomLeverage("");
        setLeverage(1);
      }
      if (value >= MIN_LEVERAGE_VALUE && value <= maxLeverage) {
        setLeverage(parseInt(value));
        setCustomLeverage(parseInt(value));
      }
    },
    [maxLeverage]
  );

  function onChangeCollateral(value: string) {
    if (calculationPattern.test(value)) {
      setCalculationMode(true);
    } else if (calculationMode) {
      setCalculationMode(false);
    }
    setTypedValue(value, InputField.PRICE);
  }

  function onEnterPress() {
    setCalculationLoading(true);
    setCalculationMode(false);
    const result = calculateString(
      formattedAmounts[0],
      balance,
      pricePrecision,
      "1"
    );
    setTypedValue(result, InputField.PRICE);
    setCalculationLoading(false);
  }

  return (
    <>
      {orderType == OrderType.LIMIT ? <LimitPriceBox /> : <MarketPriceBox />}

      <CollateralWrap>
        <CollateralInput
          value={formattedAmounts[0]}
          precision={pricePrecision}
          title="Amount"
          symbol={collateralCurrency?.symbol}
          balanceTitle="Available:"
          balanceDisplay={
            toBN(balance).gt(0)
              ? formatPrice(balance, pricePrecision, true)
              : "0.0"
          }
          balanceExact={
            toBN(balance).gt(0) ? formatPrice(balance, pricePrecision) : "0"
          }
          max={true}
          calculationEnabled={WEB_SETTING.calculationalInput}
          calculationMode={calculationMode}
          calculationLoading={calculationLoading}
          onChange={onChangeCollateral}
          onEnterPress={onEnterPress}
        />

        <LeverageValue>
          <LeverageInput
            value={
              !customLeverage || toBN(customLeverage).lt(0)
                ? ""
                : customLeverage
            }
            onChange={(e) => handleCustomLeverage(e)}
            placeholder={customLeverage ? customLeverage.toString() : "1"}
            onBlur={() => {
              if (!customLeverage) setCustomLeverage(MIN_LEVERAGE_VALUE);
            }}
          />
          <LeverageIcon width={10} height={10} color={mixedColor} />
        </LeverageValue>

        <LeverageWrap>
          <div>Leverage</div>
          <LeverageSlider
            value={leverage}
            maxLeverage={maxLeverage}
            onChange={setLeverage}
            mixedColor={mixedColor}
          />
        </LeverageWrap>
      </CollateralWrap>

      <ReceiveLabel
        label="Receive"
        value={formattedAmounts[1]}
        onChange={(value) => setTypedValue(value, InputField.QUANTITY)}
        symbol={outputTicker}
        precision={quantityPrecision}
      />
    </>
  );
}
