import { EmptyRow } from "./styles";
import { EmptyPositionDetails } from "components/Icons";

export default function EmptyDetails() {
  return (
    <EmptyRow>
      <EmptyPositionDetails style={{ marginBottom: "52px" }} />
      {`<<< Select a position from the list to view all details`}
    </EmptyRow>
  );
}
