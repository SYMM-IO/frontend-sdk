import styled from "styled-components";

import { Account as AccountType } from "@symmio/frontend-sdk/types/user";

import { useAppDispatch } from "@symmio/frontend-sdk/state";
import { updateAccount } from "@symmio/frontend-sdk/state/user/actions";
import { useActiveAccountAddress } from "@symmio/frontend-sdk/state/user/hooks";

import { RowCenter } from "components/Row";
import CreateAccountModal from "components/ReviewModal/CreateAccountModal";
import Account from "./Account";
import {
  useCreateAccountModalToggle,
  useModalOpen,
} from "@symmio/frontend-sdk/state/application/hooks";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import { useBalanceInfos } from "@symmio/frontend-sdk/hooks/useAccounts";

const HoverWrapper = styled.div`
  padding: 0px 8px 12px 8px;
  width: clamp(200px, 360px, 99%);
  max-height: 330px;
  position: absolute;
  top: 48px;
  right: 0;
  background: ${({ theme }) => theme.bg1};
  border-radius: 4px;
  overflow: scroll;
`;

const GradientColorButton = styled(RowCenter)<{ disabled?: boolean }>`
  height: 40px;
  flex-wrap: nowrap;
  background: ${({ theme }) => theme.secondaryButton};
  border: 1px solid ${({ theme }) => theme.CTAPink};

  &:focus,
  &:hover,
  &:active {
    cursor: ${({ disabled }) => !disabled && "pointer"};
    background: ${({ theme }) => theme.hoverSecondaryButton};
  }
`;

const GradientButtonLabel = styled.span`
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: ${({ theme }) => theme.text0};
`;

export default function AccountsModal({
  data,
  onDismiss,
}: {
  data: AccountType[];
  onDismiss: () => void;
}) {
  const activeAccountAddress = useActiveAccountAddress();
  const dispatch = useAppDispatch();
  const showCreateAccountModal = useModalOpen(ApplicationModal.CREATE_ACCOUNT);
  const toggleCreateAccountModal = useCreateAccountModalToggle();

  const onClick = (account: AccountType) => {
    dispatch(updateAccount(account));
    onDismiss();
  };

  const { balanceInfo, balanceInfoStatus } = useBalanceInfos();

  function getInnerContent() {
    return (
      <div>
        {data.map((account, index) => {
          return (
            <Account
              account={account}
              key={index}
              active={
                activeAccountAddress
                  ? activeAccountAddress === account.accountAddress
                  : false
              }
              balanceInfo={balanceInfo[index]}
              balanceInfoStatus={balanceInfoStatus}
              onClick={() => onClick(account)}
            />
          );
        })}

        <GradientColorButton onClick={toggleCreateAccountModal}>
          <GradientButtonLabel>Create New Account</GradientButtonLabel>
        </GradientColorButton>
      </div>
    );
  }

  return (
    <HoverWrapper>
      {getInnerContent()}
      {showCreateAccountModal && <CreateAccountModal />}
    </HoverWrapper>
  );
}
