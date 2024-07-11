import styled from "styled-components";

import TableBody from "./Body";
import TableHeader from "./Header";
import { RowBetween } from "components/Row";
import { InputField } from "components/App/MarketBar/InputField";
import { useMarketsSearch } from "@symmio/frontend-sdk/hooks/useMarkets";

const TableWrapper = styled.div`
  border-radius: 4px;
`;

const Title = styled(RowBetween)`
  padding: 8px 12px 0 16px;
  border-radius: 4px 4px 0 0;
  background-color: ${({ theme }) => theme.bg0};
`;

const InputWrapper = styled.div`
  width: 244px;

  & > * {
    &:first-child {
      & > * {
        &:first-child {
          border-right: none;
        }
        &:last-child::placeholder {
          color: ${({ theme }) => theme.text4};
          font-size: 12px;
        }
      }
    }
  }
`;

export default function Table() {
  const { markets, searchProps } = useMarketsSearch();
  const searchMarketsValue = searchProps?.ref?.current?.value || "";

  return (
    <TableWrapper>
      <Title>
        <div>Markets</div>
        <InputWrapper>
          <InputField searchProps={searchProps} placeholder={"Search Name"} />
        </InputWrapper>
      </Title>
      <TableHeader
        HEADERS={[
          "",
          "Name",
          "Price",
          "24h Change",
          "24h Volume",
          "Notional Cap",
          "Action",
        ]}
      />
      <TableBody markets={markets} searchValue={searchMarketsValue} />
    </TableWrapper>
  );
}
