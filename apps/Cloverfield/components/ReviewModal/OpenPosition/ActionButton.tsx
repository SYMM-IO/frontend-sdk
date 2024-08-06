import React, { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSentQuoteCallback } from "@symmio/frontend-sdk/callbacks/useSendQuote";
import useTradePage from "@symmio/frontend-sdk/hooks/useTradePage";
import { ModalState, StateContext } from "./ModalData";
import ErrorButton from "components/Button/ErrorButton";
import OpenPositionButton from "components/Button/OpenPositionButton";
import { useSetTpSlState } from "@symmio/frontend-sdk/state/trade/hooks";
import { TpSlProcessState } from "@symmio/frontend-sdk/state/trade/types";
import { getCurrentTimeInSecond } from "@symmio/frontend-sdk/utils/time";
import useInstantActions from "@symmio/frontend-sdk/hooks/useInstantActions";
import { useInstantOpenDelegateAccesses } from "@symmio/frontend-sdk/callbacks/useDelegateAccesses";
import { TransactionStatus } from "@symmio/frontend-sdk/utils/web3";

export default function ActionButton() {
  const { state } = useTradePage();
  const { setState, state: modalState, setTxHash } = useContext(StateContext);
  const setTradeTpSl = useSetTpSlState();
  const { callback: tradeCallback, error: tradeCallbackError } =
    useSentQuoteCallback();

  const { handleInstantOpen, loading, text } = useInstantOpenPosition();

  const onTrade = useCallback(async () => {
    if (!tradeCallback) {
      toast.error(tradeCallbackError);
      return;
    }
    if (modalState === ModalState.LOADING) return;

    setState(ModalState.LOADING);
    setTradeTpSl({
      state: TpSlProcessState.WAIT_FOR_QUOTE_RECEIVE,
      lastTimeUpdated: getCurrentTimeInSecond(),
    });
    const tx = await tradeCallback();

    console.log("tx", tx);
    if (tx) setTxHash(tx.hash);
    else setState(ModalState.START);
  }, [
    modalState,
    setState,
    setTradeTpSl,
    setTxHash,
    tradeCallback,
    tradeCallbackError,
  ]);

  if (state) {
    return <ErrorButton state={state} disabled={true} exclamationMark={true} />;
  }

  return (
    <React.Fragment>
      <OpenPositionButton
        loading={modalState === ModalState.LOADING}
        onClick={() => onTrade()}
      />
      <OpenPositionButton
        loading={modalState === ModalState.LOADING || loading}
        onClick={() => handleInstantOpen()}
        customText={text}
      />
    </React.Fragment>
  );
}

function useInstantOpenPosition() {
  const { instantOpen, isSendQuoteDelegated } = useInstantActions();
  const { delegateAccessCallback, error } = useInstantOpenDelegateAccesses();
  const { state: modalState } = useContext(StateContext);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSendQuoteDelegated) setText("Instant Open");
    else setText("Delegate Access for Instant Open");
  }, [isSendQuoteDelegated]);

  const handleInstantOpen = useCallback(async () => {
    if (error) {
      toast.error(error);
      return;
    }

    if (modalState === ModalState.LOADING || loading) return;

    if (!isSendQuoteDelegated && delegateAccessCallback) {
      setLoading(true);
      setText("Delegating");
      const res = await delegateAccessCallback();

      if (res.status !== TransactionStatus.SUCCESS) {
        toast.error(res.message);
        setLoading(false);
        setText("Delegate Access for Instant Open");
        console.error(res);
        return;
      }
    }

    try {
      setLoading(true);
      await instantOpen();
      toast.success("open sent to hedger");
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error(e.message);
      console.error(e);
    }
  }, [
    delegateAccessCallback,
    error,
    instantOpen,
    isSendQuoteDelegated,
    loading,
    modalState,
  ]);

  return { handleInstantOpen, loading, text };
}
