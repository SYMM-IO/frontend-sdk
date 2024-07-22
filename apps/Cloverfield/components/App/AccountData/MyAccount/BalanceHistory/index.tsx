import { useState, useEffect } from "react";
import styled from "styled-components";

import { DefaultContainer, DefaultHeader } from "../styles";

import { ColumnCenter } from "components/Column";
import HistoryData from "components/App/AccountData/MyAccount/BalanceHistory/BalanceData";
import {
  useActiveAccountAddress,
  useBalanceHistory,
  useGetBalanceHistoryCallback,
} from "@symmio/frontend-sdk/state/user/hooks";
import { ApiState } from "@symmio/frontend-sdk/types/api";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

const Container = styled(DefaultContainer)`
  position: relative;
  overflow: hidden;
  min-height: 442px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-row: 3;
    height: 442px;
  `}
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  column-gap: 4px;
  padding: 20px 12px 12px;
`;

const HeaderText = styled.div<{ justify?: "start" | "center" | "end" }>`
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  justify-self: ${({ justify }) => justify || "initial"};
`;

const ItemsContainer = styled(ColumnCenter)`
  gap: 1px;
  width: 100%;
  overflow: hidden;
`;

const EmptyCenteredContent = styled.div`
  /* height: 440px; */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
`;

function BalanceHistoryBody() {
  return (
    <>
      <Header>
        <HeaderText>Action</HeaderText>
        <HeaderText>Amount</HeaderText>
        <HeaderText justify={"end"}>Time</HeaderText>
      </Header>
      <ItemsContainer>
        <HistoryData />
      </ItemsContainer>
    </>
  );
}
export default function BalanceHistory() {
  const { chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const getBalanceHistory = useGetBalanceHistoryCallback();
  const { balanceHistory, balanceHistoryState } = useBalanceHistory();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getBalanceHistory(chainId, activeAccountAddress);
  }, [activeAccountAddress, chainId, getBalanceHistory]);

  useEffect(() => {
    if (!isLoaded) {
      if (balanceHistory && Object.values(balanceHistory).length)
        setIsLoaded(true);
    }
  }, [balanceHistory, isLoaded]);

  return (
    <Container>
      <DefaultHeader>Deposit/Withdraw History</DefaultHeader>
      {isLoaded ? (
        <BalanceHistoryBody />
      ) : balanceHistoryState === ApiState.OK ? (
        <EmptyCenteredContent>You have no transaction!</EmptyCenteredContent>
      ) : (
        <EmptyCenteredContent>Transaction not found!</EmptyCenteredContent>
      )}
    </Container>
  );
}
