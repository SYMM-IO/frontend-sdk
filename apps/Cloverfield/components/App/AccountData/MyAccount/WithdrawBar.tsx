import React from "react";
import styled from "styled-components";

import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";

import { Row, RowBetween } from "components/Row";
import WithdrawCooldown from "components/App/AccountData/WithdrawCooldown";

const Container = styled(RowBetween)`
  height: 59px;
  border-radius: 4px;
  padding: 0px 12px 0px 16px;
  background-color: ${({ theme }) => theme.bg1};

  & > * {
    &:nth-child(2) {
      width: 228px;
      ${({ theme }) => theme.mediaWidth.upToSmall`
        width: auto;
        padding: 0 8px;
      `}
    }
  }
`;

const WithdrawAmount = styled(Row)`
  gap: 8px;
  width: unset;
  font-size: 16px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text0};

  & > * {
    &:first-child {
      font-weight: 400;
    }
    &:last-child {
      margin-left: 4px;
      font-weight: 500;
    }
  }
`;

export default function Statusbar() {
  const { chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const { accountBalance } = useAccountPartyAStat(activeAccountAddress);
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  return (
    <Container>
      <WithdrawAmount>
        <span>Withdraw</span>
        <span>
          {formatAmount(accountBalance)} {collateralCurrency?.name}
        </span>
      </WithdrawAmount>
      <WithdrawCooldown formatedAmount={true} text={"Withdraw"} />
    </Container>
  );
}
