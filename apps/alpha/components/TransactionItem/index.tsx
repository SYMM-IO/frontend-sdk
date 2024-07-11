import styled from "styled-components";
import { useToken } from "@symmio/frontend-sdk/lib/hooks/useTokens";
import { CloseQuoteMessages } from "@symmio/frontend-sdk/types/trade";

import {
  TradeTransactionInfo,
  ApproveTransactionInfo,
  CancelQuoteTransactionInfo,
  AddAccountTransactionInfo,
  TransferCollateralTransactionInfo,
  MintTransactionInfo,
  SignMessageTransactionInfo,
} from "@symmio/frontend-sdk/state/transactions/types";
import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { FALLBACK_CHAIN_ID } from "constants/chains/chains";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import { TradeState } from "@symmio/frontend-sdk/types/trade";
import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

export const Summary = styled.div`
  font-size: 12px;
  font-weight: 500px;
  color: ${({ theme }) => theme.text0};
`;

export function TradeSummary({
  info: { state, name, id },
  status,
}: {
  info: TradeTransactionInfo;
  status?: string;
}): JSX.Element {
  return (
    <Summary>
      {state === TradeState.OPEN
        ? `${name} "Open Order" ${status}`
        : `${name}-Q${id} "Close Position" ${status}`}
    </Summary>
  );
}

export function ApproveSummary({
  info: { tokenAddress },
  status,
}: {
  info: ApproveTransactionInfo;
  status?: string;
}): JSX.Element {
  const token = useToken(tokenAddress);
  return (
    <Summary>
      {`"Approve ${token?.symbol}"`} {status}
    </Summary>
  );
}

export function CancelQuoteSummary({
  info: { name, id, closeQuote },
  status,
}: {
  info: CancelQuoteTransactionInfo;
  status?: string;
}): JSX.Element {
  return (
    <Summary>
      {name}-Q{id} “{CloseQuoteMessages[closeQuote]}” {status}
    </Summary>
  );
}

export function AddAccountSummary({
  info: { name },
  status,
}: {
  info: AddAccountTransactionInfo;
  status?: string;
}): JSX.Element {
  return (
    <Summary>
      {`"Add new account [${name}]"`} {status}
    </Summary>
  );
}

export function TransferBalanceSummary({
  info: { amount, transferType },
  status,
}: {
  info: TransferCollateralTransactionInfo;
  status?: string;
}): JSX.Element {
  const { chainId } = useActiveWagmi();
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );

  const statusText =
    transferType === TransferTab.WITHDRAW && status === "submitted"
      ? "successful"
      : status;
  return (
    <Summary>
      {amount} {collateralCurrency?.symbol} {transferType} {statusText}
    </Summary>
  );
}

export function MintSummary({
  info,
  status,
}: {
  info: MintTransactionInfo;
  status?: string;
}): JSX.Element {
  const COLLATERAL_TOKEN = useCollateralToken();
  const collateralSymbol = COLLATERAL_TOKEN[FALLBACK_CHAIN_ID].symbol ?? "";

  return (
    <Summary>
      &#34;Mint&#34; {info.amount} {collateralSymbol} {status}
    </Summary>
  );
}

export function SignSummary({
  info,
}: {
  info: SignMessageTransactionInfo;
}): JSX.Element {
  return <Summary>{info.text}</Summary>;
}
