import styled from "styled-components";

import { RowBetween } from "components/Row";

const Box = styled(RowBetween)`
  flex-flow: row nowrap;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 4px;
  padding: 20px;
  color: ${({ theme }) => theme.text2};
  overflow: hidden;
  white-space: nowrap;
`;

export default Box;
