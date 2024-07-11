import { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { Z_INDEX } from "theme";

import {
  Account as AccountType,
  BalanceInfo,
} from "@symmio/frontend-sdk/types/user";
import { ApiState } from "@symmio/frontend-sdk/types/api";
import { useCustomAccountUpnl } from "@symmio/frontend-sdk/state/user/hooks";
import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";

import { RowBetween, RowEnd, RowStart } from "components/Row";
import { Loader } from "components/Icons";

const AccountWrapper = styled.div<{ active?: boolean }>`
  position: relative;
  padding: 12px;
  height: 82px;
  margin: 8px 0px;
  border-radius: 3px;
  background: ${({ theme, active }) => (active ? theme.bg3 : theme.bg2)};

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
  const customAccount = useCustomAccountUpnl(account.accountAddress);

  const [value, color] = useMemo(() => {
    const upnlBN = toBN(customAccount?.upnl || 0);

    if (upnlBN.isGreaterThan(0))
      return [`+ $${formatAmount(upnlBN)}`, theme.green1];
    else if (upnlBN.isLessThan(0))
      return [`- $${formatAmount(Math.abs(upnlBN.toNumber()))}`, theme.red1];
    return [`-`, undefined];
  }, [customAccount?.upnl, theme]);

  const { availableForOrder, lockedMargin } = useMemo(() => {
    if (!balanceInfo || balanceInfoStatus !== ApiState.OK)
      return { availableForOrder: undefined, lockedMargin: undefined };

    let availableForOrder = "0";
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
    const upnlBN = value ? toBN(value) : toBN(upnl);

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
    return { availableForOrder, lockedMargin: mm };
  }, [balanceInfo, balanceInfoStatus, value]);

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
