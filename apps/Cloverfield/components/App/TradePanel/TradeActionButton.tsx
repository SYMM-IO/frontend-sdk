import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DotFlashing } from "components/Icons";
import { useToggleOpenPositionModal } from "@symmio/frontend-sdk/state/application/hooks";
import {
  ContextError,
  InvalidContext,
  useInvalidContext,
} from "components/InvalidContext";
import ErrorButton from "components/Button/ErrorButton";
import { useWebSocketStatus } from "@symmio/frontend-sdk/state/hedger/hooks";
import {
  useSetLimitPrice,
  useActiveMarket,
  useSetTypedValue,
  useTpSlDelegate,
  useTradeTpSl,
} from "@symmio/frontend-sdk/state/trade/hooks";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";
import { MainButton } from "components/Button";
import { RowStart } from "components/Row";
import useTradePage from "@symmio/frontend-sdk/hooks/useTradePage";
import { DEFAULT_PRECISION } from "@symmio/frontend-sdk/constants/misc";
import { calculateString } from "utils/calculationalString";
import { InputField } from "@symmio/frontend-sdk/types/trade";
import { ConnectionStatus } from "@symmio/frontend-sdk/types/api";
import {
  useUserWhitelist,
  useIsTermsAccepted,
} from "@symmio/frontend-sdk/state/user/hooks";
import { WEB_SETTING } from "@symmio/frontend-sdk/config";
import OpenPositionButton from "components/Button/OpenPositionButton";
import { useTpSlDelegateAccesses } from "@symmio/frontend-sdk/callbacks/useDelegateAccesses";
import { TransactionStatus } from "@symmio/frontend-sdk/utils/web3";

export default function TradeActionButtons(): JSX.Element | null {
  const validatedContext = useInvalidContext();
  const market = useActiveMarket();
  const connectionStatus = useWebSocketStatus();

  const toggleShowTradeInfoModal = useToggleOpenPositionModal();
  const isPendingTxs = useIsHavePendingTransaction();
  const { tp, sl } = useTradeTpSl();
  const delegateStatus = useTpSlDelegate();
  const [delegateLoading, setDelegateLoading] = useState(false);
  const [calculationMode, setCalculationMode] = useState(false);
  const [calculationLoading, setCalculationLoading] = useState(false);

  const setLimitPrice = useSetLimitPrice();
  const setTypedValue = useSetTypedValue();
  const userWhitelisted = useUserWhitelist();
  const isAcceptTerms = useIsTermsAccepted();

  const { formattedAmounts, state, balance } = useTradePage();

  const pricePrecision = useMemo(
    () => (market ? market.pricePrecision : DEFAULT_PRECISION),
    [market]
  );
  const { setDelegateAccessCallBack, error } = useTpSlDelegateAccesses();

  const handleDelegateAccess = useCallback(async () => {
    if (error) console.debug({ error });
    if (!setDelegateAccessCallBack) return;

    setDelegateLoading(true);
    const { status, message } = await setDelegateAccessCallBack();
    if (status !== TransactionStatus.SUCCESS) {
      toast.error(message);
      setDelegateLoading(false);
    }
  }, [error, setDelegateAccessCallBack]);

  function onEnterPress() {
    setCalculationLoading(true);
    setCalculationMode(false);
    const result = calculateString(
      formattedAmounts[0],
      balance,
      pricePrecision,
      "1"
    );
    setTypedValue(result, InputField.PRICE);
    setCalculationLoading(false);
  }
  //reset amounts when user switches to another orderType or market
  useEffect(() => {
    setLimitPrice("");
    setTypedValue("", InputField.PRICE);
  }, [market]); // eslint-disable-line react-hooks/exhaustive-deps
  if (validatedContext !== ContextError.VALID) {
    return <InvalidContext />;
  }

  if (WEB_SETTING.showSignModal && !isAcceptTerms) {
    return <MainButton disabled>Accept Terms Please</MainButton>;
  }

  if (!delegateStatus && (tp || sl)) {
    return (
      <MainButton onClick={handleDelegateAccess} disabled={delegateLoading}>
        Allow to place TP/SL orders {delegateLoading && <DotFlashing />}
      </MainButton>
    );
  }

  // Pass if it is null or undefined
  if (market?.rfqAllowed === false) {
    return (
      <ErrorButton
        state={state}
        disabled
        exclamationMark
        customText="RFQ is not allowed for this market"
      />
    );
  }

  if (calculationLoading) {
    return (
      <MainButton disabled>
        Waiting for Calculation
        <DotFlashing />
      </MainButton>
    );
  }
  if (isPendingTxs) {
    return (
      <MainButton disabled>
        Transacting <DotFlashing />
      </MainButton>
    );
  }

  if (calculationMode) {
    return <MainButton onClick={onEnterPress}>Calculate Amount</MainButton>;
  }

  if (connectionStatus !== ConnectionStatus.OPEN) {
    return (
      <ErrorButton
        state={state}
        disabled={true}
        exclamationMark={true}
        customText={"Hedger disconnected"}
      />
    );
  }

  if (state) {
    return <ErrorButton state={state} disabled={true} exclamationMark={true} />;
  }
  if (userWhitelisted === false) {
    return (
      <ErrorButton
        state={state}
        disabled={true}
        exclamationMark={true}
        customText={"You are not whitelisted"}
      />
    );
  }

  return (
    <RowStart>
      <OpenPositionButton onClick={() => toggleShowTradeInfoModal()} />
    </RowStart>
  );
}
