import { ChangeEvent, useRef } from "react";
import styled from "styled-components";

import { Row } from "components/Row";
import Switch from "components/Switch";

const TRANSITION_TIME = "0.3s";

const Container = styled(Row)<{ height: string }>`
  height: ${({ height }) => height};
  padding: 2px 12px 2px 2px;
  gap: 12px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg4};
`;

const InputBox = styled.div<{ active?: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 4px;
  padding: 6px 8px;
  background-color: ${({ active, theme }) => (active ? theme.bg2 : theme.bg4)};
  font-weight: 400;
  transition: all ${TRANSITION_TIME};
`;

const Label = styled.label<{ active?: boolean; fontSize: string }>`
  position: absolute;
  top: ${({ active }) => (active ? "12px" : "50%")};
  font-size: ${({ active, fontSize }) =>
    active ? fontSize : `${parseInt(fontSize) + 2}px`};
  transform: translateY(-50%);
  transition: all ${TRANSITION_TIME};
`;

const Input = styled.input<{ active?: boolean; fontSize: string }>`
  position: absolute;
  bottom: 6px;
  border: none;
  width: 100%;
  background-color: transparent;
  color: ${({ theme }) => theme.text0};
  font-size: ${({ fontSize }) => fontSize};
  transition: all ${TRANSITION_TIME};

  /* outline is none for now. But later could add better outline (like ring in tailwind) */
  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme, active }) => (active ? theme.text2 : "transparent")};
    font-weight: 400;
    transition: color ${TRANSITION_TIME};
  }
`;

export default function SwitchInput({
  id,
  buttonWidth = "56px",
  buttonHeight = "24px",
  isSwitchOn,
  onSwitchChange,
  switchBackActiveColor,
  switchHandlerActiveColor,
  boxHeight = "60px",
  label,
  labelFontSize = "12px",
  value,
  onValueChange,
  valueFontSize = "14px",
  placeholder,
}: {
  id: string;
  buttonWidth?: string;
  buttonHeight?: string;
  isSwitchOn: boolean;
  onSwitchChange: () => any;
  switchBackActiveColor?: string;
  switchHandlerActiveColor?: string;
  boxHeight?: string;
  label: string;
  labelFontSize?: string;
  valueFontSize?: string;
  value: string;
  onValueChange: (e: ChangeEvent<HTMLInputElement>) => any;
  placeholder: string;
}) {
  // INPUT_ID not change on each re-render
  const INPUT_ID = useRef(`${id}-${Math.floor(Math.random() * 999999 + 1)}`);

  return (
    <Container height={boxHeight}>
      <InputBox active={isSwitchOn}>
        <Label
          htmlFor={INPUT_ID.current}
          active={isSwitchOn}
          fontSize={labelFontSize}
        >
          {label}
        </Label>
        <Input
          type="text"
          id={INPUT_ID.current}
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          active={isSwitchOn}
          disabled={!isSwitchOn}
          fontSize={valueFontSize}
        />
      </InputBox>
      <Switch
        width={buttonWidth}
        height={buttonHeight}
        on={isSwitchOn}
        onClick={onSwitchChange}
        backActiveColor={switchBackActiveColor}
        handlerActiveColor={switchHandlerActiveColor}
      />
    </Container>
  );
}
