import styled from "styled-components";

import AccountBalance from "components/App/AccountData/MyAccount/AccountBalance";
import BalanceHistory from "components/App/AccountData/MyAccount/BalanceHistory";
import WithdrawBar from "components/App/AccountData/MyAccount/WithdrawBar";
import AccountOverview from "components/App/AccountData/MyAccount/AccountOverview";
import AccountPositions from "components/App/AccountData/MyAccount/AccountPositions";
import WrapperBanner from "components/Banner";
import { Container } from "pages/trade/[id]";

const Wrapper = styled(Container)`
  padding: 0px 111px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 54px;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0px 16px;
  `}
`;

const WithdrawRow = styled.div`
  margin-bottom: 16px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  width: 100%;
  gap: 16px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1.5fr 1fr;
  `}
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
  `}
`;

export default function MyAccount() {
  return (
    <Wrapper>
      <WrapperBanner />
      <WithdrawRow>
        <WithdrawBar />
      </WithdrawRow>
      <Layout>
        <AccountOverview />
        <AccountBalance />
        <AccountPositions />
        <BalanceHistory />
      </Layout>
    </Wrapper>
  );
}
