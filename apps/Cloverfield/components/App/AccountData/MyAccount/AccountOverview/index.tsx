import styled from "styled-components";

import useAccountData from "@symmio/frontend-sdk/hooks/useAccountData";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { Row } from "components/Row";
import Column from "components/Column";
import InfoItem from "components/InfoItem";
import { DefaultContainer } from "../styles";
import AccountHealth from "./AccountHealth";
import UPNLBar from "./UPNLBar";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";

const Container = styled(DefaultContainer)`
  padding-bottom: 16px;
`;

const InfoWrapper = styled(Column)`
  gap: 16px;
  padding: 0 16px;
  margin-top: 50px;
`;

export default function AccountOverview() {
  const { chainId } = useActiveWagmi();
  const {
    equity,
    maintenanceMargin,
    loading: accountLoading,
  } = useAccountData();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const loading = chainId ? accountLoading : true;

  return (
    <Container>
      <AccountHealth />
      <Row flexDirection={"column"} gap={"16px"} align={"stretch"}>
        <UPNLBar />
        <InfoWrapper>
          <InfoItem
            label={"Equity Balance:"}
            amount={formatAmount(equity)}
            ticker={collateralCurrency?.symbol}
            fontSize={"14px"}
            loading={loading}
          />
          <InfoItem
            label={"Maintenance Margin (CVA):"}
            amount={formatAmount(maintenanceMargin)}
            ticker={collateralCurrency?.symbol}
            fontSize={"14px"}
            loading={loading}
          />
        </InfoWrapper>
      </Row>
    </Container>
  );
}
