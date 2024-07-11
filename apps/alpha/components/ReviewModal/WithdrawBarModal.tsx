import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";

import { Modal } from "components/Modal";
import { Option } from "components/Tab";
import { Close as CloseIcon, DotFlashing } from "components/Icons";
import { Row, RowBetween, RowStart } from "components/Row";
import WithdrawCooldown from "components/App/AccountData/WithdrawCooldown";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";
import { formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";
import {
  useModalOpen,
  useWithdrawBarModalToggle,
} from "@symmio/frontend-sdk/state/application/hooks";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { useTransferCollateral } from "@symmio/frontend-sdk/callbacks/useTransferCollateral";

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  padding: 8px 12px 20px;
  gap: 0.8rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.5rem;
  `};
`;

const Close = styled.div`
  width: 24px;
  height: 24px;
  padding: 3px 6px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 2px 1px 0px;
  background: ${({ theme }) => theme.bg6};
`;

const WithdrawRow = styled(Row)<{ withdrawBar?: boolean }>`
  padding-bottom: ${({ withdrawBar }) => (withdrawBar ? "16px" : "8px")};
  gap: 8px;
  align-items: stretch;
  & > * {
    &:nth-child(1) {
      flex-grow: 1;
    }
  }
`;

const CancelBtn = styled.button<{ disabled?: boolean }>`
  width: 115px;
  padding: 10px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  color: ${({ theme }) => theme.warning};
  background-color: ${({ theme }) => theme.bgWarning};
  border: 1px solid ${({ theme }) => theme.warning};

  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }
`;

const CancelWithdrawInfo = styled.div`
  /* TODO: test text color, should be change in respect to design */
  color: ${({ theme }) => theme.text4};
  font-size: 10px;
  font-weight: 400;
`;

export function WithdrawBarModalContent({
  withdrawBar,
}: {
  withdrawBar?: boolean;
}) {
  const { chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const { accountBalance } = useAccountPartyAStat(activeAccountAddress);
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  if (
    toBN(
      toBN(accountBalance).toFixed(collateralCurrency?.decimals)
    ).isGreaterThan(0)
  ) {
    return (
      <div>
        <WithdrawRow withdrawBar={withdrawBar}>
          <WithdrawCooldown formatedAmount={false} />
          <CancelWithdraw />
        </WithdrawRow>
        <CancelWithdrawInfo>
          By canceling, the withdraw amount will be back to your allocated
          balance.
        </CancelWithdrawInfo>
      </div>
    );
  }
  return null;
}

export default function WithdrawBarModal() {
  const showWithdrawBarModal = useModalOpen(ApplicationModal.WITHDRAW_BAR);
  const toggleWithdrawBarModal = useWithdrawBarModalToggle();
  const activeAccountAddress = useActiveAccountAddress();
  const { accountBalance } = useAccountPartyAStat(activeAccountAddress);

  useEffect(() => {
    if (toBN(accountBalance).isZero()) {
      toggleWithdrawBarModal();
    }
  }, [accountBalance, toggleWithdrawBarModal]);

  return (
    <Modal
      isOpen={showWithdrawBarModal}
      onBackgroundClick={toggleWithdrawBarModal}
      onEscapeKeydown={toggleWithdrawBarModal}
    >
      <Wrapper>
        <RowBetween>
          <RowStart>
            <Option active={true}>{TransferTab.WITHDRAW}</Option>
          </RowStart>
          <Close onClick={toggleWithdrawBarModal}>
            <CloseIcon size={12} />
          </Close>
        </RowBetween>
        <WithdrawBarModalContent withdrawBar />
      </Wrapper>
    </Modal>
  );
}

function CancelWithdraw() {
  const { chainId } = useActiveWagmi();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const activeAccountAddress = useActiveAccountAddress();
  const { accountBalance, accountBalanceLimit, allocatedBalance } =
    useAccountPartyAStat(activeAccountAddress);
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const cancelAmount = useMemo(() => {
    if (
      toBN(accountBalance)
        .plus(allocatedBalance)
        .isGreaterThan(accountBalanceLimit)
    ) {
      const allocatableAmount =
        toBN(accountBalanceLimit).minus(allocatedBalance);

      if (allocatableAmount.isLessThan(0)) return "0";
      return allocatableAmount.toString();
    } else {
      return accountBalance;
    }
  }, [accountBalance, accountBalanceLimit, allocatedBalance]);

  const { callback: transferBalanceCallback, error: transferBalanceError } =
    useTransferCollateral(
      formatPrice(cancelAmount, collateralCurrency?.decimals),
      TransferTab.ALLOCATE
    );

  const handleAction = useCallback(async () => {
    if (!transferBalanceCallback) {
      toast.error(transferBalanceError);
      return;
    }

    try {
      setAwaitingConfirmation(true);
      await transferBalanceCallback();
      setAwaitingConfirmation(false);
    } catch (e) {
      setAwaitingConfirmation(false);
      if (e instanceof Error) {
        console.log("setAwaitingConfirmation", e.message);
      } else {
        console.error(e);
      }
    }
  }, [transferBalanceCallback, transferBalanceError]);

  if (awaitingConfirmation) {
    return (
      <CancelBtn disabled={true}>
        Cancel
        <DotFlashing />
      </CancelBtn>
    );
  }
  if (toBN(cancelAmount).isEqualTo(0)) {
    return <CancelBtn disabled={true}>Cancel</CancelBtn>;
  }
  return <CancelBtn onClick={handleAction}>Cancel</CancelBtn>;
}
