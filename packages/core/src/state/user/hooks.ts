import { useCallback, useMemo } from "react";
import { shallowEqual } from "react-redux";

import { makeHttpRequest } from "../../utils/http";
import { BALANCE_HISTORY_ITEMS_NUMBER } from "../../constants/misc";
import {
  Account,
  UserPartyAStatDetail,
  initialUserPartyAStatDetail,
} from "../../types/user";
import { ApiState, ConnectionStatus } from "../../types/api";
import {
  AddedHedger,
  AddedHedgersData,
  BalanceHistoryData,
  GetWhiteListType,
  WhiteListResponse,
} from "./types";
import { getBalanceHistory } from "./thunks";
import {
  AppThunkDispatch,
  useAppDispatch,
  useAppSelector,
} from "../declaration";
import { WEB_SETTING } from "../../config/index";

import {
  updateUserSlippageTolerance,
  updateUserDarkMode,
  updateUserLeverage,
  updateUserFavorites,
  updateUserExpertMode,
  updateUpnlWebSocketStatus,
  setFEName,
  addHedger,
  selectOrUnselectHedger,
  setAllHedgerData,
  removeHedger,
  toggleDefaultHedger,
  updateAccount,
  updateCustomHedgerMode,
  updateBypassPrecisionCheckMode,
} from "./actions";
import { useHedgerInfo } from "../hedger/hooks";
import useDebounce from "../../lib/hooks/useDebounce";
import { getAppNameHeader } from "../hedger/thunks";
import {
  useAnalyticsSubgraphAddress,
  useAppName,
  usePartyBWhitelistAddress,
} from "../chains/hooks";
import { useAnalyticsApolloClient } from "../../apollo/client/balanceHistory";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  );
  return userDarkMode === null ? matchesDarkMode : userDarkMode;
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch();
  const darkMode = useIsDarkMode();

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }));
  }, [darkMode, dispatch]);

  return [darkMode, toggleSetDarkMode];
}

export function useSetSlippageToleranceCallback(): (
  slippageTolerance: "auto"
) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (userSlippageTolerance: "auto") => {
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance,
        })
      );
    },
    [dispatch]
  );
}

export function useSlippageTolerance(): number | "auto" {
  const userSlippageTolerance = useAppSelector(
    (state) => state.user.userSlippageTolerance
  );
  return userSlippageTolerance;
}

export function useSetExpertModeCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (userExpertMode: boolean) => {
      dispatch(updateUserExpertMode({ userExpertMode }));
    },
    [dispatch]
  );
}

export function useExpertMode(): boolean {
  const userExpertMode = useAppSelector((state) => state.user.userExpertMode);
  return userExpertMode ? true : false;
}

export function useSetCustomHedgerModeCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (customHedgerMode: boolean) => {
      dispatch(updateCustomHedgerMode({ customHedgerMode }));
    },
    [dispatch]
  );
}

export function useCustomHedgerMode(): boolean {
  const customHedgerMode = useAppSelector(
    (state) => state.user.customHedgerMode
  );
  return customHedgerMode ? true : false;
}

export function useSetBypassPrecisionCheckModeCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (bypassPrecisionCheckMode: boolean) => {
      dispatch(updateBypassPrecisionCheckMode({ bypassPrecisionCheckMode }));
    },
    [dispatch]
  );
}

export function useBypassPrecisionCheckMode(): boolean {
  const bypassPrecisionCheckMode = useAppSelector(
    (state) => state.user.bypassPrecisionCheckMode
  );
  return bypassPrecisionCheckMode ? true : false;
}

export function useUserWhitelist(): null | boolean {
  const whiteListAccount = useAppSelector(
    (state) => state.user.whiteListAccount
  );
  return whiteListAccount;
}

export function useLeverage(): number {
  const leverage = useAppSelector((state) => state.user.leverage);
  return leverage;
}

export function useSetLeverageCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (leverage: number) => {
      dispatch(updateUserLeverage(leverage));
    },
    [dispatch]
  );
}

export function useFavorites(): number[] {
  const favorites = useAppSelector((state) => state.user.favorites);
  return favorites;
}

export function useFEName(): string {
  const frontEndName = useAppSelector((state) => state.user.frontEndName);
  return frontEndName;
}

