import React from "react";
import styled, { useTheme } from "styled-components";

import { useActiveMarket } from "@symmio/frontend-sdk/state/trade/hooks";
import { useFundingRateData } from "@symmio/frontend-sdk/state/hedger/hooks";
import { getRemainingTime } from "@symmio/frontend-sdk/utils/time";
import {
  BN_ZERO,
  formatAmount,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";

import { Name } from ".";
import { Row } from "components/Row";
import Column from "components/Column";
import { Info as InfoIcon } from "components/Icons";
import { ToolTip } from "components/ToolTip";

const DataRow = styled(Row)`
  gap: 4px;
  font-size: 10px;
`;

const Value = styled.div<{
  color?: string;
  size?: string;
}>`
  color: ${({ theme, color }) => color ?? theme.text0};
  ${({ size }) =>
    size &&
    `
  font-size: ${size};
`}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`;

const StyledInfoIcon = styled(InfoIcon)`
  color: ${({ theme }) => theme.text2};
  width: 12px;
  height: 12px;
  margin: 4px 4px 0px 4px;
  cursor: default;
`;

export default function MarketFundingRate() {
  const activeMarket = useActiveMarket();
  const { name } = activeMarket || {};
  const fundingRate = useFundingRateData(name);
  const { diff, hours, minutes, seconds } = getRemainingTime(
    fundingRate?.next_funding_time || 0
  );

  const nextFundingRateLongBN = fundingRate
    ? toBN(fundingRate.next_funding_rate_long)
    : BN_ZERO;
  const nextFundingRateShortBN = fundingRate
    ? toBN(fundingRate.next_funding_rate_short)
    : BN_ZERO;
  const longColor = useColor(nextFundingRateLongBN.toString());
  const shortColor = useColor(nextFundingRateShortBN.toString());

  return (
    <>
      <Column>
        <Name>
          Funding
          <a data-tip data-for={"funding"}>
            <StyledInfoIcon />
            <ToolTip id={"funding"} aria-haspopup="true">
              <div>When the funding countdown goes to 0.</div>
              <div>Green (+) means you get paid.</div>
              <div>Red (-) means you should pay.</div>
            </ToolTip>
          </a>
        </Name>
        <Column>
          <DataRow>
            <Value size={"12px"} color={longColor}>
              {fundingRate
                ? `${formatAmount(
                    nextFundingRateLongBN.times(100).toFixed(4)
                  )}%`
                : "-"}
            </Value>
            (LONG)
          </DataRow>
          <DataRow>
            <Value size={"12px"} color={shortColor}>
              {fundingRate
                ? `${formatAmount(
                    nextFundingRateShortBN.times(100).toFixed(4)
                  )}%`
                : "-"}
            </Value>
            (SHORT)
          </DataRow>
        </Column>
      </Column>
      <Column>
        <Name>Next funding</Name>
        <Value size={"12px"}>
          {fundingRate && !nextFundingRateLongBN.isNaN()
            ? `${
                diff > 0 &&
                ` ${hours.toString().padStart(2, "0")}:${minutes
                  .toString()
                  .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
              }`
            : "-"}
        </Value>
      </Column>
    </>
  );
}

function useColor(value: string) {
  const theme = useTheme();
  const valueBN = toBN(value);

  if (valueBN.isEqualTo(0)) return theme.text0;
  else if (valueBN.isGreaterThan(0)) return theme.green1;
  else return theme.red1;
}
