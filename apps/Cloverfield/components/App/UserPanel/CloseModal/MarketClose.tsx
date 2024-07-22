import React from "react";
import styled from "styled-components";

import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";

import { RowBetween, RowEnd } from "components/Row";
import { InnerCard } from "components/Card";
import SlippageTolerance from "components/App/SlippageTolerance";

// const DefaultOptionButton = styled.div<{ active?: boolean }>`
//   padding: 4px 8px;
//   font-size: 12px;
//   width: 100px;
//   height: 28px;
//   border-radius: 4px;
//   white-space: nowrap;
//   display: inline-flex;
//   justify-content: flex-end;
//   background: ${({ theme }) => theme.bg4};
//   color: ${({ theme }) => theme.text1};
//   border: 1px solid ${({ theme }) => theme.bg6};

//   &:hover {
//     cursor: pointer;
//   }

//   ${({ theme }) => theme.mediaWidth.upToSmall`
//       // margin-right: 5px;
//       white-space: normal;
//   `}
// `
const PriceWrap = styled(InnerCard)`
  padding-top: 8px;
  & > * {
    &:last-child {
      height: 28px;
      margin-top: 12px;
    }
  }
`;

const Title = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 12px;
  font-weight: 400;
`;

export const InputAmount = styled.input.attrs({ type: "number" })<{
  active?: boolean;
}>`
  border: 0;
  outline: none;
  width: 100%;
  margin-right: 2px;
  margin-left: 2px;
  font-size: 12px;
  background: transparent;
  color: ${({ theme }) => theme.text0};

  appearance: textfield;

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ${({ active, theme }) =>
    active &&
    `
    color: ${theme.text0};
  `}
`;

export default function MarketClose({
  price,
  symbol,
}: {
  price: string | undefined;
  symbol?: string;
}) {
  // const slippage = useSlippageTolerance()
  // const [amount, setAmount] = useState<string | number>(slippage)
  // const setSlippage = useSetSlippageToleranceCallback()

  // const handleMinAmount = useCallback(() => {
  //   if (amount && Number(amount) < 0) {
  //     setAmount(0)
  //   } else if (amount && Number(amount) > 0) {
  //     setSlippage(Number(amount))
  //   }
  // }, [amount, setAmount, setSlippage])

  // const handleCustomChange = useCallback(
  //   (e: any) => {
  //     const value = e.currentTarget.value
  //     if (value !== '' && Number(value) >= 0) {
  //       setAmount(value)
  //       setSlippage(Number(value))
  //     } else {
  //       setAmount('auto')
  //       setSlippage('auto')
  //     }
  //   },
  //   [setAmount, setSlippage]
  // )

  return (
    <>
      <PriceWrap>
        <RowBetween>
          <Title>Market Price</Title>
          <div>
            {formatAmount(price, 6)} {symbol}
          </div>
        </RowBetween>
        <RowBetween>
          <Title>Slippage</Title>
          <RowEnd>
            {/* <DefaultOptionButton active={true}>
              <InputAmount
                value={amount ? (Number(amount) >= 0 ? amount : '') : ''}
                active={true}
                onBlur={() => {
                  handleMinAmount()
                }}
                onChange={(e) => handleCustomChange(e)}
                placeholder={amount ? amount.toString() : '0.0'}
              />
              %
            </DefaultOptionButton> */}
            <SlippageTolerance />
          </RowEnd>
        </RowBetween>
      </PriceWrap>
    </>
  );
}
