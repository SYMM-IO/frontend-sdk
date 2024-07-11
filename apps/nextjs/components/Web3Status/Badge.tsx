import { useMemo, useState } from "react";
import Image from "next/legacy/image";
import styled from "styled-components";

import Sniper from "/public/static/images/sniper.svg";
import Medic from "/public/static/images/doctor.svg";
import Archer from "/public/static/images/hunter.svg";

import useAccountData from "@symmio/frontend-sdk/hooks/useAccountData";
import {
  useMax20ClosedQuotes,
  useQuotesPnl,
} from "@symmio/frontend-sdk/hooks/useBadgesData";
import { ToolTipBottom } from "components/ToolTip";
import Column from "components/Column";

const CustomTooltipBottom = styled(ToolTipBottom)`
  font-size: 12px !important;
`;

const TooltipContentWrapper = styled(Column)`
  gap: 4px;
  max-width: 280px;
  white-space: normal;
`;

const useIsArcher = () => {
  const marketIdList: number[] = [];
  const closed = useMax20ClosedQuotes();
  const closedPnlList = useQuotesPnl(closed);

  for (let i = 0; i < closedPnlList.length; i++) {
    const pnl = closedPnlList[i];

    if (marketIdList.length >= 5) break;

    if (Number(pnl) > 0) {
      const { marketId } = closed[i];
      if (!marketIdList.includes(marketId)) marketIdList.push(marketId);
    }
  }

  return marketIdList.length >= 5;
};

const useIsSniper = () => {
  const max20Quotes = useMax20ClosedQuotes();
  const pnlList = useQuotesPnl(max20Quotes);

  const showSniper = useMemo(() => {
    let winPositionNumber = 0;

    pnlList.forEach((pnl) => {
      if (Number(pnl) > 0) {
        winPositionNumber += 1;
      }
    });
    const winRate = winPositionNumber / pnlList.length;
    return max20Quotes.length >= 5 && winRate > 0.8;
  }, [max20Quotes.length, pnlList]);

  return showSniper;
};

export default function Badge() {
  const {
    accountHealthData: { health: accountHealth },
  } = useAccountData();

  const isArcher = useIsArcher();
  const isSniper = useIsSniper();

  const [tooltipTitle, setTooltipTitle] = useState("");
  const [tooltipText, setTooltipText] = useState("");

  const navStatusIconSrc = useMemo(() => {
    const healthNumber = Number(accountHealth);
    if (
      healthNumber &&
      healthNumber !== Infinity &&
      !isNaN(healthNumber) &&
      healthNumber > 200
    ) {
      setTooltipTitle("Medic");
      setTooltipText(
        "For users with a robust account health above 200%. Your portfolio is as strong as your strategy."
      );
      return Medic;
    }
    if (isArcher) {
      setTooltipTitle("Archer");
      setTooltipText(
        "Earn this badge by making profit in at least 5 different markets in your last 20 trades."
      );
      return Archer;
    }
    if (isSniper) {
      setTooltipTitle("Sniper");
      setTooltipText(
        "Be a sharpshooter by closing 80% of your last 20 trades with profit."
      );
      return Sniper;
    }
    return "";
  }, [accountHealth, isArcher, isSniper]);

  return (
    <span>
      {navStatusIconSrc && (
        <a data-tip data-for={"badge"}>
          <Image src={navStatusIconSrc} alt={"badge"} />
          <CustomTooltipBottom id={"badge"} aria-haspopup="true">
            <TooltipContentWrapper>
              <div>{tooltipTitle}</div>
              <div>{tooltipText}</div>
            </TooltipContentWrapper>
          </CustomTooltipBottom>
        </a>
      )}
    </span>
  );
}
