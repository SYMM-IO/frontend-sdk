import { createContext } from "react";

export enum ModalState {
  START,
  LOADING,
  END,
}

export const StateContext = createContext<{
  state: ModalState;
  setState: (state: ModalState) => void;
  setTxHash: (hash: string) => void;
}>({
  state: ModalState.START,
  setState() {
    return;
  },
  setTxHash() {
    return;
  },
});
