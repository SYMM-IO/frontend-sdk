import React from "react";
import styled, { useTheme } from "styled-components";

import { toBN } from "@symmio/frontend-sdk/utils/numbers";
import { CloseGuides, OrderType } from "@symmio/frontend-sdk/types/trade";

import { Amount, Child, ColoredBox, Full, Label } from "./styles";
import Item from "components/App/UserPanel/CloseModal/Item";
import Column from "components/Column";

const Wrapper = styled(Column)`
  gap: 12px;
`;

export default function GuideTwo({
  values,
  symbol,
  setSize,
  setActiveTab,
}: {
  values: {
    maxClose: string;
    maxPartiallyClose: string;
    minPositionSize: string;
    liquidationAfterClose: string;
    state: CloseGuides;
  };
  symbol?: string;
  setSize: (size: string) => void;
  setActiveTab: (orderType: OrderType) => void;
}) {
  const theme = useTheme();
  const { maxClose, maxPartiallyClose, minPositionSize } = values;

  const partialCloseText = !toBN(maxPartiallyClose).isEqualTo(0)
    ? "Available"
    : "Unavailable";
  const partialCloseColor = !toBN(maxPartiallyClose).isEqualTo(0)
    ? theme.green1
    : theme.red1;

  function getItemLabel(
    text: string,
    boxColor: string,
    availability?: string,
    availabilityColor?: string
  ): JSX.Element {
    return (
      <React.Fragment>
        <ColoredBox color={boxColor} />
        <Label color={availabilityColor}>
          <div>{text}</div>
          {availability && <div>({availability})</div>}
        </Label>
      </React.Fragment>
    );
  }

  const clickOnAmount = (value: string) => {
    if (toBN(maxPartiallyClose).isEqualTo(0)) return undefined;
    return setSize(value);
  };

  function getItemAmount(
    value: string,
    maxValue: string,
    symbol: string | undefined,
    color: string,
    onClick?: (amount: string) => void
  ) {
    const active = onClick ? true : false;
    const handleClick = () => {
      if (!onClick) return;
      onClick(value);
    };
    return (
      <Amount
        color={color === theme.bg7 ? theme.text1 : color}
        onClick={handleClick}
        active={active}
      >
        {toBN(value).div(maxValue).times(100).toFixed(2)}% (
        {`${value} ${symbol}`})
      </Amount>
    );
  }

  return (
    <Wrapper>
      <Full>
        <Child
          width={toBN(maxPartiallyClose).div(maxClose).times(100).toFixed(2)}
          color={theme.text0}
        />
        <Child
          width={toBN(maxClose)
            .minus(maxPartiallyClose)
            .minus(minPositionSize)
            .div(maxClose)
            .times(100)
            .toFixed(2)}
          color={theme.red1}
        />
        <Child
          width={toBN(minPositionSize).div(maxClose).times(100).toFixed(2)}
          color={theme.bg7}
        />
        <Child width={"1"} color={theme.red1} />
      </Full>

      <Item
        label={getItemLabel(
          "Full Close:",
          theme.red1,
          "Unavailable",
          theme.red1
        )}
        amount={
          <Amount>
            Use
            {toBN(maxPartiallyClose).isEqualTo(0) ? (
              ""
            ) : (
              <React.Fragment>
                <span onClick={() => setSize(maxPartiallyClose)}>
                  Partial close
                </span>
                , or
              </React.Fragment>
            )}{" "}
            <span onClick={() => setActiveTab(OrderType.LIMIT)}>
              Limit Orders
            </span>{" "}
            instead
          </Amount>
        }
        tooltip={
          "Warning: Fully closing this position at this price would cause you to reach your liquidation threshold,  liquidating your entire account."
        }
      />
      <Item
        label={getItemLabel(
          "Partial close:",
          partialCloseColor,
          partialCloseText,
          partialCloseColor
        )}
        amount={getItemAmount(
          maxPartiallyClose,
          maxClose,
          symbol,
          theme.text0,
          clickOnAmount
        )}
      />
      <Item
        label={getItemLabel("Min required remaining amount:", theme.bg7)}
        amount={getItemAmount(minPositionSize, maxClose, symbol, theme.bg7)}
      />
    </Wrapper>
  );
}
