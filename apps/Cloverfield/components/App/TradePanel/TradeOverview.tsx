import { useMemo } from "react";
import styled from "styled-components";

import {
  BN_ZERO,
  formatAmount,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";
import { OrderType } from "@symmio/frontend-sdk/types/trade";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useActiveMarket,
  useLimitPrice,
  useOrderType,
} from "@symmio/frontend-sdk/state/trade/hooks";
import useTradePage, {
  useLockedValues,
  useNotionalValue,
} from "@symmio/frontend-sdk/hooks/useTradePage";

import InfoItem from "components/InfoItem";
import { Column } from "components/Column";
import { RowBetween, RowEnd } from "components/Row";
import { useLeverage } from "@symmio/frontend-sdk/state/user/hooks";

const Wrapper = styled(Column)`
  padding: 0px;
  gap: 16px;
`;

const PositionWrap = styled(RowBetween)`
  font-size: 12px;
  font-weight: 400;
  padding: 0px 3px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text3};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

const PositionValue = styled(RowEnd)`
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.text3};
  & > * {
    &:last-child {
      font-weight: 500;
      color: ${({ theme }) => theme.text0};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

export default function TradeOverview() {
  const { chainId } = useActiveWagmi();
  const market = useActiveMarket();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const limitPrice = useLimitPrice();
  const orderType = useOrderType();

  const { price: markPrice, formattedAmounts } = useTradePage();

  const price = useMemo(
    () => (orderType === OrderType.MARKET ? markPrice : limitPrice),
    [orderType, markPrice, limitPrice]
  );

  const quantityAsset = useMemo(
    () =>
      toBN(formattedAmounts[1]).isNaN() ? BN_ZERO : toBN(formattedAmounts[1]),
    [formattedAmounts]
  );
  const notionalValue = useNotionalValue(quantityAsset.toString(), price);
  const { cva, lf } = useLockedValues(notionalValue);
  const tradingFee = useMemo(
    () =>
      market?.tradingFee
        ? toBN(notionalValue).times(market.tradingFee).toString()
        : "0",
    [notionalValue, market]
  );
  const userLeverage = useLeverage();

  return (
    <>
      <Wrapper>
        <PositionWrap>
          <div>Position Value:</div>
          <PositionValue>
            <div>{`${
              toBN(formattedAmounts[0]).isNaN()
                ? "0"
                : toBN(formattedAmounts[0]).toFormat()
            } x ${userLeverage} =`}</div>
            <div>
              {`${
                toBN(formattedAmounts[0]).isNaN() || toBN(userLeverage).isNaN()
                  ? 0
                  : toBN(formattedAmounts[0]).times(userLeverage).toFormat()
              } ${collateralCurrency?.symbol}`}
            </div>
          </PositionValue>
        </PositionWrap>

        <InfoItem
          label="Maintenance Margin (CVA):"
          amount={`${
            !toBN(cva).isNaN() && !toBN(lf).isNaN()
              ? formatAmount(toBN(cva).plus(lf))
              : "0"
          } ${collateralCurrency?.symbol}`}
          // tooltip="Maintenance Margin"
        />

        <InfoItem
          label="Platform Fee:"
          amount={`${
            !toBN(tradingFee).isNaN()
              ? `${formatAmount(
                  toBN(tradingFee).div(2),
                  3,
                  true
                )} (OPEN) / ${formatAmount(
                  toBN(tradingFee).div(2),
                  3,
                  true
                )} (CLOSE) ${collateralCurrency?.symbol}`
              : `0 (OPEN) / 0 (CLOSE) ${collateralCurrency?.symbol}`
          }`}
          // tooltip="Platform Fee"
        />
      </Wrapper>
    </>
  );
}
