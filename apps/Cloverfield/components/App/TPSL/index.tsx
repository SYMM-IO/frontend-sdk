import {
  DEFAULT_PRECISION,
  DEFAULT_SLIPPAGE,
} from "@symmio/frontend-sdk/constants";
import {
  useActiveMarket,
  useActiveMarketPrice,
  useLimitPrice,
  useOrderType,
  useSetTpSl,
  useTradeTpSl,
  useTypedValue,
} from "@symmio/frontend-sdk/state/trade/hooks";
import { TpSlProcessState } from "@symmio/frontend-sdk/state/trade/types";
import { OrderType } from "@symmio/frontend-sdk/types/trade";
import { getCurrentTimeInSecond } from "@symmio/frontend-sdk/utils/time";
import Checkbox from "components/CheckBox/checkBoxV2";
import Column from "components/Column";
import { NumericalInput } from "components/Input";
import { Row, RowBetween } from "components/Row";
import { ToolTip } from "components/ToolTip";
import { useState } from "react";
import styled from "styled-components";

const InputWrapperSimple = styled(RowBetween)<{ FocusEnabled?: boolean }>`
  height: 32px;
  width: 100%;
  border-radius: 6px;
  padding-left: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg3};
  border: ${({ theme, FocusEnabled }) =>
    FocusEnabled ? `1px solid ${theme.blue1}` : "unset"};
  & .input-tradePanel-tp,
  .input-tradePanel-sl {
    text-align: right;
    padding-right: 14px;
    font-size: 13px;
  }
  & .input-tradePanel-tp::placeholder,
  .input-tradePanel-sl::placeholder {
    font-size: 13px;
    color: ${({ theme }) => theme.text1};
  }
  &:hover {
    border: ${({ theme, FocusEnabled }) =>
      FocusEnabled ? `1px solid ${theme.blue1}` : "1px solid #454a74;"};
  }
`;

export function TPSL() {
  const [showTpSl, setShowTpSl] = useState(false);
  const typedValue = useTypedValue();
  const price = useActiveMarketPrice();
  const limitPrice = useLimitPrice();
  const orderType = useOrderType();
  const openedPrice = orderType === OrderType.MARKET ? price : limitPrice;
  const setTradeTpSl = useSetTpSl();
  const { tp, sl, state: tpSlState, tpSlippage, slSlippage } = useTradeTpSl();
  const market = useActiveMarket();
  const pricePrecision = market ? market.pricePrecision : DEFAULT_PRECISION;
  return (
    <>
      <RowBetween>
        <a data-tip data-for={"tpSlTooltip"}>
          <Checkbox
            checked={showTpSl}
            onChange={() => {
              if (showTpSl && tpSlState === TpSlProcessState.INITIALIZE) {
                setTradeTpSl({
                  tp: "",
                  sl: "",
                  state: TpSlProcessState.INITIALIZE,
                  quoteId: -1,
                  lastTimeUpdated: getCurrentTimeInSecond(),
                  tpSlippage: DEFAULT_SLIPPAGE,
                  slSlippage: DEFAULT_SLIPPAGE,
                });
              }
              setShowTpSl(!showTpSl);
            }}
            label="TP/SL"
            disabled={typedValue === "" || openedPrice === ""}
          />
          {(typedValue === "" || openedPrice === "") && (
            <ToolTip id="tpSlTooltip" aria-haspopup="true">
              {typedValue === "" && (
                <div>Please enter an Amount, then set TP/SL</div>
              )}
              {openedPrice === "" && (
                <div>Please enter a Price, then set TP/SL</div>
              )}
            </ToolTip>
          )}
        </a>
      </RowBetween>
      {showTpSl && (
        <Column style={{ gap: "5px" }}>
          <Row gap="10px">
            <InputWrapperSimple>
              <div>Take Profit:</div>
              <NumericalInput
                value={tp}
                onUserInput={(value: string) => {
                  if (tpSlState === TpSlProcessState.INITIALIZE) {
                    setTradeTpSl({
                      tp: value,
                      sl,
                      state: tpSlState,
                      quoteId: -1,
                      lastTimeUpdated: getCurrentTimeInSecond(),
                      tpSlippage,
                      slSlippage,
                    });
                  }
                }}
                precision={pricePrecision}
                className="input-tradePanel-tp"
              />
            </InputWrapperSimple>
          </Row>
          <Row gap="10px">
            <InputWrapperSimple>
              <div>Stop Loss:</div>
              <NumericalInput
                value={sl}
                onUserInput={(value: string) => {
                  if (tpSlState === TpSlProcessState.INITIALIZE) {
                    setTradeTpSl({
                      tp,
                      sl: value,
                      state: tpSlState,
                      quoteId: -1,
                      lastTimeUpdated: getCurrentTimeInSecond(),
                      tpSlippage,
                      slSlippage,
                    });
                  }
                }}
                precision={pricePrecision}
                className="input-tradePanel-sl"
              />
            </InputWrapperSimple>
          </Row>
        </Column>
      )}
    </>
  );
}
