import styled from "styled-components";
import ReactTooltip from "react-tooltip";

export const ToolTip = styled(ReactTooltip).attrs({
  place: "right",
  type: "info",
  effect: "solid",
  multiline: true,
})`
  color: ${({ theme }) => theme.white} !important;
  background: ${({ theme }) => theme.bg6} !important;
  /* border: 1px solid ${({ theme }) => theme.text2} !important; */
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
  /* max-width: 180px !important; */
  /* border-radius: 4px 4px 4px 0px !important; */
  &::after {
    background-color: #788795 !important;
    width: 6px !important;
    height: 6px !important;
    left: -3px !important;
    margin-top: -3px !important;
  }
`;

export const ToolTipLeft = styled(ReactTooltip).attrs({
  place: "left",
  type: "info",
  effect: "solid",
  multiline: true,
})`
  color: ${({ theme }) => theme.white} !important;
  background: ${({ theme }) => theme.bg6} !important;
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
  &::after {
    background-color: #788795 !important;
    width: 6px !important;
    height: 6px !important;
    left: -3px !important;
    margin-top: -3px !important;
  }
`;
export const ToolTipBottom = styled(ReactTooltip).attrs({
  place: "bottom",
  type: "info",
  effect: "solid",
  multiline: true,
})`
  color: ${({ theme }) => theme.white} !important;
  background: ${({ theme }) => theme.bg6} !important;
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
  &::after {
    background-color: #788795 !important;
    width: 6px !important;
    height: 6px !important;
    left: 50% !important;
    transform: translateX(50%);
    margin-top: 2px !important;
  }
`;
