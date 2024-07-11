import styled from "styled-components";
import Column from "components/Column";

export const Card = styled(Column)`
  background: ${({ theme }) => theme.bg0};
  border-radius: 2px;
  padding: 24px;
  padding-top: 20px;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `}
`;

export const InnerCard = styled(Column)`
  background: ${({ theme }) => theme.bg4};
  border-radius: 2px;
  padding: 12px;
  padding-bottom: 8px;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 10px;
  `}
`;
