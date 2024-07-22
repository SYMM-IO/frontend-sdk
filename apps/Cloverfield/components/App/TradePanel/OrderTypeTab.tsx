import { useEffect } from "react";
import { OrderType, InputField } from "@symmio/frontend-sdk/types/trade";

import {
  useOrderType,
  useSetLimitPrice,
  useSetOrderType,
  useSetTypedValue,
} from "@symmio/frontend-sdk/state/trade/hooks";

import { Tab } from "components/Tab";

export default function OrderTypeTab() {
  const orderType = useOrderType();
  const setOrderType = useSetOrderType();
  const setLimitPrice = useSetLimitPrice();
  const setTypedValue = useSetTypedValue();

  useEffect(() => {
    setLimitPrice("");
    setTypedValue("", InputField.PRICE);
  }, [orderType]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tab
      tabOptions={[OrderType.LIMIT, OrderType.MARKET]}
      activeOption={orderType}
      onChange={(option: string) => setOrderType(option as OrderType)}
      hideOuterBorder
    />
  );
}
