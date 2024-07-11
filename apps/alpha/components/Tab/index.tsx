import styled from "styled-components";
import { RowCenter, RowStart } from "components/Row";
import { lighten } from "polished";
import { PositionType } from "@symmio/frontend-sdk/types/trade";

export const TabWrapper = styled(RowCenter)`
  width: unset;
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text0};
  border-radius: 0px;
  overflow: hidden;
`;

export const TabButton = styled(RowCenter)<{
  active: boolean;
  hideOuterBorder?: boolean;
  height?: string;
}>`
  width: 100%;
  height: ${({ height }) => height ?? "40px"};
  position: relative;
  text-align: center;
  overflow: hidden;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  color: ${({ active, theme }) => (active ? theme.text0 : theme.text4)};
  background: ${({ active, theme }) => (active ? theme.bg0 : theme.bg1)};
  border: 1px solid
    ${({ theme, active, hideOuterBorder }) =>
      hideOuterBorder ? (active ? theme.chartStroke : "transparent") : "none"};

  &:hover {
    cursor: ${({ active }) => (active ? "default" : "pointer")};
    background: ${({ active, theme }) =>
      active ? theme.bg0 : lighten(0.02, theme.bg1)};
  }
`;

const ModalTabButton = styled(TabButton)<{ type: string }>`
  border: none;
  background: ${({ active, theme, type }) =>
    active
      ? type === PositionType.LONG
        ? theme.greenButton
        : theme.redButton
      : theme.bg2};

  &:hover {
    cursor: ${({ active }) => (active ? "default" : "pointer")};
    background: ${({ active, theme, type }) =>
      active
        ? type === PositionType.LONG
          ? theme.greenButton
          : theme.redButton
        : lighten(0.02, theme.bg1)};
  }
`;

const ModalButton = styled(TabButton)`
  height: 32px;
  color: ${({ active, theme }) => (active ? theme.text0 : theme.primary4)};
  background: ${({ active, theme }) => (active ? theme.bg0 : theme.bg2)};
  border: 1px solid
    ${({ active, theme }) => (active ? theme.chartStroke : "none")};
`;

export const Option = styled.div<{ active?: boolean }>`
  width: fit-content;
  color: ${({ theme }) => theme.text1};
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  padding: 4px 0px 8px 0px;

  ${({ active, theme }) =>
    active &&
    `
    color: ${theme.text0};
  `}
  &:hover {
    cursor: pointer;
    color: ${({ theme, active }) => (active ? theme.gradLight : theme.text1)};
  }
`;

export function Tab({
  tabOptions,
  activeOption,
  onChange,
  height,
  hideOuterBorder,
}: {
  tabOptions: string[];
  activeOption: string;
  onChange: (tab: string) => void;
  height?: string;
  hideOuterBorder?: boolean;
}): JSX.Element {
  return (
    <TabWrapper>
      {tabOptions.map((tab, i) => (
        <TabButton
          key={i}
          active={tab === activeOption}
          onClick={() => onChange(tab)}
          height={height}
          hideOuterBorder={!!hideOuterBorder}
        >
          {tab}
        </TabButton>
      ))}
    </TabWrapper>
  );
}

export function TabModal({
  tabOptions,
  activeOption,
  onChange,
  hideOuterBorder,
  ...rest
}: {
  tabOptions: string[];
  activeOption: string;
  onChange: (tab: string) => void;
  hideOuterBorder?: boolean;
  [x: string]: any;
}): JSX.Element {
  return (
    <TabWrapper width={"100%"} justifyContent={"space-between"} {...rest}>
      {tabOptions.map((tab, i) => (
        <ModalButton
          key={i}
          active={tab === activeOption}
          onClick={() => onChange(tab)}
          hideOuterBorder={!!hideOuterBorder}
        >
          <div>{tab}</div>
        </ModalButton>
      ))}
    </TabWrapper>
  );
}

export function GradientTabs({
  tabOptions,
  activeOption,
  onChange,
}: {
  tabOptions: string[];
  activeOption: string;
  onChange: (tab: string) => void;
}) {
  return (
    <RowStart style={{ gap: "16px" }}>
      {tabOptions.map((option, index) => (
        <Option
          key={index}
          active={option === activeOption}
          onClick={() => onChange(option)}
        >
          {option}
        </Option>
      ))}
    </RowStart>
  );
}

export function TabModalJSX({
  tabOptions,
  activeOption,
  onChange,
  hideOuterBorder,
  ...rest
}: {
  tabOptions: { label: string; content: string | JSX.Element }[];
  activeOption: string;
  onChange: (tab: string) => void;
  hideOuterBorder?: boolean;
  [x: string]: any;
}): JSX.Element {
  return (
    <TabWrapper width={"100%"} justifyContent={"space-between"} {...rest}>
      {tabOptions.map((tab, i) => (
        <ModalTabButton
          key={i}
          type={tab.label}
          active={tab.label === activeOption}
          onClick={() => onChange(tab.label)}
          hideOuterBorder={!!hideOuterBorder}
        >
          <div>{tab.content}</div>
        </ModalTabButton>
      ))}
    </TabWrapper>
  );
}
