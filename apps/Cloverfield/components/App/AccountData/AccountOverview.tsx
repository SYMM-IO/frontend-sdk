import { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import Image from "next/legacy/image";
import { toast } from "react-hot-toast";

import {
  formatAmount,
  formatPrice,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";

import {
  useAccountPartyAStat,
  useActiveAccount,
  useBypassPrecisionCheckMode,
  useSetBypassPrecisionCheckModeCallback,
} from "@symmio/frontend-sdk/state/user/hooks";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import {
  useDepositModalToggle,
  useModalOpen,
  useWithdrawModalToggle,
} from "@symmio/frontend-sdk/state/application/hooks";

import { useAccountsLength } from "@symmio/frontend-sdk/hooks/useAccounts";
import useAccountData from "@symmio/frontend-sdk/hooks/useAccountData";

import { ColumnCenter } from "components/Column";
import { Row, RowBetween, RowEnd } from "components/Row";
import Emoji from "components/App/AccountData/Emoji";
import GradientButton from "components/Button/GradientButton";
import StartTrading from "components/App/AccountData/StartTrading";
import CreateAccount from "components/App/AccountData/CreateAccount";
import { ContextError, useInvalidContext } from "components/InvalidContext";
import DepositModal from "components/ReviewModal/DepositModal";
import AccountUpnl from "components/App/AccountData/AccountUpnl";
import DataRow from "components/App/AccountData/DataRow";
import WithdrawModal from "components/ReviewModal/WithdrawModal";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg0};
`;

const Title = styled(Row)`
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  padding: 12px;
  color: ${({ theme }) => theme.text0};
  padding-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 14px;
  `};
`;

const AccountHealth = styled(RowEnd)<{ color?: string }>`
  font-weight: 500;
  font-size: 16px;
  padding: 12px 12px 12px 0px;
  color: ${({ theme, color }) => color ?? theme.text1};
`;

export const AccountHealthText = styled.div`
  font-size: 10px;
  margin-right: 4px;
  margin-top: 4px;
  color: ${({ theme }) => theme.text3};
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 12px;
  margin-top: 41px;
  flex-flow: column nowrap;
  position: relative;
`;

const DataWrap = styled.div`
  display: flex;
  padding: 12px;
  flex-flow: column nowrap;
  position: relative;
  background: ${({ theme }) => theme.bg2};
`;

const TopRow = styled(RowBetween)`
  flex-flow: row nowrap;
  margin: 8px 0;
`;

const Label = styled.div`
  font-size: 14px;
  justify-self: start;
  color: ${({ theme }) => theme.text3};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`;

const ButtonsWrapper = styled(RowEnd)`
  margin-top: 16px;
  gap: 8px;
`;

const ContextText = styled.div`
  font-size: 14px;
  margin-top: 28px;
  color: ${({ theme }) => theme.text3};
`;

const LiquidatedHealth = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

export enum PanelType {
  POSITION_OVERVIEW = "POSITION OVERVIEW",
  ACCOUNT_OVERVIEW = "ACCOUNT OVERVIEW",
}

export default function AccountOverview({
  mobileVersion = false,
}: {
  mobileVersion?: boolean;
}) {
  const theme = useTheme();
  const { chainId } = useActiveWagmi();
  const { accountAddress, name: accountName } = useActiveAccount() || {};
  const { accountLength, loading: accountsLoading } = useAccountsLength();
  const validatedContext = useInvalidContext();
  const {
    allocatedBalance,
    accountBalance,
    lockedPartyAMM,
    loading: statsLoading,
    liquidationStatus,
  } = useAccountPartyAStat(accountAddress);

  const {
    equity,
    maintenanceMargin,
    accountHealthData: { health: accountHealth, healthColor, healthEmoji },
    availableForOrder,
  } = useAccountData();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const showDepositModal = useModalOpen(ApplicationModal.DEPOSIT);
  const showWithdrawModal = useModalOpen(ApplicationModal.WITHDRAW);
  const toggleDepositModal = useDepositModalToggle();
  const toggleWithdrawModal = useWithdrawModalToggle();

  if (validatedContext !== ContextError.VALID) {
    return <NotValidState text={"Wallet is not connected"} />;
  } else if (statsLoading || accountsLoading) {
    return <NotValidState text={"loading ..."} />;
  } else if (accountLength === 0) {
    return <CreateAccount />;
  } else if (toBN(allocatedBalance).isZero() && toBN(accountBalance).isZero()) {
    return <StartTrading symbol={collateralCurrency?.symbol} />;
  } else {
    return (
      <>
        <Wrapper>
          <TopRow>
            <BypassPrecisionCheckModeTitle
              title={mobileVersion ? "Account Overview" : accountName}
            />
            <AccountHealth color={healthColor}>
              {liquidationStatus ? (
                <>
                  <LiquidatedHealth>Liquidation Pending</LiquidatedHealth>
                  <Emoji
                    symbol={healthEmoji.symbol}
                    label={healthEmoji.label}
                    style={{ width: "22px", marginLeft: "4px" }}
                  />
                </>
              ) : isNaN(Number(accountHealth)) ? (
                "-"
              ) : (
                <>
                  <AccountHealthText>Account Health:</AccountHealthText>
                  {formatAmount(Number(accountHealth), 3)}%
                  <Emoji
                    symbol={healthEmoji.symbol}
                    label={healthEmoji.label}
                    style={{ width: "22px", marginLeft: "4px" }}
                  />
                </>
              )}
            </AccountHealth>
          </TopRow>
          <DataWrap>
            <TopRow>
              <Label style={{ color: theme.text0 }}>Account Total uPnL:</Label>
              <AccountUpnl />
            </TopRow>
            <DataRow
              label={"Maintenance Margin (CVA):"}
              value={formatAmount(formatPrice(maintenanceMargin))}
              ticker={collateralCurrency?.symbol}
            />
            <DataRow
              label={"Equity Balance:"}
              value={formatAmount(formatPrice(equity))}
              ticker={collateralCurrency?.symbol}
            />
          </DataWrap>

          <ContentWrapper>
            <DataRow
              label={"Allocated Balance:"}
              value={formatAmount(formatPrice(allocatedBalance))}
              ticker={collateralCurrency?.symbol}
            />
            <DataRow
              label={"Locked Margin:"}
              value={formatAmount(formatPrice(lockedPartyAMM))}
              ticker={collateralCurrency?.symbol}
            />
            <DataRow
              label={"Available for Orders:"}
              value={formatAmount(formatPrice(availableForOrder))}
              ticker={collateralCurrency?.symbol}
            />

            <ButtonsWrapper>
              <GradientButton
                label={"Withdraw"}
                onClick={() => toggleWithdrawModal()}
              />
              <GradientButton
                label={"Deposit"}
                onClick={() => toggleDepositModal()}
              />
            </ButtonsWrapper>
          </ContentWrapper>
        </Wrapper>
        {showDepositModal && <DepositModal />}
        {showWithdrawModal && <WithdrawModal />}
      </>
    );
  }
}

function NotValidState({ text }: { text: string }) {
  return (
    <Wrapper>
      <ColumnCenter style={{ marginTop: "78px" }}>
        <Image
          src={"/static/images/etc/SimpleCloverfield.svg"}
          alt="Asset"
          width={110}
          height={120}
        />
        <ContextText>{text}</ContextText>
      </ColumnCenter>
    </Wrapper>
  );
}

export const BypassPrecisionCheckModeTitle = ({
  title,
}: {
  title: string | undefined;
}) => {
  const setBypassPrecisionCheck = useSetBypassPrecisionCheckModeCallback();
  const bypassPrecisionCheck = useBypassPrecisionCheckMode();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    const toggleExpertMode = () => {
      toast.success(
        `Bypass Precision Check is ${
          bypassPrecisionCheck ? "deactivated" : "activated"
        }!`
      );
      setBypassPrecisionCheck(!bypassPrecisionCheck);
      setTries(0);
    };

    if (tries >= 5) {
      toggleExpertMode();
    } else if (tries > 2) {
      toast.error(
        `Bypass Precision Check is ${
          bypassPrecisionCheck ? "deactivating" : "activating"
        } #${tries}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tries, setBypassPrecisionCheck]);

  const handleAccountOverviewClick = () => {
    setTries(tries + 1);
  };

  return <Title onClick={handleAccountOverviewClick}>{title}</Title>;
};
