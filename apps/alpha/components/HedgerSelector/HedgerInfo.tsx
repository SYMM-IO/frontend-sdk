import styled from "styled-components";
import { Z_INDEX } from "theme";

import { RowBetween, RowCenter, RowStart } from "components/Row";

const HedgerInfoWrapper = styled.div<{ active?: boolean }>`
  position: relative;
  padding: 12px;
  margin: 8px 0px;
  border-radius: 3px;
  cursor: pointer;
  background: ${({ theme, active }) => (active ? theme.bg6 : theme.bg3)};
  border: 1px solid ${({ theme, active }) => (active ? theme.text0 : theme.bg7)};
  z-index: ${Z_INDEX.tooltip};
`;

const Row = styled(RowBetween)`
  flex-flow: row nowrap;
  margin-bottom: 8px;
  gap: 0.5rem;
`;

const Value = styled(RowStart)`
  font-size: 12px;
  color: ${({ theme }) => theme.text0};
`;

const Button = styled(RowCenter)`
  width: 20%;
  font-size: 12px;
  border-radius: 4px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg3};
  border: 1px solid ${({ theme }) => theme.text0};
`;

export default function HedgerInfo({
  data,
  active,
  onClick,
  onRemoveClick,
}: {
  data: { address: string; name: string };
  active: boolean;
  onClick: () => void;
  onRemoveClick?: () => void;
}): JSX.Element {
  return (
    <HedgerInfoWrapper active={active} onClick={onClick}>
      <Row>
        <Value>{data.name}</Value>
      </Row>
      <Row>
        <Value>{data.address}</Value>
        {onRemoveClick && <Button onClick={onRemoveClick}>Remove</Button>}
      </Row>
    </HedgerInfoWrapper>
  );
}
