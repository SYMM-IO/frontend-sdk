import styled, { css } from "styled-components";

const Button = styled.button<{
  width: string;
  height: string;
  active?: boolean;
  activeColor?: string;
}>`
  box-sizing: border-box;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  border-radius: 4px;
  padding: 2px;
  background-color: ${({ theme, active, activeColor }) =>
    active ? activeColor || theme.primaryDarkBg : theme.bg1};
`;

const StyledSwitch = styled.div<{ active?: boolean; activeColor?: string }>`
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 4px 0;
  background-color: ${({ theme, active, activeColor }) =>
    active ? activeColor || theme.CTAPink : theme.bg3};
  color: ${({ theme, active }) => (active ? theme.primaryDarkBg : theme.text2)};
  font-size: 10px;
  font-weight: 400;
  transform: ${({ active }) =>
    active ? css`translateX(100%)` : css`translateX(0)`};
  transition: all 0.3s;
`;

export default function Switch({
  width,
  height,
  on,
  backActiveColor,
  handlerActiveColor,
  onClick,
}: {
  width: string;
  height: string;
  on?: boolean;
  backActiveColor?: string;
  handlerActiveColor?: string;
  onClick: () => any;
}) {
  return (
    <Button
      width={width}
      height={height}
      active={on}
      activeColor={backActiveColor}
      onClick={onClick}
    >
      <StyledSwitch activeColor={handlerActiveColor} active={on}>
        {on ? "ON" : "OFF"}
      </StyledSwitch>
    </Button>
  );
}
