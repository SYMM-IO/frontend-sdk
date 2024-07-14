import styled from "styled-components";

import Column from "components/Column";
import { RowCenter } from "components/Row";
import { LottieCloverfield } from "components/Icons";
import { useStopLossValues } from "@symmio/frontend-sdk/state/trade/hooks";

const SummaryWrap = styled(RowCenter)`
  font-size: 14px;
  color: ${({ theme }) => theme.text0};
  text-align: center;
  font-style: normal;
  font-weight: 400;
`;

const ConfirmWrap = styled(SummaryWrap)`
  margin-top: 12px;
  color: ${({ theme }) => theme.text2};
`;

export default function Loading({ summary }: { summary: React.ReactText }) {
  const { isActive } = useStopLossValues();

  return (
    <Column>
      <LottieCloverfield />
      <SummaryWrap>{summary}</SummaryWrap>
      {isActive && (
        <ConfirmWrap>
          once your position got opened you can start to set stop-loss
        </ConfirmWrap>
      )}
    </Column>
  );
}
