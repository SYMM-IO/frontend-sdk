import React from "react";
import styled from "styled-components";

import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";

import useAccountData from "@symmio/frontend-sdk/hooks/useAccountData";

import Emoji from "components/App/AccountData/Emoji";
import { Row, RowBetween, RowEnd } from "components/Row";
import { AccountHealthText } from "components/App/AccountData/AccountOverview";
import ShimmerAnimation from "components/ShimmerAnimation";

const Title = styled(Row)`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.text0};
`;

const DataRow = styled(RowBetween)`
  flex-flow: row nowrap;
  margin: 8px 0;
`;

const AccountHealth = styled(RowEnd)<{ color?: string }>`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme, color }) => color ?? theme.text1};
`;

export default function AccountHealthSection() {
  const {
    accountHealthData: { health: accountHealth, healthColor, healthEmoji },
  } = useAccountData();
  const isAccountHealthNotReady =
    !accountHealth ||
    isNaN(Number(accountHealth)) ||
    Number(accountHealth) === Infinity;

  return (
    <>
      <RowBetween padding={"16px 16px 0"}>
        <Title>Account Overview</Title>
        <DataRow>
          <AccountHealth color={healthColor}>
            <AccountHealthText>Account Health:</AccountHealthText>
            {isAccountHealthNotReady ? (
              <ShimmerAnimation width="75px" height="19px" />
            ) : (
              <>
                <span>{formatAmount(accountHealth, 3)} %</span>
                <Emoji
                  symbol={healthEmoji.symbol}
                  label={healthEmoji.label}
                  style={{ width: "22px", marginLeft: "4px" }}
                />
              </>
            )}
          </AccountHealth>
        </DataRow>
      </RowBetween>
    </>
  );
}
