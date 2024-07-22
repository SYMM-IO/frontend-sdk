import { useSignMessage } from "@symmio/frontend-sdk/callbacks/useMultiAccount";
import { DEFAULT_PRECISION } from "@symmio/frontend-sdk/constants";
import { useMarket } from "@symmio/frontend-sdk/hooks/useMarkets";
import {
  usePendingsQuotes,
  useSetTpSlDataCallback,
} from "@symmio/frontend-sdk/state/quotes/hooks";
import {
  TpSlDataState,
  TpSlDataStateParam,
} from "@symmio/frontend-sdk/state/quotes/types";
import {
  useSetTpSlState,
  useTradeTpSl,
} from "@symmio/frontend-sdk/state/trade/hooks";
import { TpSlProcessState } from "@symmio/frontend-sdk/state/trade/types";
import { Quote } from "@symmio/frontend-sdk/types/quote";
import { getCurrentTimeInSecond } from "@symmio/frontend-sdk/utils/time";
import { useEffect } from "react";
import {
  handleSignManageAndTpSlRequest,
  priceSlippageCalculation,
} from "./manage";
import { useAppName } from "@symmio/frontend-sdk/state/chains";
import { useHedgerInfo } from "@symmio/frontend-sdk/state/hedger/hooks";

export function TpSlChecker() {
  const { quotes: pendings } = usePendingsQuotes();
  const setTradePanelState = useSetTpSlState();

  const { callback: signMessageCallback } = useSignMessage();
  const {
    state: tradePanelTpState,
    quoteId: tradePanelQuoteId,
    tp: tradePanelTp,
    sl: tradePanelSl,
    tpSlippage,
    slSlippage,
  } = useTradeTpSl();

  const tempQuote = pendings.filter((item) => item.id === tradePanelQuoteId);

  const targetQuote = tempQuote.length > 0 ? tempQuote[0] : ({} as Quote);
  const setTpSlFunc = useSetTpSlDataCallback();
  const market = useMarket(targetQuote?.marketId);
  const { tpslUrl } = useHedgerInfo() || {};
  const appName = useAppName();
  useEffect(() => {
    if (
      targetQuote?.id === tradePanelQuoteId &&
      tradePanelTpState === TpSlProcessState.WAIT_FOR_SEND_TP_SL_REQUEST
    ) {
      setTradePanelState({
        state: TpSlProcessState.TP_SL_REQUEST_SENDED,
        lastTimeUpdated: getCurrentTimeInSecond(),
      });
      const positionType = targetQuote.positionType;
      const openPriceTp = priceSlippageCalculation(
        tradePanelTp,
        tpSlippage,
        positionType,
        market?.pricePrecision ?? DEFAULT_PRECISION
      );

      const openPriceSl = priceSlippageCalculation(
        tradePanelSl,
        slSlippage,
        positionType,
        market?.pricePrecision ?? DEFAULT_PRECISION
      );

      handleSignManageAndTpSlRequest(
        tradePanelTp,
        tradePanelSl,
        openPriceTp,
        openPriceSl,
        targetQuote?.quantity,
        targetQuote?.orderType,
        targetQuote?.id,
        appName,
        tpslUrl,
        signMessageCallback,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (resultStatus: boolean) => {
          if (resultStatus) {
            setTpSlFunc(
              {
                tp: "",
                sl: "",
                tpOpenPrice: "",
                slOpenPrice: "",
                tpSlState: TpSlDataState.FORCE_CHECKING,
                tpSlStateParam: TpSlDataStateParam.CHECK_ANY_TP_SL,
                quoteId: targetQuote?.id,
              },
              targetQuote?.id
            );
          }
        }
      );
      setTradePanelState({
        state: TpSlProcessState.INITIALIZE,
        lastTimeUpdated: getCurrentTimeInSecond(),
      });
    }
  }, [
    appName,
    market?.pricePrecision,
    setTpSlFunc,
    setTradePanelState,
    signMessageCallback,
    slSlippage,
    targetQuote?.id,
    targetQuote?.orderType,
    targetQuote.positionType,
    targetQuote?.quantity,
    tpslUrl,
    tpSlippage,
    tradePanelQuoteId,
    tradePanelSl,
    tradePanelTp,
    tradePanelTpState,
  ]);
  return <></>;
}
