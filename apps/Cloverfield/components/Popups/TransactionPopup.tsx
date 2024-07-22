import React from "react";
import styled, { useTheme } from "styled-components";
import { ArrowUpRight } from "react-feather";

import DEPOSIT_USDT_ICON from "/public/static/images/etc/DepositUSDTPopUp.svg";
import WITHDRAW_USDT_ICON from "/public/static/images/etc/WithdrawUSDTPopUp.svg";
import DEPOSIT_USDC_ICON from "/public/static/images/etc/DepositUSDCPopUp.svg";
import WITHDRAW_USDC_ICON from "/public/static/images/etc/WithdrawUSDCPopUp.svg";

import { TransferTab } from "@symmio/frontend-sdk/types/transfer";
import { ExplorerDataType } from "@symmio/frontend-sdk/utils/explorers";
import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";
import { FALLBACK_CHAIN_ID } from "constants/chains/chains";
import { useTransaction } from "@symmio/frontend-sdk/state/transactions/hooks";
import { TransactionDetails } from "@symmio/frontend-sdk/state/transactions/types";

import TransactionSummary from "components/Summaries/TransactionSummary ";
import { ExplorerLink } from "components/Link";
import { Row, RowEnd, RowStart } from "components/Row";
import { CheckMark, Close } from "components/Icons";
import ImageWithFallback from "components/ImageWithFallback";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

const Wrapper = styled(Row)<{ success?: boolean; color: string }>`
  height: 40px;
  padding: 11px 16px;

  background: ${({ theme, success }) =>
    success ? theme.bg4 : theme.bgWarning};
  color: ${({ color }) => color};
  border: 1px solid ${({ color }) => color};
  border-radius: 4px;
`;

const Text = styled(RowStart)`
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  text-decoration-line: underline;
  color: ${({ theme }) => theme.text0};
`;

export default function TransactionPopup({
  hash,
  success,
  summary,
  removeThisPopup,
}: {
  hash: string;
  success?: boolean;
  summary?: string;
  removeThisPopup: () => void;
}) {
  const { chainId } = useActiveWagmi();
  const theme = useTheme();
  const tx = useTransaction(hash);
  const status = success ? "submitted" : "failed";
  const transferTypeIcon = useTransferTypeIcon(tx);

  return (
    <Wrapper
      color={success ? theme.primaryBlue : theme.warning}
      success={success}
    >
      <Text>
        <ExplorerLink
          chainId={chainId ?? FALLBACK_CHAIN_ID}
          type={ExplorerDataType.TRANSACTION}
          value={hash}
          style={{
            height: "100%",
            color: success ? theme.primaryBlue : theme.warning,
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          <TransactionSummary
            info={tx?.info}
            summary={summary}
            status={status}
          />

          {/* {summary} */}
        </ExplorerLink>
        <ArrowUpRight
          size={"10px"}
          style={{
            marginLeft: "6px",
            color: success ? theme.primaryBlue : theme.warning,
          }}
        />
      </Text>
      <RowEnd
        width={"25%"}
        onClick={removeThisPopup}
        style={{ cursor: "pointer" }}
      >
        {transferTypeIcon ? (
          <ImageWithFallback
            src={transferTypeIcon}
            width={46}
            height={24}
            alt={`transfer-type`}
          />
        ) : success ? (
          <CheckMark color={theme.primaryBlue} />
        ) : (
          <Close color={theme.warning} />
        )}
      </RowEnd>
    </Wrapper>
  );
}

function useTransferTypeIcon(tx: TransactionDetails | undefined) {
  const { chainId } = useActiveWagmi();

  if (tx?.info && "transferType" in tx.info) {
    const { transferType } = tx.info;
    let icon;

    switch (chainId) {
      case SupportedChainId.BSC:
        icon =
          transferType === TransferTab.DEALLOCATE ||
          transferType === TransferTab.WITHDRAW
            ? WITHDRAW_USDT_ICON
            : DEPOSIT_USDT_ICON;
        break;
      default:
        icon =
          transferType === TransferTab.DEALLOCATE ||
          transferType === TransferTab.WITHDRAW
            ? WITHDRAW_USDC_ICON
            : DEPOSIT_USDC_ICON;
    }

    return icon;
  }

  return undefined;
}
