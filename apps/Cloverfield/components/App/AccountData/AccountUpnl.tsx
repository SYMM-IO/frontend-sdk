import { useMemo } from "react";
import styled, { useTheme } from "styled-components";

import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { useAccountUpnl } from "@symmio/frontend-sdk/state/user/hooks";

export const UpnlValue = styled.div<{ color?: string; size?: string }>`
  font-weight: 500;
  overflow-y: scroll;
  font-size: ${({ size }) => size ?? "14px"};
  color: ${({ theme, color }) => color ?? theme.text0};
  ${({ theme, size }) => theme.mediaWidth.upToMedium`
    font-size: ${size ?? "12px"};
  `};
`;

export default function AccountUpnl({ size }: { size?: string }) {
  const theme = useTheme();
  const { upnl } = useAccountUpnl();

  const [value, color] = useMemo(() => {
    const upnlBN = toBN(upnl);
    if (upnlBN.isGreaterThan(0))
      return [`+ $${formatAmount(upnlBN)}`, theme.green1];
    else if (upnlBN.isLessThan(0))
      return [`- $${formatAmount(Math.abs(upnlBN.toNumber()))}`, theme.red1];
    return [`$${formatAmount(upnlBN)}`, undefined];
  }, [upnl, theme]);

  return (
    <UpnlValue color={color} size={size}>
      {value}
    </UpnlValue>
  );
}
