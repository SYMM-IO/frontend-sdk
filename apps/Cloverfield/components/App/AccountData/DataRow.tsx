import { RowBetween } from "components/Row";
import ShimmerAnimation from "components/ShimmerAnimation";
import styled from "styled-components";

const Row = styled(RowBetween)<{ margin?: string }>`
  flex-flow: row nowrap;
  margin: ${({ margin }) => margin ?? "8px 0px"};
`;

const Label = styled.div<{ color?: string }>`
  font-size: 14px;
  font-weight: 400;
  justify-self: start;
  color: ${({ theme, color }) => color ?? theme.text3};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

const Value = styled.div<{ color?: string }>`
  font-weight: 500;
  font-size: 14px;
  justify-self: end;
  color: ${({ theme, color }) => color ?? theme.text0};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

export default function DataRow({
  label,
  value,
  ticker,
  labelColor,
  valueColor,
  margin,
  loading,
}: {
  label: string;
  value: string;
  ticker?: string;
  labelColor?: string;
  valueColor?: string;
  margin?: string;
  loading?: boolean;
}) {
  return (
    <Row margin={margin}>
      <Label color={labelColor}>{label}</Label>
      {loading ? (
        <ShimmerAnimation width="68px" height="17px" />
      ) : (
        <Value color={valueColor}>
          {value} {ticker}
        </Value>
      )}
    </Row>
  );
}
