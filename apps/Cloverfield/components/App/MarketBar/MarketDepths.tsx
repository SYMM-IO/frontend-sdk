import styled from "styled-components";

import { useActiveMarket } from "@symmio/frontend-sdk/state/trade/hooks";
import useBidAskPrice from "@symmio/frontend-sdk/hooks/useBidAskPrice";

import { Name, Value } from ".";
import Column from "components/Column";
import { RowEnd } from "components/Row";
import BlinkingPrice from "components/App/FavoriteBar/BlinkingPrice";

const MarginColumn = styled(Column)`
  margin-left: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium` 
      margin-right: 5px;
      margin-left: unset;
  `};
`;

const MarketInfos = styled(RowEnd)`
  gap: 10px;
  flex: 1;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 10px;
    justify-content: space-between;
    flex-direction: row-reverse;
    width:100%;
  `};
`;

const MarketDepth = styled(RowEnd)`
  gap: 20px;
  width: unset;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: flex-start;

  `};
`;

export default function MarketDepths() {
  const activeMarket = useActiveMarket();
  const { ask, bid, spread } = useBidAskPrice(activeMarket);

  return (
    <MarketInfos>
      <MarginColumn>
        <Name textAlign={"right"} textAlignMedium={"right"}>
          Spread(bps)
        </Name>
        <Value textAlign={"right"} textAlignMedium={"right"}>
          {spread}
        </Value>
      </MarginColumn>
      <MarketDepth>
        <Column>
          <Name textAlign={"right"}>Bid</Name>
          <BlinkingPrice data={bid} textSize={"12px"} textAlign={"right"} />
        </Column>
        <Column>
          <Name textAlign={"right"}>Ask</Name>
          <BlinkingPrice data={ask} textSize={"12px"} textAlign={"right"} />
        </Column>
      </MarketDepth>
    </MarketInfos>
  );
}
