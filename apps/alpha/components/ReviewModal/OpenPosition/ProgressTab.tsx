import { useContext } from "react";
import styled from "styled-components";

import { ModalState, StateContext } from "./ModalData";

import Column from "components/Column";
import { Row, RowCenter } from "components/Row";

const GeneralStateBox = styled(RowCenter)`
  height: 28px;
  font-size: 10px;
  font-weight: 400;
  border-radius: 4px;
`;

const StateBox1 = styled(GeneralStateBox)<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.primaryDisable : theme.text0};
  background: ${({ disabled, theme }) =>
    disabled ? theme.primaryDarkBg : theme.bg7};
`;

const StateBox2 = styled(GeneralStateBox)<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) => (disabled ? theme.text4 : theme.text0)};
  background: ${({ disabled, theme }) => (disabled ? theme.bg2 : theme.bg7)};
`;

const Container = styled(Column)`
  gap: 8px;
`;

const Separator = styled.div`
  height: 2px;
  border-radius: 4px;
  background: ${({ theme }) => theme.border2};
`;

const GeneralStateSeparator = styled(Row)<{ state: ModalState }>`
  width: 10%;
  height: 2px;
  margin: auto 0px;
  max-width: 10px;
`;

const StateSeparator1 = styled(GeneralStateSeparator)<{ state?: ModalState }>`
  background: ${({ state, theme }) =>
    state === ModalState.START
      ? theme.bg2
      : state === ModalState.LOADING
      ? theme.bg7
      : theme.primaryDarkBg};
`;

const StateSeparator2 = styled(GeneralStateSeparator)<{ state?: ModalState }>`
  background: ${({ state, theme }) =>
    state === ModalState.END ? theme.primaryDarkBg : theme.bg2};
`;

export default function ProgressTab() {
  const { state } = useContext(StateContext);
  return (
    <Container>
      <Row>
        <StateBox1 disabled={state === ModalState.END}>
          {state === ModalState.START
            ? "Open Position"
            : state === ModalState.LOADING
            ? "Opening Position..."
            : "Open Position Trx Confirmed"}
        </StateBox1>
        <StateSeparator1 state={state} />
        <StateSeparator2 state={state} />
        <StateBox2 disabled={state !== ModalState.END}>
          Set Stop-Loss (Delta-Neutral)
        </StateBox2>
      </Row>
      <Separator />
    </Container>
  );
}
