import React, { useCallback, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import { toast } from "react-hot-toast";

import { FALLBACK_CHAIN_ID } from "constants/chains/chains";
import {
  toBN,
  formatAmount,
  BN_ZERO,
  formatPrice,
} from "@symmio/frontend-sdk/utils/numbers";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";

import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import {
  useDepositModalToggle,
  useModalOpen,
} from "@symmio/frontend-sdk/state/application/hooks";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";
import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";
import { useApproveCallback } from "@symmio/frontend-sdk/lib/hooks/useApproveCallback";
import { ApprovalState } from "@symmio/frontend-sdk/lib/hooks/useApproval";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { Modal } from "components/Modal";
import InfoItem from "components/InfoItem";
import { Option } from "components/Tab";
import { DotFlashing } from "components/Icons";
import { PrimaryButton } from "components/Button";
import { CustomInputBox2 } from "components/InputBox";
import { Close as CloseIcon } from "components/Icons";
import { useTransferCollateral } from "@symmio/frontend-sdk/callbacks/useTransferCollateral";
import { useMintCollateral } from "@symmio/frontend-sdk/callbacks/useMintTestCollateral";
import { Row, RowBetween, RowStart } from "components/Row";
import { useMultiAccountAddress } from "@symmio/frontend-sdk/state/chains/hooks";

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

export default function DepositModal() {
  const theme = useTheme();
  const { chainId, account } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const [typedAmount, setTypedAmount] = useState("");
  const isPendingTxs = useIsHavePendingTransaction();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const showDepositModal = useModalOpen(ApplicationModal.DEPOSIT);
  const toggleDepositModal = useDepositModalToggle();

  const { accountBalanceLimit, allocatedBalance: subAccountAllocatedBalance } =
    useAccountPartyAStat(activeAccountAddress);

  const { collateralBalance } = useAccountPartyAStat(account);

  const allowedDepositAmount = useMemo(() => {
    const amount = toBN(accountBalanceLimit).minus(subAccountAllocatedBalance);
    return amount.gt(0) ? amount : BN_ZERO;
  }, [accountBalanceLimit, subAccountAllocatedBalance]);

  const insufficientBalance = useMemo(() => {
    return toBN(collateralBalance).isLessThan(typedAmount);
  }, [collateralBalance, typedAmount]);

  const { callback: transferBalanceCallback, error: transferBalanceError } =
    useTransferCollateral(typedAmount, TransferTab.DEPOSIT);
  const { callback: mintCallback, error: mintCallbackError } =
    useMintCollateral();

  const MULTI_ACCOUNT_ADDRESS = useMultiAccountAddress();
  const spender = useMemo(
    () => MULTI_ACCOUNT_ADDRESS[chainId ?? FALLBACK_CHAIN_ID],
    [MULTI_ACCOUNT_ADDRESS, chainId]
  );
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const [approvalState, approveCallback] = useApproveCallback(
    collateralCurrency,
    typedAmount ?? "0",
    spender
  );

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show =
      collateralCurrency &&
      approvalState !== ApprovalState.APPROVED &&
      !!typedAmount;
    return [show, show && approvalState === ApprovalState.PENDING];
  }, [collateralCurrency, approvalState, typedAmount]);

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
      toggleDepositModal();
    } catch (e) {
      setAwaitingConfirmation(false);
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.error(e);
      }
    }
  }, [toggleDepositModal, transferBalanceCallback, transferBalanceError]);

  const handleMintToken = useCallback(async () => {
    if (!mintCallback) {
      toast.error(mintCallbackError);
      return;
    }

    try {
      setAwaitingConfirmation(true);
      await mintCallback();
      setTypedAmount("");
      setAwaitingConfirmation(false);
    } catch (e) {
      setAwaitingConfirmation(false);
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.error(e);
      }
    }
  }, [mintCallback, mintCallbackError]);

  const handleApprove = async () => {
    try {
      setAwaitingConfirmation(true);
      await approveCallback();
      setAwaitingConfirmation(false);
      // toggleDepositModal()
    } catch (err) {
      console.error(err);
      setAwaitingConfirmation(false);
      // toggleDepositModal()
    }
  };

  function getTabs() {
    return (
      <RowStart>
        <Option active={true}>{TransferTab.DEPOSIT}</Option>
      </RowStart>
    );
  }

  const onChange = (value: string) => {
    setTypedAmount(value);
  };

  function getLabel() {
    // removeTrailingZeros
    return (
      <LabelsRow>
        <CustomInputBox2
          title={`Deposit Amount`}
          value={typedAmount}
          onChange={onChange}
          max={true}
          symbol={collateralCurrency?.symbol}
          precision={collateralCurrency.decimals}
          balanceTitle={`${collateralCurrency?.symbol} Balance:`}
          balanceExact={
            collateralBalance
              ? formatAmount(collateralBalance.toString())
              : "0.00"
          }
          balanceDisplay={
            collateralBalance
              ? formatAmount(collateralBalance.toString(), 4, true)
              : "0.00"
          }
        />
        <InfoItem
          label={"Allocated Balance"}
          amount={formatAmount(subAccountAllocatedBalance.toString(), 4, true)}
          ticker={`${collateralCurrency?.symbol}`}
        />
        <InfoItem
          label={"Allowed to Deposit"}
          balanceExact={formatPrice(
            allowedDepositAmount,
            collateralCurrency?.decimals
          )}
          amount={formatAmount(allowedDepositAmount.toString(), 4, true)}
          ticker={`${collateralCurrency?.symbol}`}
          valueColor={theme.primaryBlue}
          onClick={onChange}
        />
      </LabelsRow>
    );
  }

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

    if (allowedDepositAmount.isLessThan(typedAmount))
      return (
        <PrimaryButton disabled>Amount exceeds deposit limit</PrimaryButton>
      );

    if (insufficientBalance)
      return <PrimaryButton disabled>Insufficient Balance</PrimaryButton>;

    if (showApproveLoader) {
      return (
        <PrimaryButton disabled>
          Approving <DotFlashing />
        </PrimaryButton>
      );
    }

    if (showApprove) {
      return (
        <PrimaryButton onClick={handleApprove}>
          Approve Collateral
        </PrimaryButton>
      );
    }

    return (
      <PrimaryButton onClick={handleAction}>Deposit and allocate</PrimaryButton>
    );
  }

  return (
    <Modal
      isOpen={showDepositModal}
      onBackgroundClick={toggleDepositModal}
      onEscapeKeydown={toggleDepositModal}
    >
      <Wrapper>
        <RowBetween>
          {getTabs()}
          <Close onClick={toggleDepositModal}>
            <CloseIcon size={12} style={{ cursor: "pointer" }} />
          </Close>
        </RowBetween>

        {getLabel()}
        {getActionButton()}

        {collateralCurrency.address ===
          "0x50E88C692B137B8a51b6017026Ef414651e0d5ba" &&
          toBN(collateralBalance).isLessThanOrEqualTo(9) && (
            <PrimaryButton onClick={handleMintToken}>
              Mint Test Token
            </PrimaryButton>
          )}
      </Wrapper>
    </Modal>
  );
}
