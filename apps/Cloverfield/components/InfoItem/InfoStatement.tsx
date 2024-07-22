import styled from "styled-components";

const NormalText = styled.span`
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`;

const SpecificText = styled.span<{ color?: string }>`
  color: ${({ theme, color }) => color ?? theme.white};
  font-size: 14px;
`;
export function InfoStatementComponent({
  firstValue,
  pointValue,
  secondValue,
  pointColor,
}: {
  firstValue: string;
  pointValue: string;
  secondValue?: string;
  pointColor?: string;
}) {
  return (
    <span>
      <NormalText>{firstValue}</NormalText>
      <SpecificText color={pointColor}>{pointValue}</SpecificText>
      <NormalText>{secondValue ?? ""}</NormalText>
    </span>
  );
}
