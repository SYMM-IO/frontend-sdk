import React from "react";
import styled from "styled-components";

import { Row, RowCenter, RowEnd } from "components/Row";
import { AlphaLogo } from "components/Icons";

const AutoSlippageContainer = styled.div`
  padding: 1px;
  width: 125px;
  height: 28px;
  border-radius: 4px;
`;

const AutoSlippageWrapper = styled(Row)`
  height: 100%;
  font-size: 10px;
  padding: 0px 6px;
  border-radius: 4px;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.bg1};
`;

export default function SlippageTolerance() {
  return (
    <AutoSlippageContainer>
      <AutoSlippageWrapper>
        <RowCenter>Auto slippage</RowCenter>
        <RowEnd width={"20%"}>
          <AlphaLogo width={12} height={13} />
        </RowEnd>
      </AutoSlippageWrapper>
    </AutoSlippageContainer>
  );
}
