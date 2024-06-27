import React, { useCallback, useContext } from "react";
import toast from "react-hot-toast";
import { useSentQuoteCallback } from "@symmio/frontend-sdk/callbacks/useSendQuote";
import useTradePage from "@symmio/frontend-sdk/hooks/useTradePage";
import { ModalState, StateContext } from "./ModalData";
import ErrorButton from "components/Button/ErrorButton";
import OpenPositionButton from "components/Button/OpenPositionButton";

export default function ActionButton() {
  const { state } = useTradePage();
  const { setState, state: modalState, setTxHash } = useContext(StateContext);

  const { callback: tradeCallback, error: tradeCallbackError } =
    useSentQuoteCallback();

  const onTrade = useCallback(async () => {
    if (!tradeCallback) {
      toast.error(tradeCallbackError);
      return;
    }
    if (modalState === ModalState.LOADING) return;

    setState(ModalState.LOADING);
    const tx = await tradeCallback();
    console.log("tx", tx);
    if (tx) setTxHash(tx.hash);
    else setState(ModalState.START);
  }, [modalState, setState, setTxHash, tradeCallback, tradeCallbackError]);

  if (state) {
    return <ErrorButton state={state} disabled={true} exclamationMark={true} />;
  }

  return (
    <OpenPositionButton
      loading={modalState === ModalState.LOADING}
      onClick={() => onTrade()}
    />
  );
}
