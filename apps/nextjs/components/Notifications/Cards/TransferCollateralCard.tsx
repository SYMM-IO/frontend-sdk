import React from "react";

import DEPOSIT_USDT_ICON from "/public/static/images/etc/DepositFUSDT.svg";
import WITHDRAW_USDT_ICON from "/public/static/images/etc/WithdrawFUSDT.svg";
import DEPOSIT_USDC_ICON from "/public/static/images/etc/DepositUSDC.svg";
import WITHDRAW_USDC_ICON from "/public/static/images/etc/WithdrawUSDC.svg";

import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { Account } from "@symmio/frontend-sdk/types/user";
import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { NotificationDetails } from "@symmio/frontend-sdk/state/notifications/types";

import BaseItem from "components/Notifications/Cards/BaseCard";

export default function TransferCollateralCard({
  notification,
  account,
}: {
  notification: NotificationDetails;
  account: Account;
  loading?: boolean;
}): JSX.Element {
  const { chainId } = useActiveWagmi();
  const { modifyTime, transferAmount, transferType } = notification;
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const icon = useTransferTypeIcon(transferType);
  const text =
    transferType === TransferTab.DEALLOCATE
      ? `${transferType} submitted.`
      : `${transferType} successful.`;

  return (
    <BaseItem
      title={`${transferAmount} ${collateralCurrency?.symbol} ${transferType}`}
      text={text}
      icon={icon}
      timestamp={modifyTime}
      accountName={account.name}
    />
  );
}

function useTransferTypeIcon(transferType: TransferTab | undefined) {
  const { chainId } = useActiveWagmi();
  let icon;

  switch (chainId) {
    case SupportedChainId.BSC:
      icon =
        transferType === TransferTab.DEPOSIT
          ? DEPOSIT_USDT_ICON
          : WITHDRAW_USDT_ICON;
      break;
    default:
      icon =
        transferType === TransferTab.DEPOSIT
          ? DEPOSIT_USDC_ICON
          : WITHDRAW_USDC_ICON;
  }

  return icon;
}
