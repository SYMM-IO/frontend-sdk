import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";
import { CloseQuote } from "@symmio/frontend-sdk/types/trade";
import { BN_ZERO, formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { useQuoteFillAmount } from "@symmio/frontend-sdk/hooks/useQuotes";
import { useCancelQuote } from "@symmio/frontend-sdk/callbacks/useCancelQuote";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";

import ConnectWallet from "components/ConnectWallet";
import { Modal, ModalHeader } from "components/Modal";
import { PrimaryButton } from "components/Button";
import { DotFlashing } from "components/Icons";
import Column from "components/Column";
import InfoItem from "components/InfoItem";

const Wrapper = styled(Column)`
  padding: 12px;
  padding-top: 0;
  & > * {
    &:nth-child(2) {
      margin-top: 16px;
    }
    &:nth-child(3) {
      margin-top: 16px;
    }
    &:nth-child(4) {
      margin-top: 20px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

export default function CloseModal({
  modalOpen,
  toggleModal,
  quote,
}: {
  modalOpen: boolean;
  toggleModal: () => void;
  quote: Quote | null;
}) {
  const { account, chainId } = useActiveWagmi();
  const isPendingTxs = useIsHavePendingTransaction();
  const {
    marketId,
    quantity,
    positionType,
    quoteStatus,
    quantityToClose,
    closedAmount,
  } = quote || {};
  const {
    name: marketName,
    quantityPrecision,
    symbol,
  } = useMarket(marketId) || {};
  const [awaitingCancelConfirmation, setAwaitingCancelConfirmation] =
    useState(false);
  const fillAmount = useQuoteFillAmount(quote ?? ({} as Quote));

  const [notFilledAmount, filledAmount, notFilledPercent, filledPercent] =
    useMemo(() => {
      if (!quantity || !quantityToClose || !closedAmount)
        return [BN_ZERO, BN_ZERO, BN_ZERO, BN_ZERO];

      const fillAmountBN = toBN(fillAmount ?? 0);
      if (fillAmountBN.isEqualTo(0)) {
        return [toBN(quantityToClose), BN_ZERO, toBN(100), BN_ZERO];
      } else if (
        quoteStatus === QuoteStatus.CLOSE_PENDING ||
        quoteStatus === QuoteStatus.CANCEL_CLOSE_PENDING
      ) {
        const notFilledAmount = toBN(quantityToClose)
          .plus(closedAmount)
          .minus(fillAmountBN);
        return [
          notFilledAmount,
          fillAmountBN.minus(closedAmount),
          notFilledAmount.div(quantityToClose).times(100),
          fillAmountBN.minus(closedAmount).div(quantityToClose).times(100),
        ];
      } else {
        const notFilledAmount = toBN(quantity).minus(fillAmountBN);

        return [
          notFilledAmount,
          fillAmountBN,
          notFilledAmount.div(quantity).times(100),
          fillAmountBN.div(quantity).times(100),
        ];
      }
    }, [closedAmount, fillAmount, quantity, quantityToClose, quoteStatus]);

  const closeQuote = useMemo(() => {
    return quote?.quoteStatus === QuoteStatus.PENDING
      ? CloseQuote.CANCEL_QUOTE
      : quote?.quoteStatus === QuoteStatus.LOCKED
      ? CloseQuote.CANCEL_QUOTE
      : quote?.quoteStatus === QuoteStatus.CLOSE_PENDING
      ? CloseQuote.CANCEL_CLOSE_REQUEST
      : null;
  }, [quote]);

  const { callback: closeCallback, error } = useCancelQuote(quote, closeQuote);

  const handleManage = useCallback(async () => {
    if (error) console.debug({ error });

    if (!closeCallback) return;
    try {
      setAwaitingCancelConfirmation(true);
      const txHash = await closeCallback();
      setAwaitingCancelConfirmation(false);
      toggleModal();
      console.log("Transaction Hash:", { txHash });
    } catch (e) {
      toggleModal();
      setAwaitingCancelConfirmation(false);
      console.error(e);
    }
  }, [closeCallback, toggleModal, error]);

  const buttonText = useMemo(
    () =>
      notFilledPercent.eq(100)
        ? quote?.quoteStatus === QuoteStatus.CLOSE_PENDING
          ? "Cancel Close"
          : "Cancel"
        : `Cancel Remaining ${notFilledPercent.toFixed(2)}%`,
    [notFilledPercent, quote?.quoteStatus]
  );

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />;
    else if (isPendingTxs) {
      return (
        <PrimaryButton disabled>
          Transacting <DotFlashing />
        </PrimaryButton>
      );
    } else if (awaitingCancelConfirmation) {
      return (
        <PrimaryButton disabled>
          Awaiting Confirmation <DotFlashing />
        </PrimaryButton>
      );
    }
    return (
      <PrimaryButton height={"48px"} onClick={handleManage}>
        {buttonText}
      </PrimaryButton>
    );
  }

  return (
    <Modal
      isOpen={quote ? modalOpen : false}
      onBackgroundClick={() => toggleModal()}
      onEscapeKeydown={() => toggleModal()}
    >
      <ModalHeader
        onClose={() => toggleModal()}
        title={"Cancel " + marketName + "-Q" + quote?.id}
        positionType={positionType}
      />
      <Wrapper>
        <InfoItem
          label="Order Filled Size:"
          amount={`${filledPercent.toFixed(2)}% (${formatPrice(
            filledAmount,
            quantityPrecision
          )} ${symbol})`}
        />
        <InfoItem
          label="Order Not Filled Size:"
          amount={`${notFilledPercent.toFixed(2)}% (${formatPrice(
            notFilledAmount,
            quantityPrecision
          )} ${symbol})`}
        />
        {getActionButton()}
      </Wrapper>
    </Modal>
  );
}
