import { useState } from "react";
import styled from "styled-components";
import { isAddress } from "viem";

import {
  useAddHedgerCallback,
  useUserWhitelist,
} from "@symmio/frontend-sdk/state/user/hooks";

import Column from "components/Column";
import { Row, RowStart } from "components/Row";
import GradientButton from "components/Button/GradientButton";

const Wrapper = styled.div<{ modal?: boolean }>`
  border: none;
  width: 100%;
  min-height: 220px;
  border-radius: ${({ modal }) => (modal ? "10px" : "4px")};
  background: ${({ theme }) => theme.bg0};
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 100%;
  `};
`;

const Title = styled(RowStart)`
  padding: 12px;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: ${({ theme }) => theme.text0};
`;

const ContentWrapper = styled(Column)`
  padding: 12px;
  position: relative;
`;

const AccountWrapper = styled(Row)`
  height: 40px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 6px;
  margin-bottom: 16px;
  padding: 10px 12px;
  font-weight: 500;
  font-size: 12px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text0};
`;

const InputWrapper = styled(AccountWrapper)`
  background: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text3};
`;

const Input = styled.input<{ [x: string]: any }>`
  height: fit-content;
  width: 90%;
  border: none;
  background: transparent;
  font-size: 12px;
  color: ${({ theme }) => theme.text0};
  padding-left: 2px;

  &::placeholder {
    color: ${({ theme }) => theme.text1};
  }

  &:focus,
  &:hover {
    color: ${({ theme }) => theme.text0};
    outline: none;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      font-size: 0.6rem;
    `}
`;

export default function CreateHedger() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  return (
    <Wrapper modal={false}>
      <Row>
        <Title>Add New Hedger</Title>
      </Row>
      <ContentWrapper>
        <InputWrapper>
          <Input
            autoFocus
            type="text"
            placeholder={"Name"}
            spellCheck="false"
            onBlur={() => null}
            value={name}
            minLength={1}
            maxLength={20}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
          />
        </InputWrapper>
        <InputWrapper>
          <Input
            autoFocus
            type="text"
            placeholder={"Address"}
            spellCheck="false"
            onBlur={() => null}
            value={address}
            minLength={1}
            maxLength={45}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAddress(event.target.value)
            }
          />
        </InputWrapper>
        <ActionButton name={name} address={address} />
      </ContentWrapper>
    </Wrapper>
  );
}

function ActionButton({ name, address }: { name: string; address: string }) {
  const userWhitelisted = useUserWhitelist();
  const addHedger = useAddHedgerCallback();

  if (userWhitelisted === false) {
    return <GradientButton label={"You are not whitelisted"} disabled={true} />;
  }
  if (name === "") {
    return <GradientButton label={"Enter name"} disabled={true} />;
  }
  if (address === "") {
    return <GradientButton label={"Enter address"} disabled={true} />;
  }
  if (!isAddress(address)) {
    return <GradientButton label={"Enter valid address"} disabled={true} />;
  }

  return (
    <GradientButton label={"Save"} onClick={() => addHedger(name, address)} />
  );
}
