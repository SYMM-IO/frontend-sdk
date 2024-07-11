import { ChangeEvent } from "react";
import styled from "styled-components";

import {
  useSetIsActiveStopLoss,
  useSetStopLossPrice,
  useStopLossValues,
} from "@symmio/frontend-sdk/state/trade/hooks";

import SwitchInput from "components/Input/SwitchInput";

const Container = styled.div`
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.bg4};
  border-bottom: 1px solid ${({ theme }) => theme.bg4};
`;

export default function StopLoss() {
  const { isActive, stopLossPrice } = useStopLossValues();
  const setPrice = useSetStopLossPrice();
  const setIsActive = useSetIsActiveStopLoss();

  const handleSwitchChange = () => {
    setIsActive(!isActive);
    setPrice("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  return (
    <Container>
      <SwitchInput
        id="trade-stop-loss"
        isSwitchOn={isActive}
        onSwitchChange={handleSwitchChange}
        label="Stop Loss (Delta Neutral)"
        placeholder="Stop Price, Percentage(%10)"
        value={stopLossPrice}
        onValueChange={handleInputChange}
      />
    </Container>
  );
}
