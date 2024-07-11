import styled, { useTheme } from "styled-components";

import { toBN } from "@symmio/frontend-sdk/utils/numbers";
import { CloseGuides } from "@symmio/frontend-sdk/types/trade";

import { Amount, Child, ColoredBox, Full, Label } from "./styles";
import Item from "components/App/UserPanel/CloseModal/Item";
import Column from "components/Column";

const Wrapper = styled(Column)`
  gap: 12px;
`;

export default function GuideOne({
  values,
  symbol,
  setSize,
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
}) {
  const theme = useTheme();
  const {
    liquidationAfterClose,
    maxClose,
    maxPartiallyClose,
    minPositionSize,
  } = values;

  const maxOrLiquidText = toBN(liquidationAfterClose).isEqualTo(0)
    ? "Available"
    : "Unavailable";
  const maxOrLiquidColor = toBN(liquidationAfterClose).isEqualTo(0)
    ? theme.green1
    : theme.red1;

  const partialCloseText = !toBN(maxPartiallyClose).isLessThanOrEqualTo(0)
    ? "Available"
    : "Unavailable";
  const partialCloseColor = !toBN(maxPartiallyClose).isLessThanOrEqualTo(0)
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
        <Child
          width={toBN(maxPartiallyClose).div(maxClose).times(100).toFixed(2)}
          color={theme.text0}
        />
        <Child
          width={toBN(minPositionSize).div(maxClose).times(100).toFixed(2)}
          color={theme.bg7}
        />
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
          partialCloseText,
          partialCloseColor
        )}
        amount={
          toBN(maxPartiallyClose).isLessThanOrEqualTo(0) ? (
            <Amount>
              Use <span onClick={() => setSize(maxClose)}>Full close</span>
            </Amount>
          ) : (
            getItemAmount(
              maxPartiallyClose,
              maxClose,
              symbol,
              theme.text0,
              () => setSize(maxPartiallyClose)
            )
          )
        }
      />
      <Item
        label={getItemLabel("Min required remaining amount:", theme.text1)}
        amount={getItemAmount(minPositionSize, maxClose, symbol, theme.text1)}
      />
    </Wrapper>
  );
}
