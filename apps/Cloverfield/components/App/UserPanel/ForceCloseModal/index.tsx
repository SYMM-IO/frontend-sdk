import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import BigNumber from "bignumber.js";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { Quote, QuoteStatus } from "@symmio/frontend-sdk/types/quote";
import { BN_ZERO, formatPrice, toBN } from "@symmio/frontend-sdk/utils/numbers";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import { useQuoteFillAmount } from "@symmio/frontend-sdk/hooks/useQuotes";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";
import { useForceCooldowns } from "@symmio/frontend-sdk/hooks/usePartyAStats";
import { useForceCloseQuoteCallback } from "@symmio/frontend-sdk/callbacks/useForceCloseQuote";

import ConnectWallet from "components/ConnectWallet";
import { Modal, ModalHeader } from "components/Modal";
import { PrimaryButton } from "components/Button";
import { DotFlashing } from "components/Icons";
import Column from "components/Column";
import InfoItem from "components/InfoItem";
import useCheckForceClosePriceCondition from "./useCheckForceClosePriceCondition";

const Wrapper = styled(Column)`
  padding: 12px;
  padding-top: 0;

  & > *:not(:first-child) {
    margin-top: 16px;

    &:last-child {
      margin-top: 20px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const MainButton = styled(PrimaryButton).attrs({
  height: "48px",
})`
  border-radius: px;
  font-weight: 700;
