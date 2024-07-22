import styled from "styled-components";

import Column from "components/Column";
import { RowCenter } from "components/Row";
import { AlphaLottie } from "components/Icons";
import ActionButton from "./ActionButton";

const SummaryWrap = styled(RowCenter)`
  font-size: 14px;
  color: ${({ theme }) => theme.text0};
  text-align: center;
  font-style: normal;
  font-weight: 400;
`;

const ButtonWrap = styled.div`
  margin-top: 100px;
`;

export default function Loading({ summary }: { summary: React.ReactText }) {
  return (
    <Column>
      <AlphaLottie />
      <SummaryWrap>{summary}</SummaryWrap>
      <ButtonWrap>
        <ActionButton />
      </ButtonWrap>
    </Column>
  );
}
