import React from "react";
import styled from "styled-components";
import Image from "next/legacy/image";

import DEPOSIT_ICON from "/public/static/images/etc/BalanceHistory/Deposit.svg";
import WITHDRAW_ICON from "/public/static/images/etc/BalanceHistory/Withdraw.svg";
import DEALLOCATE_ICON from "/public/static/images/etc/BalanceHistory/Deallocate.svg";

import { BN_TEN, formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { formatTimestamp } from "@symmio/frontend-sdk/utils/time";
import { ExplorerDataType } from "@symmio/frontend-sdk/utils/explorers";
import {
  BalanceHistoryData,
  BalanceHistoryName,
  BalanceHistoryType,
} from "@symmio/frontend-sdk/state/user/types";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { Row, RowStart } from "components/Row";
import { ExplorerLink } from "components/Link";
import ShimmerAnimation from "components/ShimmerAnimation";
import { useCollateralDecimal } from "@symmio/frontend-sdk/state/chains/hooks";

interface HistoryItemInputs {
  data: BalanceHistoryData;
  currency?: string;
  loading?: boolean;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  column-gap: 4px;
  padding: 12px;
  background: ${({ theme }) => theme.bg1};
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg4};
  }
`;

const Action = styled(RowStart)`
  gap: 16px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    gap: 8px;
  `}
`;

const Icon = styled.div`
  min-width: 16px;
`;

const Label = styled.div`
  border-radius: 2px;
  padding: 6px 8px;
  font-size: 10px;
  font-weight: 500;

  border: 1px solid ${({ theme }) => theme.bg5};
  color: ${({ theme }) => theme.text0};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 8px;
`}
`;

const Amount = styled.div<{ deposit?: boolean }>`
  font-size: 12px;
  font-weight: 400;
  color: ${({ deposit, theme }) => (deposit ? theme.text0 : theme.text1)};
  align-self: center;
`;

const Time = styled.div`
  font-weight: 400;
  font-size: 10px;
  color: ${({ theme }) => theme.text1};
  justify-self: end;
  align-self: center;
`;

export default function BalanceItem({
  data: { amount, timestamp, transaction, type },
  currency,
  loading,
}: HistoryItemInputs): JSX.Element {
  const { chainId } = useActiveWagmi();
  const COLLATERAL_DECIMALS = useCollateralDecimal();
  const isDeposit = type === BalanceHistoryType.DEPOSIT_PARTY_A;
  const iconMap: { [type: string]: any } = {
    [BalanceHistoryType.DEPOSIT_PARTY_A]: DEPOSIT_ICON,
    [BalanceHistoryType.DEALLOCATE_PARTY_A]: DEALLOCATE_ICON,
    [BalanceHistoryType.WITHDRAW_PARTY_A]: WITHDRAW_ICON,
  };

  if (chainId && !loading)
    return (
      <ExplorerLink
        type={ExplorerDataType.TRANSACTION}
        chainId={chainId}
        value={transaction}
      >
        <Container>
          <Action>
            <Icon>
              <Image src={iconMap[type]} alt="balance-history" />
            </Icon>
            <Label>{BalanceHistoryName[type]}</Label>
          </Action>
          <Amount deposit={isDeposit}>
            {type === BalanceHistoryType.DEALLOCATE_PARTY_A
              ? formatAmount(
                  toBN(amount).div(BN_TEN.pow(18)).toString(),
                  undefined,
                  true
                )
              : formatAmount(
                  toBN(amount)
                    .div(BN_TEN.pow(COLLATERAL_DECIMALS[chainId]))
                    .toString(),
                  undefined,
                  true
                )}{" "}
            {currency}
          </Amount>
          <Time>
            {formatTimestamp(Number(timestamp) * 1000, "YYYY-MM-DD HH:mm")}
          </Time>
        </Container>
      </ExplorerLink>
    );
  return (
    <Container>
      <Row gap="14px">
        <ShimmerAnimation width="18px" height="16px" />
        <ShimmerAnimation width="68px" height="16px" />
      </Row>
      <ShimmerAnimation width="68px" height="16px" />
      <Time>
        <ShimmerAnimation width="68px" height="16px" />
      </Time>
    </Container>
  );
}
