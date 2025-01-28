import { useCallback, useMemo } from "react";

import { DEFAULT_TXN_DISMISS_MS } from "../../constants/misc";
import { AppState, useAppDispatch, useAppSelector } from "../declaration";
import {
  addPopup,
  removePopup,
  setInjectedAddress,
  setOpenModal,
} from "./actions";
import { ApplicationModal, Popup, PopupContent, PopupList } from "./reducer";

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector(
    (state: AppState) => state.application.openModal
  );
  return openModal === modal;
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(
    () => dispatch(setOpenModal(open ? null : modal)),
    [dispatch, modal, open]
  );
}

export function useToggleOpenPositionModal(): () => void {
  return useToggleModal(ApplicationModal.OPEN_POSITION);
}

export function useDepositModalToggle(): () => void {
  return useToggleModal(ApplicationModal.DEPOSIT);
}

export function useWithdrawModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WITHDRAW);
}

export function useWithdrawBarModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WITHDRAW_BAR);
}

export function useNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK);
}

export function useDashboardModalToggle(): () => void {
  return useToggleModal(ApplicationModal.DASHBOARD);
}

export function useCreateAccountModalToggle(): () => void {
  return useToggleModal(ApplicationModal.CREATE_ACCOUNT);
}

export function useAdvancedSettingModalToggle(): () => void {
  return useToggleModal(ApplicationModal.ADVANCED_SETTINGS);
}

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  key?: string,
  removeAfterMs?: number
) => void {
  const dispatch = useAppDispatch();

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      dispatch(
        addPopup({
          content,
          key,
          removeAfterMs: removeAfterMs ?? DEFAULT_TXN_DISMISS_MS,
        })
      );
    },
    [dispatch]
  );
}
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch]
  );
}

export function useActivePopups(): PopupList {
  const list = useAppSelector((state: AppState) => {
    return state.application.popupList;
  });
  return useMemo(() => list.filter((item: Popup) => item.show), [list]);
}

export function useInjectedAddress(): string {
  const injectedAddress = useAppSelector((state: AppState) => {
    return state.application.injectedAddress;
  });
  return injectedAddress;
}

export function useSetInjectedAddressCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (address: string) => {
      dispatch(setInjectedAddress({ address }));
    },
    [dispatch]
  );
}
