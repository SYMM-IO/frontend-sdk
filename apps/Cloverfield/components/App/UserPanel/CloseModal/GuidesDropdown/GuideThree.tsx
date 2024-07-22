import styled, { useTheme } from "styled-components";

import { toBN } from "@symmio/frontend-sdk/utils/numbers";
import { CloseGuides, OrderType } from "@symmio/frontend-sdk/types/trade";

import { Amount, Child, ColoredBox, Full, Label } from "./styles";
import Item from "components/App/UserPanel/CloseModal/Item";
import Column from "components/Column";

const Wrapper = styled(Column)`
  gap: 12px;
`;

export default function GuideThree({
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
  const { liquidationAfterClose, maxClose, minPositionSize } = values;

  const maxOrLiquidText = toBN(liquidationAfterClose).isEqualTo(0)
    ? "Available"
    : "Unavailable";
  const maxOrLiquidColor = toBN(liquidationAfterClose).isEqualTo(0)
    ? theme.green1
    : theme.red1;

  function getItemLabel(
    text: string,
    boxColor: string,
    availability?: string,
    availabilityColor?: string
  ): JSX.Element {
    return (
      <>
        <ColoredBox color={boxColor} />
        <Label color={availabilityColor}>
          <div>{text}</div>
          {availability && <div>({availability})</div>}
        </Label>
      </>
    );
  }

  function getItemAmount(
    value: string,
    maxValue: string,
    symbol: string | undefined,
    color: string,
    onClick?: (amount: string) => void
  ) {
    const active = onClick ? true : false;

    const handleClick = () => {
      if (!onClick || !value) return;
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
        <Child width={"99"} color={theme.bg7} />
        <Child width={"1"} color={maxOrLiquidColor} />
      </Full>

      <Item
        label={getItemLabel(
          "Full Close:",
          maxOrLiquidColor,
          maxOrLiquidText,
          maxOrLiquidColor
        )}
        amount={getItemAmount(
          maxClose,
          maxClose,
          symbol,
          maxOrLiquidColor,
          () => setSize(maxClose)
        )}
      />

      <Item
        label={getItemLabel(
          "Partial close:",
          theme.text0,
          "Unavailable",
          theme.red1
        )}
        amount={
          <Amount>
            Use <span onClick={() => setSize(maxClose)}>Full close</span>, or{" "}
            <span onClick={() => setActiveTab(OrderType.LIMIT)}>
              Limit Orders
            </span>{" "}
            instead
          </Amount>
        }
      />

      <Item
        label={getItemLabel("Min required remaining amount:", theme.bg7)}
        amount={getItemAmount(minPositionSize, maxClose, symbol, theme.bg7)}
      />
    </Wrapper>
  );
}
