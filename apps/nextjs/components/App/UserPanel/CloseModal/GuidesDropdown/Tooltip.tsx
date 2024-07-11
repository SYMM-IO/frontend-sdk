import React from "react";
import styled from "styled-components";

import { Info as InfoIcon } from "components/Icons";

interface TooltipProps {
  text: string;
}

const Wrapper = styled.div`
  position: relative;
  padding-top: 2px;

  .TooltipCloseModal {
    display: none;
  }

  &:hover {
    .TooltipCloseModal {
      display: flex;
    }
  }
`;

const StyledInfoIcon = styled(InfoIcon)`
  color: ${({ theme }) => theme.text2};
  width: 12px;
  height: 12px;
  margin: 0px 4px 0px 4px;
  cursor: default;
`;

const Tooltip = styled.div`
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
  position: absolute;
  top: -15px;
  left: 20px;
  width: 200px;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  color: ${({ theme }) => theme.white} !important;
  background: ${({ theme }) => theme.bg6} !important;
`;

const ToolTip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <>
      <Wrapper>
        <StyledInfoIcon />
        <Tooltip className={"TooltipCloseModal"}>{text}</Tooltip>
      </Wrapper>
    </>
  );
};

export default ToolTip;
