import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-hot-toast";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import { getRemainingTime } from "@symmio/frontend-sdk/utils/time";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import {
  formatCurrency,
  formatPrice,
  toBN,
} from "@symmio/frontend-sdk/utils/numbers";

import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";
import { useModalOpen } from "@symmio/frontend-sdk/state/application/hooks";
import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";

import { useTransferCollateral } from "@symmio/frontend-sdk/callbacks/useTransferCollateral";

import { RowCenter, RowBetween } from "components/Row";
import { DotFlashing } from "components/Icons";

const RemainingWrap = styled(RowCenter)<{ cursor?: string }>`
  width: 100%;
  height: 40px;
  font-size: 12px;
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.white};
  cursor: ${({ cursor }) => cursor ?? "progress"};
`;

const RemainingBlock = styled.div<{ width?: string }>`
  background: ${({ theme }) => theme.CTAPink};
  opacity: 0.6;
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
  width: ${({ width }) => width ?? "unset"};
`;

const Text = styled(RowBetween)<{ filling?: boolean }>`
  justify-content: ${({ filling }) => (filling ? "space-between" : "center")};
  color: ${({ theme }) => theme.icons};
  padding: 0 12px;
  font-weight: 500;
  font-size: 12px;
  z-index: 300;
  color: ${({ theme }) => theme.text0};
  z-index: 9;
`;

const TimerText = styled.span`
  color: #dcab2e;
`;
function Timer() {
  const [, setState] = useState(false);

  const activeAccountAddress = useActiveAccountAddress();
  const { withdrawCooldown, cooldownMA } =
    useAccountPartyAStat(activeAccountAddress);
  const { hours, seconds, minutes } = getRemainingTime(
    toBN(withdrawCooldown).plus(cooldownMA).times(1000).toNumber()
  );

  useEffect(() => {
    // for forcing component to re-render every second
    const interval = setInterval(
      () => setState((prevState) => !prevState),
      1000
    );
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <TimerText>
      {hours.toString().padStart(2, "0")} :{" "}
      {minutes.toString().padStart(2, "0")} :{" "}
      {seconds.toString().padStart(2, "0")}
    </TimerText>
  );
}

export default function WithdrawCooldown({
  formatedAmount,
  text,
}: {
  formatedAmount: boolean;
  text?: string;
}) {
  const { chainId } = useActiveWagmi();
  const activeAccountAddress = useActiveAccountAddress();
  const { accountBalance, withdrawCooldown, cooldownMA } =
    useAccountPartyAStat(activeAccountAddress);

  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const { callback: transferBalanceCallback, error: transferBalanceError } =
    useTransferCollateral(
      formatPrice(accountBalance, collateralCurrency?.decimals),
      TransferTab.WITHDRAW
    );
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const remainingPercent = useMemo(() => {
    const cooldownRemainPercent = toBN(currentTimestamp)
      .minus(withdrawCooldown)
      .div(cooldownMA)
      .times(100);
    return cooldownRemainPercent.gte(0) && cooldownRemainPercent.lte(100)
      ? cooldownRemainPercent.toFixed(0)
      : null;
  }, [cooldownMA, currentTimestamp, withdrawCooldown]);
  const { diff } = getRemainingTime(
    toBN(withdrawCooldown).plus(cooldownMA).times(1000).toNumber()
  );

  const showWithdrawBarModal = useModalOpen(ApplicationModal.WITHDRAW_BAR);
  const showWithdrawModal = useModalOpen(ApplicationModal.WITHDRAW);

  const handleAction = useCallback(async () => {
    if (!showWithdrawBarModal && !showWithdrawModal) return;

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
        console.log("awaitingConfirmation Error", e.message);
      } else {
        console.error(e);
      }
    }
  }, [
    showWithdrawBarModal,
    showWithdrawModal,
    transferBalanceCallback,
    transferBalanceError,
  ]);

  const fixedAccountBalance = formatPrice(
    accountBalance,
    collateralCurrency?.decimals
  );

  if (toBN(fixedAccountBalance).isGreaterThan(0)) {
    if (diff > 0) {
      return (
        <RemainingWrap>
          <Text filling>
            <span>
              Withdraw {fixedAccountBalance} {collateralCurrency?.symbol}
            </span>
            <Timer />
          </Text>
          <RemainingBlock width={`${remainingPercent}%`} />
        </RemainingWrap>
      );
    } else {
      const balance = formatedAmount
        ? formatPrice(fixedAccountBalance, 2, true)
        : formatCurrency(fixedAccountBalance, 4, true);

      if (awaitingConfirmation) {
        return (
          <RemainingWrap cursor={"default"}>
            <Text>
              {text ?? `Withdraw ${balance} ${collateralCurrency?.symbol}`}
              <DotFlashing />
            </Text>
          </RemainingWrap>
        );
      }
      return (
        <RemainingWrap onClick={handleAction} cursor={"pointer"}>
          <Text>
            {text ?? `Withdraw ${balance} ${collateralCurrency?.symbol}`}
          </Text>
        </RemainingWrap>
      );
    }
  } else {
    return null;
  }
}
