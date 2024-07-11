import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { useTheme } from "styled-components";
import { Activity } from "react-feather";
import isEqual from "lodash/isEqual";
import { lighten } from "polished";
import { useConnect } from "wagmi";

import { useAppDispatch } from "@symmio/frontend-sdk/state";
import { truncateAddress } from "@symmio/frontend-sdk/utils/address";
import { ChainInfo } from "@symmio/frontend-sdk/constants/chainInfo";
import { FALLBACK_CHAIN_ID, FALLBACK_FE_NAME } from "constants/chains/chains";
import { WEB_SETTING } from "@symmio/frontend-sdk/config";

import useRpcChangerCallback from "@symmio/frontend-sdk/lib/hooks/useRpcChangerCallback";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import usePrevious from "@symmio/frontend-sdk/lib/hooks/usePrevious";
import {
  useAccountPartyAStat,
  useActiveAccount,
  useSetFEName,
} from "@symmio/frontend-sdk/state/user/hooks";
import { updateAccount } from "@symmio/frontend-sdk/state/user/actions";

import {
  useAccountsLength,
  useUserAccounts,
} from "@symmio/frontend-sdk/hooks/useAccounts";

import { NavButton } from "components/Button";
import { ChevronDown, Switch, Status as StatusIcon } from "components/Icons";
import { Row, RowCenter, RowEnd, RowStart } from "components/Row";
import AccountsModal from "./AccountsModal";
import CreateAccountModal from "components/ReviewModal/CreateAccountModal";
import { GradientColorButton } from "components/Button/GradientButton";
import AccountUpnl from "components/App/AccountData/AccountUpnl";
import ImageWithFallback from "components/ImageWithFallback";
import Badge from "./Badge";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { getChainLogo } from "utils/chainLogo";
import { useV3Ids } from "@symmio/frontend-sdk/state/chains/hooks";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import {
  useCreateAccountModalToggle,
  useModalOpen,
} from "@symmio/frontend-sdk/state/application/hooks";
import useOnOutsideClick from "lib/hooks/useOnOutsideClick";
import { AllAccountsUpdater } from "@symmio/frontend-sdk/state/user/allAccountsUpdater";

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  width: 244px;
  border-left: 1px solid ${({ theme }) => theme.bg0};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 204px;
  `}
`;

const InnerContentWrapper = styled(Row)`
  padding: 11px 8px 10px 12px;
  height: 36px;
  font-size: 12px;
  color: ${({ theme }) => theme.text0};
`;

const UserStatus = styled(RowStart)`
  overflow: hidden;
  gap: 4px;
`;

const NameWrapper = styled.div<{ nameLength: number }>`
  overflow: hidden;
  width: 80px;
  padding: 8px 0;

  @keyframes scrolling-forward {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(-${({ nameLength }) => nameLength * 10}%);
    }
  }

  &:hover .account-name {
    animation: scrolling-forward ${({ nameLength }) => nameLength * 0.5}s linear
      infinite;
  }
`;

const ErrorButton = styled(GradientColorButton)`
  padding: 0 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  &:hover,
  &:focus {
    cursor: pointer;
    color: ${({ theme }) => lighten(0.1, theme.CTAPink)};
  }
`;

const MainButton = styled(NavButton)`
  font-size: 12px;
  width: unset;
  padding: 2px;
  height: 40px;
  display: flex;
  overflow: unset;
  z-index: 0;
  background: ${({ theme }) => theme.bg1};

  &:hover,
  &:focus {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`;

const Button = styled.div`
  width: 204px;
  height: 36px;
  margin: 2px 0px;
  margin-right: 2px;

  font-weight: 500;
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.text0};
  background: ${({ theme }) => theme.pinkGrad};

  padding: 10px 0px;

  &:focus,
  &:hover {
    background: ${({ theme }) => theme.hoverGrad};
  }
`;

const ChooseAccountButton = styled(Button)`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text0};
`;

const UpnlText = styled(RowCenter)`
  font-size: 10px;
  color: ${({ theme }) => theme.text2};
  margin-right: 12px;
`;

const CreateAccountWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 20px;
`;
const ConnectWalletWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 12px;
`;

const AccountAddress = styled.div<{ width?: string; color?: string }>`
  width: ${({ width }) => width ?? "95px"};
  color: ${({ theme, color }) => color ?? theme.text0};
  padding: 13px 0px;
`;

const NetworkButton = styled(NavButton)`
  position: relative;
  cursor: pointer;
  overflow: visible;
  padding: 0px 5px;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.red6};
  border: 1px solid ${({ theme }) => theme.red2};
`;

const Chevron = styled(ChevronDown)<{ open: boolean }>`
  transform: rotateX(${({ open }) => (open ? "180deg" : "0deg")});
  transition: 0.5s;
`;

const SwitchIcon = styled.div`
  position: absolute;
  top: 20px;
  left: 30px;
  cursor: pointer;
`;

