import React from "react";
import styled from "styled-components";

import MarketsTable from "./MarketsTable";
import WrapperBanner from "components/Banner";
import { RowCenter } from "components/Row";

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: auto;
  border-radius: 4px;
`;

const BigMarketsLabel = styled(RowCenter)`
  color: ${({ theme }) => theme.bg1};
  font-size: 136px;
  font-weight: 700;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 100px;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 64px;
  `}
`;

const TableWrapper = styled.div`
  position: relative;
  margin-top: -85px;
  z-index: 9;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: -65px;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: -35px;
  `}
`;

export default function Markets() {
  return (
    <Container>
      <WrapperBanner />
      <BigMarketsLabel>MARKETS</BigMarketsLabel>
      <TableWrapper>
        <MarketsTable />
      </TableWrapper>
    </Container>
  );
}