export function useToggleUserFavoriteCallback(id: number): () => void {
  const dispatch = useAppDispatch();
  const favorites = useFavorites() ?? [];

  return useCallback(() => {
    const isFavorite = favorites?.includes(id);
    if (isFavorite) {
      const filteredFavorites = favorites.filter((favorite) => favorite !== id);
      dispatch(updateUserFavorites(filteredFavorites));
    } else {
      dispatch(updateUserFavorites([...favorites, id]));
    }
  }, [favorites, id, dispatch]);
}

export function useActiveAccount(): Account | null {
  const activeAccount = useAppSelector((state) => state.user.activeAccount);
  return activeAccount;
}

export function useActiveAccountAddress(): string | null {
  const activeAccount = useAppSelector((state) => state.user.activeAccount);
  return activeAccount && activeAccount.accountAddress;
}

export function useAccountPartyAStat(
  address: string | null | undefined
): UserPartyAStatDetail {
  const accountsPartyAStat = useAppSelector(
    (state) => state.user.accountsPartyAStat
  );
  if (!address || !accountsPartyAStat) return initialUserPartyAStatDetail;
  if (!accountsPartyAStat[address]) return initialUserPartyAStatDetail;
  return accountsPartyAStat[address];
}

export function useAccountUpnl() {
  const activeAccountUpnl = useAppSelector(
    (state) => state.user.activeAccountUpnl
  );
  return activeAccountUpnl;
}

export function useSetUpnlWebSocketStatus() {
  const dispatch = useAppDispatch();
  return useCallback(
    (status: ConnectionStatus) => {
      dispatch(updateUpnlWebSocketStatus({ status }));
    },
    [dispatch]
  );
}

export function useGetAddedHedgers(): AddedHedgersData {
  const addedHedgers = useAppSelector((state) => state.user.addedHedgers);
  return addedHedgers;
}

export function useGetDefaultHedgerStatus(): boolean {
  const isDefaultHedgerSelected = useAppSelector(
    (state) => state.user.isDefaultHedgerSelected
  );
  return isDefaultHedgerSelected;
}

