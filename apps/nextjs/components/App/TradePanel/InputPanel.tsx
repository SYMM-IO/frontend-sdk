import styled from "styled-components";
import { MEDIA_WIDTHS } from "theme";
import { isMobile } from "react-device-detect";

import { formatAmount, toBN } from "@symmio/frontend-sdk/utils/numbers";

import useWindowSize from "lib/hooks/useWindowSize";

import { NumericalInput } from "components/Input";
import { RowBetween, RowStart } from "components/Row";

const Wrapper = styled(RowStart)`
  height: 60px;
  font-weight: 500;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  white-space: nowrap;
  flex-flow: column nowrap;
  background: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text1};

  &:active,
  &:focus,
  &:enabled,
  &:hover {
    background: ${({ theme }) => theme.bg6};
  }

  ${({ theme }) =>
    isMobile &&
    `
      background: ${theme.bg3};
  `}
`;

export const Label = styled.div<{
  hover?: boolean;
}>`
  width: fit-content;
  color: ${({ theme }) => theme.text3};
  font-size: 0.8rem;

  &:hover {
    ${({ hover, theme }) =>
      hover &&
      `{
        cursor: pointer;
        color: ${theme.text2}
      `}
  }
`;

const Balance = styled(Label)`
  display: flex;
  font-size: 12px;
`;

const Value = styled.div`
  font-size: 12px;
  margin: 0px 1px;
  color: ${({ theme }) => theme.text1};
`;

const Title = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};

  & > span {
    font-size: 12px;
    margin-left: 1px;
    color: ${({ theme }) => theme.text3};
  }
`;

const Max = styled.span`
  font-size: 12px;
  background: ${({ theme }) => theme.primaryBlue};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export default function InputPanel({
  title,
  label,
  ticker,
  value,
  maxValue,
  disabled,
  onChange,
  mantissa,
  precision,
}: {
  title: string;
  label?: string;
  ticker: string;
  value: string;
  maxValue: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  mantissa?: number;
  precision?: number;
}) {
  const { width } = useWindowSize();

  const onMaxValueClick = () => {
    const maxValueBN = toBN(maxValue);
    if (!precision) onChange(maxValueBN.toFixed());
    else if (maxValueBN.gt(0)) onChange(toBN(maxValue).toFixed(precision, 1));
  };

  return (
    <Wrapper>
      <RowBetween style={{ marginBottom: "5px" }}>
        <Title>
          {title}
          {label && width >= MEDIA_WIDTHS.upToMedium && <span>({label})</span>}
        </Title>
        {!!maxValue && (
          <>
            <Balance onClick={onMaxValueClick} hover>
              Available:{" "}
              <Value>{formatAmount(Number(maxValue), mantissa)}</Value>
              <Max>MAX</Max>
            </Balance>
          </>
        )}
      </RowBetween>
      <RowBetween>
        <NumericalInput
          value={value || ""}
          onUserInput={onChange}
          placeholder="0.00"
          disabled={disabled}
          autoFocus
          style={{ textAlign: "left", height: "25px", marginLeft: "0px" }}
          precision={precision}
        />
        <div>{ticker}</div>
      </RowBetween>
    </Wrapper>
  );
}
