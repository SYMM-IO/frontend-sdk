import styled from "styled-components";

import { RowBetween, RowStart } from "components/Row";
import ToolTip from "./GuidesDropdown/Tooltip";

export const DataRow = styled(RowBetween)`
  flex-flow: row nowrap;
  padding: 0px 3px;
`;

export const Label = styled(RowStart)`
  width: 45%;
  font-size: 12px;
  font-weight: 400;
  justify-self: start;
  color: ${({ theme }) => theme.text3};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 60%;
  `};
`;

export const Value = styled.div<{ color?: string; cursor?: string }>`
  font-size: 12px;
  justify-self: end;
  color: ${({ theme }) => theme.text0};
`;

export default function Item({
  label,
  amount,
  ticker,
  tooltip,
}: {
  label: string | JSX.Element;
  amount: string | JSX.Element;
  ticker?: string;
  tooltip?: string;
}): JSX.Element {
  return (
    <DataRow>
      <Label>
        {label}
        {tooltip && <ToolTip text={tooltip} />}
      </Label>
      <Value>
        {amount} {ticker && ` ${ticker}`}
      </Value>
    </DataRow>
  );
}