`;

export default function ForceCloseModal({
  modalOpen,
  toggleModal,
  quote,
}: {
  modalOpen: boolean;
  toggleModal: () => void;
  quote: Quote | null;
}) {
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

  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  useEffect(() => {
    if (quote) {
      const t0 = new Date(quote.statusModifyTimestamp * 1000);
      const t1 = new Date(Math.ceil(Date.now()));
      t0.setSeconds(0);
      t1.setSeconds(0, 0);
      t1.setMinutes(t1.getMinutes() + 1);
      setDateRange([t0, t1]);
    }
  }, [quote]);

  return (
    <Modal
      isOpen={quote ? modalOpen : false}
      onBackgroundClick={() => toggleModal()}
      onEscapeKeydown={() => toggleModal()}
    >
      <ModalHeader
        onClose={() => toggleModal()}
        title={"Force Close " + marketName + "-Q" + quote?.id}
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

        {dateRange && dateRange[0] && dateRange[1] && (
          <React.Fragment>
            <InfoItem
              label="Start Date:"
              amount={`${dateRange[0].toLocaleString()}`}
            />
            <InfoItem
              label="End Date:"
              amount={`${dateRange[1].toLocaleString()}`}
            />
          </React.Fragment>
        )}

        {quote && (
          <ActionButton
            quote={quote}
            dateRange={dateRange}
            marketName={marketName}
            notFilledPercent={notFilledPercent}
            toggleModal={toggleModal}
          />
        )}
      </Wrapper>
    </Modal>
  );
}

function ActionButton({
  quote,
  dateRange,
  notFilledPercent,
  marketName,
  toggleModal,
}: {
  quote: Quote;
  dateRange: [Date, Date] | null;
  notFilledPercent: BigNumber;
  marketName: string | undefined;
  toggleModal: () => void;
}): JSX.Element | null {
  const { account, chainId } = useActiveWagmi();
  const isPendingTxs = useIsHavePendingTransaction();

  const [awaitingCancelConfirmation, setAwaitingCancelConfirmation] =
    useState(false);
  const {
    forceCloseFirstCooldown,
    forceCloseMinSigPeriod,
    forceCloseSecondCooldown,
  } = useForceCooldowns();

  const {
    forceCloseEnabled,
    closeTimestamp,
    openTimestamp,
    loading: forceCloseCalculationLoading,
  } = useCheckForceClosePriceCondition({
    dateRange,
    quote,
    marketName,
    cooldowns: { forceCloseFirstCooldown, forceCloseSecondCooldown },
  });

  const { callback: forceCloseCallback, error } = useForceCloseQuoteCallback(
    quote,
    [new Date(openTimestamp), new Date(closeTimestamp)]
  );

  const { statusModifyTimestamp, deadline } = quote;

  const buttonText = useMemo(
    () =>
      notFilledPercent.eq(100)
        ? quote?.quoteStatus === QuoteStatus.CLOSE_PENDING
          ? "Force Close"
          : "Cancel"
        : `Cancel Remaining ${notFilledPercent.toFixed(2)}%`,
    [notFilledPercent, quote?.quoteStatus]
  );

  const { isForceCloseAllowed, forceCloseError } = useMemo(() => {
    // Here we check force close range conditions
    const startTimestampBN = toBN(openTimestamp / 1000);
    const endTimestampBN = toBN(Math.ceil(closeTimestamp / 1000));

    if (
      !startTimestampBN.isZero() &&
      startTimestampBN.isLessThan(
        toBN(forceCloseFirstCooldown).plus(statusModifyTimestamp)
      )
    ) {
      // require(sig.startTime >= quote.statusModifyTimestamp + maLayout.forceCloseFirstCooldown, "PartyAFacet: Cooldown not reached");
      return {
        isForceCloseAllowed: false,
        forceCloseError: "Cooldown not reached",
      };
    }
    if (
      endTimestampBN.isGreaterThan(
        toBN(new Date().getTime() / 1000).minus(forceCloseSecondCooldown)
      )
    ) {
      // require(sig.endTime <= block.timestamp - maLayout.forceCloseSecondCooldown, "PartyAFacet: Cooldown not reached");
      return {
        isForceCloseAllowed: false,
        forceCloseError: "Cooldown not reached",
      };
    }
    if (endTimestampBN.plus(forceCloseSecondCooldown).isGreaterThan(deadline)) {
      // require(sig.endTime + maLayout.forceCloseSecondCooldown <= quote.deadline, "PartyBFacet: Close request is expired");
      return {
        isForceCloseAllowed: false,
        forceCloseError: "Close request is expired",
      };
    }
    if (
      !endTimestampBN.isZero() &&
      !startTimestampBN.isZero() &&
      endTimestampBN.minus(startTimestampBN).isLessThan(forceCloseMinSigPeriod)
    ) {
      // require(sig.endTime - sig.startTime >= maLayout.forceCloseMinSigPeriod, "PartyAFacet: Invalid signature period");
      return {
        isForceCloseAllowed: false,
        forceCloseError: "Invalid signature period",
      };
    }

    if (forceCloseCalculationLoading) {
      return {
        isForceCloseAllowed: false,
        forceCloseError: "Calculating",
      };
    }

    if (!forceCloseEnabled) {
      return {
        isForceCloseAllowed: false,
        forceCloseError: "Price condition was not met",
      };
    }

    return { isForceCloseAllowed: true };
  }, [
    openTimestamp,
    closeTimestamp,
    forceCloseFirstCooldown,
    statusModifyTimestamp,
    forceCloseSecondCooldown,
    deadline,
    forceCloseMinSigPeriod,
    forceCloseCalculationLoading,
    forceCloseEnabled,
  ]);

  const handleForceClose = useCallback(async () => {
    if (error) console.debug({ error });

    if (!forceCloseCallback) return;
    try {
      setAwaitingCancelConfirmation(true);

      await forceCloseCallback();

      setAwaitingCancelConfirmation(false);
      toggleModal();
    } catch (e) {
      toggleModal();

      setAwaitingCancelConfirmation(false);
      console.error(e);
    }
  }, [error, forceCloseCallback, toggleModal]);

  if (!chainId || !account) return <ConnectWallet />;
  else if (isPendingTxs) {
    return (
      <MainButton disabled>
        Transacting <DotFlashing />
      </MainButton>
    );
  } else if (awaitingCancelConfirmation) {
    return (
      <MainButton disabled>
        Awaiting Confirmation <DotFlashing />
      </MainButton>
    );
  } else if (!isForceCloseAllowed) {
    return (
      <MainButton disabled>
        {forceCloseError ?? "Can not use force close"}
      </MainButton>
    );
  }

  return (
    <MainButton height={"48px"} onClick={handleForceClose}>
      {buttonText}
    </MainButton>
  );
}