export function useGetBalanceHistoryCallback() {
  const thunkDispatch: AppThunkDispatch = useAppDispatch();
  const client = useAnalyticsApolloClient();
  const subgraphAddress = useAnalyticsSubgraphAddress();

  return useCallback(
    (
      chainId: number | undefined,
      account: string | null,
      skip?: number,
      first?: number
    ) => {
      if (!chainId || !account) return;
      thunkDispatch(
        getBalanceHistory({
          account,
          chainId,
          client,
          first: first ?? BALANCE_HISTORY_ITEMS_NUMBER,
          skip: skip ? skip : 0,
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thunkDispatch, subgraphAddress]
  );
}

export function useUpnlWebSocketStatus() {
  const upnlWebSocketStatus = useAppSelector(
    (state) => state.user.upnlWebSocketStatus
  );
  return upnlWebSocketStatus;
}

export function useIsWhiteList(
  account: string | undefined,
  multiAccountAddress: string | undefined
): () => Promise<WhiteListResponse> {
  const { baseUrl, fetchData } = useHedgerInfo() || {};
  const appName = useAppName();

  const isWhiteList = useCallback(async () => {
    if (
      !WEB_SETTING.checkWhiteList ||
      !fetchData ||
      !account ||
      !baseUrl ||
      !multiAccountAddress
    ) {
      return Promise.reject("");
    }

    const { href: url } = new URL(
      `/check_in-whitelist/${account}/${multiAccountAddress}`,
      baseUrl
    );
    return makeHttpRequest<WhiteListResponse>(url, getAppNameHeader(appName));
  }, [fetchData, account, baseUrl, multiAccountAddress, appName]);

  return isWhiteList;
}

export function useAddInWhitelist(
  subAccount: string | undefined,
  multiAccountAddress: string | undefined
): () => Promise<GetWhiteListType | null> {
  const { baseUrl, fetchData } = useHedgerInfo() || {};
  const appName = useAppName();

  const addInWhitelist = useCallback(async () => {
    if (
      !WEB_SETTING.checkWhiteList ||
      !fetchData ||
      !subAccount ||
      !baseUrl ||
      !multiAccountAddress
    ) {
      return Promise.reject("");
    }

    const { href: url } = new URL(
      `/add-sub-address-in-whitelist/${subAccount}/${multiAccountAddress}`,
      baseUrl
    );
    return makeHttpRequest<GetWhiteListType>(url, getAppNameHeader(appName));
  }, [appName, baseUrl, fetchData, multiAccountAddress, subAccount]);

  return addInWhitelist;
}

export function useBalanceHistory(): {
  hasMoreHistory: boolean | undefined;
  balanceHistory: { [txHash: string]: BalanceHistoryData } | undefined;
  balanceHistoryState: ApiState;
} {
  const hasMoreHistory = useAppSelector((state) => state.user.hasMoreHistory);
  const balanceHistory = useAppSelector((state) => state.user.balanceHistory);
  const balanceHistoryState = useAppSelector(
    (state) => state.user.balanceHistoryState
  );

  return { hasMoreHistory, balanceHistory, balanceHistoryState };
}

export function useTotalDepositsAndWithdrawals() {
  const depositWithdrawalsData = useAppSelector(
    (state) => state.user.depositWithdrawalsData
  );
  const depositWithdrawalsState = useAppSelector(
    (state) => state.user.depositWithdrawalsState
  );
  const debounceState = useDebounce(depositWithdrawalsState, 200);

  return { depositWithdrawalsData, depositWithdrawalsState: debounceState };
}

export function usePartyBsWhiteList() {
  const { chainId } = useActiveWagmi();
  const PARTY_B_WHITELIST = usePartyBWhitelistAddress();
  const isDefaultHedgerSelected = useGetDefaultHedgerStatus();
  const addedHedgers = useGetAddedHedgers();
  const isCustomHedgerMode = useCustomHedgerMode();

  const partyBWhiteList = useMemo(() => {
    if (chainId) {
      const whitelist = PARTY_B_WHITELIST[chainId] || [];
      if (!isCustomHedgerMode || isDefaultHedgerSelected) return [whitelist];
    }
    return [];
  }, [PARTY_B_WHITELIST, chainId, isCustomHedgerMode, isDefaultHedgerSelected]);

  const added = useMemo(() => {
    if (chainId && isCustomHedgerMode && addedHedgers[chainId]?.length > 0) {
      return addedHedgers[chainId]
        .filter((h) => h.isSelected)
        .map((h) => h.address);
    }
    return [];
  }, [addedHedgers, chainId, isCustomHedgerMode]);

  return [...added, ...partyBWhiteList.flat()];
}

export function useIsTermsAccepted() {
  const isTermsAccepted = useAppSelector((state) => state.user.isTermsAccepted);
  return isTermsAccepted;
}

export function useSetFEName() {
  const dispatch = useAppDispatch();
  return useCallback(
    (name: string) => {
      dispatch(setFEName(name));
    },
    [dispatch]
  );
}

export function useAddHedgerCallback() {
  const dispatch = useAppDispatch();
  const { chainId } = useActiveWagmi();

  return useCallback(
    (name: string, address: string) => {
      dispatch(addHedger({ name, address, chainId }));
    },
    [chainId, dispatch]
  );
}

export function useSelectOrUnselectHedgerCallback() {
  const dispatch = useAppDispatch();
  const { chainId } = useActiveWagmi();

  return useCallback(
    (hedger: AddedHedger) => {
      dispatch(selectOrUnselectHedger({ hedger, chainId }));
    },
    [chainId, dispatch]
  );
}

export function useSetHedgerDataCallback() {
  const dispatch = useAppDispatch();

  return useCallback(
    (data: AddedHedgersData) => {
      dispatch(setAllHedgerData(data));
    },
    [dispatch]
  );
}

export function useRemoveHedgerCallback() {
  const dispatch = useAppDispatch();
  const { chainId } = useActiveWagmi();

  return useCallback(
    (address: string) => {
      dispatch(removeHedger({ address, chainId }));
    },
    [chainId, dispatch]
  );
}

export function useToggleDefaultHedgerCallback() {
  const dispatch = useAppDispatch();

  return useCallback(() => {
    dispatch(toggleDefaultHedger());
  }, [dispatch]);
}

export function useSetActiveSubAccount() {
  const dispatch = useAppDispatch();

  return useCallback(
    (accountAddress?: string, name?: string, owner?: string) => {
      dispatch(
        updateAccount(
          accountAddress && name && owner
            ? { accountAddress, name, owner }
            : null
        )
      );
    },
    [dispatch]
  );
}
