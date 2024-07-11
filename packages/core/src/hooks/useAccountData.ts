import { useMemo } from "react";

import { toBN } from "../utils/numbers";
import { WEB_SETTING } from "../config";

import {
  useAccountPartyAStat,
  useAccountUpnl,
  useActiveAccount,
  useUpnlWebSocketStatus,
} from "../state/user/hooks";
import { ConnectionStatus } from "../types/api";

export interface Emoji {
  symbol: string;
  label: string;
}

export interface AccountData {
  equity: string;
  maintenanceMargin: string;
  accountHealthData: {
    health: string;
    healthColor: string;
    healthEmoji: Emoji;
  };
  availableForOrder: string;
  loading: boolean;
}

export default function useAccountData(): AccountData {
  const { upnl } = useAccountUpnl() || {};
  const { accountAddress } = useActiveAccount() || {};

  const {
    allocatedBalance,
    lockedCVA,
    lockedLF,
    lockedPartyAMM,
    pendingLockedCVA,
    pendingLockedLF,
    pendingLockedPartyAMM,
    loading: statsLoading,
    liquidationStatus,
  } = useAccountPartyAStat(accountAddress);
  const upnlWebSocketStatus = useUpnlWebSocketStatus();

  const loading = statsLoading || upnlWebSocketStatus !== ConnectionStatus.OPEN;

  const equity = toBN(allocatedBalance).plus(upnl).toString();

  const maintenanceMargin = toBN(lockedCVA).plus(lockedLF).toString();

  const accountHealthData = useMemo(() => {
    const rawAccountHealth = toBN(equity)
      .minus(maintenanceMargin)
      .div(toBN(allocatedBalance).minus(maintenanceMargin))
      .times(100);
    const health = toBN(equity).gt(0)
      ? rawAccountHealth.toString()
      : rawAccountHealth.times(-1).toString();
    const healthColor = getAccountColor(health, liquidationStatus);
    const healthEmoji = getAccountEmoji(health, liquidationStatus);

    return { health, healthColor, healthEmoji };
  }, [allocatedBalance, equity, liquidationStatus, maintenanceMargin]);

  const totalLocked = toBN(lockedCVA)
    .plus(lockedLF)
    .plus(lockedPartyAMM)
    .toString();
  const totalPendingLocked = toBN(pendingLockedCVA)
    .plus(pendingLockedLF)
    .plus(pendingLockedPartyAMM)
    .toString();

  const availableForOrder = useMemo(() => {
    if (upnl >= 0)
      return toBN(allocatedBalance)
        .plus(upnl)
        .minus(totalLocked)
        .minus(totalPendingLocked)
        .toString();
    else {
      const considering_mm = toBN(upnl).times(-1).minus(lockedPartyAMM).gt(0)
        ? toBN(upnl).times(-1)
        : lockedPartyAMM;
      return toBN(allocatedBalance)
        .minus(lockedCVA)
        .minus(lockedLF)
        .minus(totalPendingLocked)
        .minus(considering_mm)
        .toString();
    }
  }, [
    allocatedBalance,
    lockedCVA,
    lockedLF,
    lockedPartyAMM,
    totalLocked,
    totalPendingLocked,
    upnl,
  ]);

  return useMemo(
    () => ({
      equity,
      maintenanceMargin,
      accountHealthData,
      availableForOrder,
      loading,
    }),
    [accountHealthData, availableForOrder, equity, loading, maintenanceMargin]
  );
}

function getAccountColor(accountHealth: string, isLiquidated: boolean) {
  const accountHealthBN = toBN(accountHealth);
  if (isLiquidated) return "#EA5E5E";
  if (!WEB_SETTING.showColorfulAccountHealth) {
    return "";
  } else if (accountHealthBN.lt(10)) {
    return "#F84F4F";
  } else if (accountHealthBN.lt(25)) {
    return "#F84F4F";
  } else if (accountHealthBN.lt(50)) {
    return "#EA805E";
  } else if (accountHealthBN.lt(75)) {
    return "#94D47D";
  } else {
    return "#6FF37B";
  }
}

function getAccountEmoji(accountHealth: string, isLiquidated: boolean): Emoji {
  const accountHealthBN = toBN(accountHealth);
  if (isLiquidated) {
    return { symbol: "☠️", label: "skull-and-crossbones" };
  }
  if (!WEB_SETTING.showAccountHealthEmoji) {
    return { symbol: "", label: "" };
  } else if (accountHealthBN.lt(10)) {
    return { symbol: "🥵", label: "hot-face" };
  } else if (accountHealthBN.lt(25)) {
    return { symbol: "😨", label: "fearful-face" };
  } else if (accountHealthBN.lt(50)) {
    return { symbol: "🙄", label: "face-with-rolling-eyes" };
  } else if (accountHealthBN.lt(75)) {
    return { symbol: "😊", label: "smiling-face-with-smiling-eyes" };
  } else {
    return { symbol: "😍", label: "smiling-face-with-heart-eyes" };
  }
}
