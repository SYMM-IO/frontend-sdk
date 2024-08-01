import { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { Z_INDEX } from "theme";

import {
  Account as AccountType,
  BalanceInfo,
} from "@symmio/frontend-sdk/types/user";

import { RowBetween, RowEnd, RowStart } from "components/Row";
import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { ApiState } from "@symmio/frontend-sdk/types/api";
import { Loader } from "components/Icons";

const AccountWrapper = styled.div<{ active?: boolean }>`
  position: relative;
  padding: 12px;
  height: 82px;
  margin: 8px 0px;
  border-radius: 3px;
  background: ${({ theme, active }) => (active ? theme.bg6 : theme.bg3)};
  border: 1px solid ${({ theme, active }) => (active ? theme.text0 : theme.bg7)};
  z-index: ${Z_INDEX.tooltip};
`;

const Row = styled(RowBetween)`
  flex-flow: row nowrap;
  margin-bottom: 8px;
  gap: 0.5rem;
`;

const Label = styled(RowStart)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`;

const Value = styled(RowEnd)`
  font-size: 12px;
  color: ${({ theme }) => theme.text0};
`;

const UpnlText = styled(RowEnd)`
  font-size: 10px;
  color: ${({ theme }) => theme.text3};
`;

const UpnlValue = styled.div<{ color?: string }>`
  font-size: 12px;
  justify-self: end;
  margin-left: 4px;
  color: ${({ theme, color }) => color ?? theme.text1};
`;
export default function Account({
  account,
  balanceInfo,
  balanceInfoStatus,
  active,
  onClick,
}: {
  account: AccountType;
  balanceInfo: BalanceInfo;
  balanceInfoStatus: ApiState;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  const theme = useTheme();

  const { availableForOrder, lockedMargin, value, color } = useMemo(() => {
    if (!balanceInfo || balanceInfoStatus !== ApiState.OK)
      return { availableForOrder: undefined, lockedMargin: undefined };

    let availableForOrder = "0";
    let value = "0";
    let color: string | undefined = undefined;
    const {
      allocatedBalance,
      mm,
      cva,
      lf,
      pendingCva,
      pendingLf,
      pendingMm,
      upnl,
    } = balanceInfo;
    const upnlBN = toBN(upnl);

    if (upnlBN.isGreaterThan(0)) {
      value = `+ $${formatAmount(upnlBN)}`;
      color = theme.green1;
    } else if (upnlBN.isLessThan(0)) {
      value = `- $${formatAmount(Math.abs(upnlBN.toNumber()))}`;
      color = theme.red1;
    }

    if (upnlBN.isGreaterThanOrEqualTo(0))
      availableForOrder = toBN(allocatedBalance)
        .plus(upnlBN)
        .minus(cva)
        .minus(lf)
        .minus(mm)
        .minus(pendingCva)
        .minus(pendingLf)
        .minus(pendingMm)
        .toString();
    else {
      const considering_mm = upnlBN.times(-1).minus(mm).gt(0)
        ? upnlBN.times(-1)
        : mm;
      availableForOrder = toBN(allocatedBalance)
        .minus(cva)
        .minus(lf)
        .minus(pendingCva)
        .minus(pendingLf)
        .minus(pendingMm)
        .minus(considering_mm)
        .toString();
    }
    return { availableForOrder, lockedMargin: mm, value, color };
  }, [balanceInfo, balanceInfoStatus, theme.green1, theme.red1]);

  return (
    <AccountWrapper active={active} onClick={onClick}>
      <Row>
        <Label style={{ color: theme.text0 }}>{account.name}</Label>

        <UpnlText>
          uPNL:
          <UpnlValue color={color}>{value}</UpnlValue>
        </UpnlText>
      </Row>
      <Row>
        <Label>Available for Orders:</Label>
        <Value>
          {balanceInfoStatus === ApiState.LOADING ? (
            <Loader size={"12px"} stroke={theme.text0} />
          ) : availableForOrder ? (
            "$" + formatAmount(availableForOrder || 0, 4)
          ) : (
            "-"
          )}
        </Value>
      </Row>
      <Row>
        <Label>Locked Margin: </Label>
        <Value>
          {balanceInfoStatus === ApiState.LOADING ? (
            <Loader size={"12px"} stroke={theme.text0} />
          ) : lockedMargin ? (
            "$" + formatAmount(lockedMargin || 0, 4)
          ) : (
            "-"
          )}
        </Value>
      </Row>
    </AccountWrapper>
  );
}
