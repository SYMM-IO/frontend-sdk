import { Row } from "components/Row";
import styled, { keyframes } from "styled-components";

const Wrapper = styled(Row)`
  gap: 8px;
  margin-left: 15px;
  width: unset;
`;
const Input = styled.input`
  height: 0;
  width: 0;
  opacity: 0;
  z-index: -1;
`;

const Label = styled.label<{ disabled?: boolean }>`
  position: relative;
  display: inline-block;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
`;

const rotate = keyframes`
 from {
    opacity: 0;
    transform: rotate(0deg);
  }
  to {
    opacity: 1;
    transform: rotate(45deg);
  }
`;

const Indicator = styled.div<{ checked?: boolean; disabled: boolean }>`
  width: 20px;
  height: 20px;
  background: ${({ theme, checked }) => (checked ? theme.blue1 : "unset")};
  border: 2px solid
    ${({ theme, disabled }) => (disabled ? theme.text2 : theme.blue2)};
  position: absolute;
  top: 0em;
  left: -1.6em;
  border-radius: 2px;

  &::after {
    content: "";
    position: absolute;
    display: none;
  }

  ${Input}:checked + &::after {
    display: block;
    width: 30%;
    height: 70%;
    top: 2px;
    left: 5px;
    border: solid black;
    border-width: 0 0.2em 0.2em 0;
    animation-name: ${rotate};
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
  }
  &::disabled {
    cursor: not-allowed;
  }
`;

const Text = styled.div<{ disabled: boolean }>`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme, disabled }) => (disabled ? theme.text2 : theme.white)};
  text-align: center;
  height: 100%;
  margin-top: 5px;
`;
export default function Checkbox({
  checked,
  onChange,
  className,
  disabled,
  label,
}: {
  checked?: boolean;
  onChange: (...arg: any) => void;
  className?: string;
  disabled: boolean;
  label?: string;
}) {
  return (
    <Wrapper>
      <Label disabled={disabled}>
        <Input
          className={className}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <Indicator checked={checked} disabled={disabled} />
      </Label>
      <Text disabled={disabled}>{label}</Text>
    </Wrapper>
  );
}
