import styled from "styled-components";

export const GeneralContainer = styled.div<{ height?: string; width?: string }>`
  display: inline-block;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
`;

export const DefaultContainer = styled(GeneralContainer)`
  background-color: ${({ theme }) => theme.bg0};
  border-radius: 4px;
`;

export const DefaultHeader = styled.h2`
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.text0};
  padding: 16px 12px 0;
`;
