import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import BigNumber from "bignumber.js";

import {
  toBN,
  formatAmount,
  formatPrice,
} from "@symmio/frontend-sdk/utils/numbers";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";

import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import {
  useModalOpen,
  useWithdrawModalToggle,
} from "@symmio/frontend-sdk/state/application/hooks";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";
import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import useAccountData from "@symmio/frontend-sdk/hooks/useAccountData";
import { useTransferCollateral } from "@symmio/frontend-sdk/callbacks/useTransferCollateral";

import { Modal } from "components/Modal";
import { Option } from "components/Tab";
import { DotFlashing } from "components/Icons";
import { PrimaryButton } from "components/Button";
import { CustomInputBox2 } from "components/InputBox";
import { Close as CloseIcon } from "components/Icons";
import { Row, RowBetween, RowStart } from "components/Row";
import { WithdrawBarModalContent } from "./WithdrawBarModal";

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  padding: 1rem;
  gap: 0.8rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.5rem;
  `};
`;

const WithdrawInfo = styled(RowStart)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`;

const LabelsRow = styled(Row)`
  flex-direction: column;
  gap: 16px;
  padding-bottom: 36px;

  & > * {
    &:first-child {
      width: 100%;
    }
  }
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

export default function WithdrawModal() {
  const { chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const [typedAmount, setTypedAmount] = useState("");
  const isPendingTxs = useIsHavePendingTransaction();
  const { availableForOrder } = useAccountData();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const showWithdrawModal = useModalOpen(ApplicationModal.WITHDRAW);
  const toggleWithdrawModal = useWithdrawModalToggle();

  const { allocatedBalance: subAccountAllocatedBalance } =
    useAccountPartyAStat(activeAccountAddress);

  const [amountForDeallocate, insufficientBalance] = useMemo(() => {
    const deallocateAmount = BigNumber.min(
      availableForOrder,
      subAccountAllocatedBalance
    );
    const insufficientBalance = deallocateAmount.isLessThan(typedAmount);
    if (deallocateAmount.isLessThan(0)) return ["0", insufficientBalance];
    return [deallocateAmount.toString(), insufficientBalance];
  }, [availableForOrder, subAccountAllocatedBalance, typedAmount]);

  const { callback: transferBalanceCallback, error: transferBalanceError } =
    useTransferCollateral(typedAmount, TransferTab.DEALLOCATE);
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const handleAction = useCallback(async () => {
    if (!transferBalanceCallback) {
      toast.error(transferBalanceError);
      return;
    }

    try {
      setAwaitingConfirmation(true);
      await transferBalanceCallback();
      setTypedAmount("");
      setAwaitingConfirmation(false);
      toggleWithdrawModal();
    } catch (e) {
      setAwaitingConfirmation(false);
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.error(e);
      }
    }
  }, [toggleWithdrawModal, transferBalanceCallback, transferBalanceError]);

  const onChange = (value: string) => {
    setTypedAmount(value);
  };

  function getActionButton() {
    if (awaitingConfirmation) {
      return (
        <PrimaryButton disabled>
          Awaiting Confirmation <DotFlashing />
        </PrimaryButton>
      );
    }

    if (isPendingTxs) {
      return (
        <PrimaryButton disabled>
          Transacting <DotFlashing />
        </PrimaryButton>
      );
    }

    if (insufficientBalance)
      return <PrimaryButton disabled>Insufficient Balance</PrimaryButton>;

    return <PrimaryButton onClick={handleAction}>Withdraw</PrimaryButton>;
  }

  return (
    <Modal
      isOpen={showWithdrawModal}
      onBackgroundClick={toggleWithdrawModal}
      onEscapeKeydown={toggleWithdrawModal}
    >
      <Wrapper>
        <RowBetween>
          <RowStart>
            <Option active={true}>{TransferTab.WITHDRAW}</Option>
          </RowStart>
          <Close onClick={toggleWithdrawModal}>
            <CloseIcon size={12} />
          </Close>
        </RowBetween>
        <LabelsRow>
          <WithdrawBarModalContent />
          <CustomInputBox2
            balanceDisplay={
              !toBN(amountForDeallocate).isNaN()
                ? formatAmount(amountForDeallocate, 4, true)
                : "0.00"
            }
            value={typedAmount}
            title={"Amount"}
            balanceExact={
              !toBN(amountForDeallocate).isNaN()
                ? formatPrice(amountForDeallocate, collateralCurrency.decimals)
                : "0.00"
            }
            onChange={onChange}
            max={true}
            symbol={collateralCurrency?.symbol}
            precision={collateralCurrency.decimals}
          />
        </LabelsRow>
        {getActionButton()}
        <WithdrawInfo>
          By submitting a new withdraw the withdraw cool down will be reset to
          12 hours!{" "}
        </WithdrawInfo>
      </Wrapper>
    </Modal>
  );
}
