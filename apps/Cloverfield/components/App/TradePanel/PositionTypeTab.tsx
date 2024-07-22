import { useTheme } from "styled-components";
import { PositionType } from "@symmio/frontend-sdk/types/trade";

import { LongArrow, ShortArrow } from "components/Icons";
import { RowCenter } from "components/Row";
import { TabModalJSX } from "components/Tab";
import {
  usePositionType,
  useSetPositionType,
} from "@symmio/frontend-sdk/state/trade/hooks";

export default function PositionTypeTab() {
  const theme = useTheme();
  const positionType = usePositionType();
  const setPositionType = useSetPositionType();
  const onChange = (option: string) => setPositionType(option as PositionType);
  const options = [
    {
      label: PositionType.LONG,
      content: (
        <RowCenter>
          <div>Long</div>
          <LongArrow
            width={16}
            height={12}
            color={
              positionType === PositionType.LONG ? theme.text0 : theme.text4
            }
            style={{ marginLeft: "8px" }}
          />
        </RowCenter>
      ),
    },
    {
      label: PositionType.SHORT,
      content: (
        <RowCenter>
          <div>Short</div>
          <ShortArrow
            width={16}
            height={12}
            color={
              positionType === PositionType.SHORT ? theme.text0 : theme.text4
            }
            style={{ marginLeft: "8px" }}
          />
        </RowCenter>
      ),
    },
  ];

  return (
    <TabModalJSX
      tabOptions={options}
      activeOption={positionType}
      onChange={onChange}
    />
  );
}