//TODO pending actions
export default function MultiAccount() {
  const theme = useTheme();
  const { accounts } = useUserAccounts();
  const previousAccounts = usePrevious(accounts);
  const { openConnectModal } = useConnectModal();
  const setFrontEndName = useSetFEName();

  const { account, chainId } = useActiveWagmi();

  //TODO remove it and use rainbow
  const ENSName = undefined; //use ens from wagmi
  const activeAccount = useActiveAccount();
  const showCreateAccountModal = useModalOpen(ApplicationModal.CREATE_ACCOUNT);
  const showDepositModal = useModalOpen(ApplicationModal.DEPOSIT);
  const rpcChangerCallback = useRpcChangerCallback();
  const dispatch = useAppDispatch();

  const { accountAddress, name } = activeAccount || {};
  const { loading: accountsLoading } = useAccountsLength();

  const { loading: statsLoading } = useAccountPartyAStat(accountAddress);
  const ref = useRef(null);
  useOnOutsideClick(ref, () => {
    if (!showCreateAccountModal && !showDepositModal) setClickAccounts(false);
  });

  const [clickAccounts, setClickAccounts] = useState(false);
  const toggleCreateAccountModal = useCreateAccountModalToggle();
  const v3_ids = useV3Ids();
  const Chain = ChainInfo[FALLBACK_CHAIN_ID];

  const { error } = useConnect();

  const standardAccountName = (() => {
    if (name && name.length > 10) return `${name.slice(0, 10)}...`;
    return name;
  })();
  const [accountName, setAccountName] = useState(standardAccountName);

  // Choose last sub account
  useEffect(() => {
    if (accounts !== null && !isEqual(accounts, previousAccounts)) {
      const lastSubAccount = accounts[accounts.length - 1];
      dispatch(updateAccount(lastSubAccount));
    }
  }, [accounts, dispatch, previousAccounts]);

  useEffect(() => {
    standardAccountName && setAccountName(standardAccountName);
  }, [standardAccountName]);

  const showCallbackError: boolean = useMemo(() => {
    if (!chainId || !account) return false;
    return !v3_ids.includes(chainId);
  }, [chainId, account, v3_ids]);

  const { openAccountModal } = useAccountModal();

  const handleNetwork = useCallback(async () => {
    const response = await rpcChangerCallback(FALLBACK_CHAIN_ID);
    if (response) setFrontEndName(FALLBACK_FE_NAME);
  }, [rpcChangerCallback, setFrontEndName]);

  function getInnerContent() {
    return (
      <InnerContentWrapper
        onClick={() => setClickAccounts((previousValue) => !previousValue)}
      >
        {activeAccount ? (
          <>
            <UserStatus>
              <NameWrapper
                nameLength={name?.length ?? 0}
                onMouseOver={() => {
                  setAccountName(name);
                }}
                onMouseLeave={() => {
                  setAccountName(standardAccountName);
                }}
              >
                <div className="account-name">{accountName}</div>
              </NameWrapper>
              {WEB_SETTING.showBadge && <Badge />}
            </UserStatus>
            <UpnlText>
              uPNL:
              <AccountUpnl size={"10px"} />
            </UpnlText>
            <RowEnd width={"10%"}>
              <Chevron open={clickAccounts} />
            </RowEnd>
          </>
        ) : (
          <>
            <ChooseAccountButton>Choose Account</ChooseAccountButton>

            <RowEnd width={"10%"}>
              <Chevron open={clickAccounts} />
            </RowEnd>
          </>
        )}
      </InnerContentWrapper>
    );
  }

  function getContent() {
    if (showCallbackError) {
      return (
        <NetworkButton onClick={handleNetwork}>
          <ImageWithFallback
            src={getChainLogo(chainId)}
            alt={Chain.label}
            width={28}
            height={28}
          />
          <SwitchIcon onClick={handleNetwork}>
            <Switch />
          </SwitchIcon>
        </NetworkButton>
      );
    }

    if (account) {
      if (accountsLoading || statsLoading) {
        return (
          <MainButton>
            <CreateAccountWrapper>
              <AccountAddress onClick={openConnectModal}>
                <StatusIcon
                  connected
                  style={{ marginRight: "12px", marginLeft: "6px" }}
                />
                {ENSName || truncateAddress(account)}
              </AccountAddress>

              <Button>Loading...</Button>
            </CreateAccountWrapper>
          </MainButton>
        );
      }
      if (accounts.length === 0) {
        return (
          <MainButton>
            <CreateAccountWrapper>
              <AccountAddress onClick={openConnectModal}>
                <StatusIcon
                  connected
                  style={{ marginRight: "12px", marginLeft: "6px" }}
                />
                {ENSName || truncateAddress(account)}
              </AccountAddress>

              <Button onClick={toggleCreateAccountModal}>Create Account</Button>
              <CreateAccountModal />
            </CreateAccountWrapper>
          </MainButton>
        );
      }
      return (
        <MainButton ref={ref}>
          <CreateAccountWrapper>
            <AccountAddress onClick={openAccountModal}>
              <StatusIcon
                connected
                style={{ marginRight: "12px", marginLeft: "6px" }}
              />
              {ENSName || truncateAddress(account)}
            </AccountAddress>
            <Container>
              {clickAccounts && (
                <div>
                  <AccountsModal
                    onDismiss={() =>
                      setClickAccounts((previousValue) => !previousValue)
                    }
                    data={accounts}
                  />
                  <AllAccountsUpdater />
                </div>
              )}
              {getInnerContent()}
            </Container>
          </CreateAccountWrapper>
        </MainButton>
      );
    } else if (error) {
      return (
        <ErrorButton onClick={openConnectModal}>
          <Activity />
          {error.message || "Error"}
        </ErrorButton>
      );
    } else {
      return (
        <MainButton>
          <ConnectWalletWrapper onClick={openConnectModal}>
            <AccountAddress width={"105px"} color={theme.text1}>
              <StatusIcon style={{ marginRight: "12px", marginLeft: "6px" }} />
              {`not connected`}
            </AccountAddress>

            <Button>Connect Wallet</Button>
          </ConnectWalletWrapper>
        </MainButton>
      );
    }
  }

  return <React.Fragment> {getContent()} </React.Fragment>;
}
