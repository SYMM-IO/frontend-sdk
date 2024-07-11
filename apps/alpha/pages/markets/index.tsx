import styled from "styled-components";

import { Container } from "pages/trade/[id]";
import Markets from "components/App/Markets";

const Wrapper = styled(Container)`
  padding: 0px 12px;
`;

export default function MarketsPage() {
  return (
    <Wrapper>
      <Markets />
    </Wrapper>
  );
}
