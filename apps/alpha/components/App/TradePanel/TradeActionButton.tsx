import { useEffect, useMemo, useState } from "react";
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
} from "@symmio/frontend-sdk/state/trade/hooks";
import { useIsHavePendingTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";
import { PrimaryButton } from "components/Button";
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

export default function TradeActionButtons(): JSX.Element | null {
  const validatedContext = useInvalidContext();
  const market = useActiveMarket();
  const connectionStatus = useWebSocketStatus();

  const toggleShowTradeInfoModal = useToggleOpenPositionModal();
  const isPendingTxs = useIsHavePendingTransaction();

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
    return <PrimaryButton disabled>Accept Terms Please</PrimaryButton>;
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
      <PrimaryButton disabled>
        Waiting for Calculation
        <DotFlashing />
      </PrimaryButton>
    );
  }
  if (isPendingTxs) {
    return (
      <PrimaryButton disabled>
        Transacting <DotFlashing />
      </PrimaryButton>
    );
  }

  if (calculationMode) {
    return (
      <PrimaryButton onClick={onEnterPress}>Calculate Amount</PrimaryButton>
    );
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
