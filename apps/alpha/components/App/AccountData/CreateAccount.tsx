import { useCallback, useState } from "react";
import styled from "styled-components";
import Image from "next/legacy/image";

import GRADIENT_THENA_LOGO from "/public/static/images/etc/GradientThena.svg";

import { useCollateralToken } from "@symmio/frontend-sdk/constants/tokens";
import { truncateAddress } from "@symmio/frontend-sdk/utils/address";
import { useGetTokenWithFallbackChainId } from "@symmio/frontend-sdk/utils/token";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";

import { useAddAccountToContract } from "@symmio/frontend-sdk/callbacks/useMultiAccount";
import {
  useIsTermsAccepted,
  useUserWhitelist,
} from "@symmio/frontend-sdk/state/user/hooks";

import Column from "components/Column";
import { Row, RowCenter, RowEnd, RowStart } from "components/Row";
import {
  Client,
  Wallet,
  Close as CloseIcon,
  DotFlashing,
} from "components/Icons";
import { WEB_SETTING } from "@symmio/frontend-sdk/config";
import { PrimaryButton } from "components/Button";

const Wrapper = styled.div<{ modal?: boolean }>`
  border: none;
  width: 100%;
  min-height: 379px;
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

const ImageWrapper = styled(RowCenter)`
  margin-top: 30px;
  margin-bottom: 64px;
`;

const AccountWrapper = styled(Row)`
  height: 40px;
  border-radius: 2px;
  margin-bottom: 24px;
  padding: 10px 12px;
  font-weight: 500;
  font-size: 12px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text0};
`;

const AccountNameWrapper = styled(AccountWrapper)`
  background: ${({ theme }) => theme.bg2};
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

const Close = styled.div`
  width: 24px;
  height: 24px;
  padding: 3px 6px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 12px 1px 0px;
  background: ${({ theme }) => theme.bg1};
`;

const DescriptionText = styled.div`
  font-size: 12px;
  text-align: center;
  margin-top: 16px;

  color: ${({ theme }) => theme.text4};
`;

export default function CreateAccount({ onClose }: { onClose?: () => void }) {
  const { account, chainId } = useActiveWagmi();
  const [name, setName] = useState("");
  const [, setTxHash] = useState("");
  const userWhitelisted = useUserWhitelist();
  const isTermsAccepted = useIsTermsAccepted();

  const COLLATERAL_TOKEN = useCollateralToken();

  const collateralCurrency = useGetTokenWithFallbackChainId(
    COLLATERAL_TOKEN,
    chainId
  );
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const { callback: addAccountToContractCallback } =
    useAddAccountToContract(name);

  const onAddAccount = useCallback(async () => {
    if (!addAccountToContractCallback) return;
    try {
      setAwaitingConfirmation(true);
      const txHash = await addAccountToContractCallback();
      setAwaitingConfirmation(false);
      if (txHash) setTxHash(txHash.hash);
      onClose && onClose();
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.debug(e);
      }
    }
    setAwaitingConfirmation(false);
  }, [addAccountToContractCallback, onClose]);

  function getActionButton() {
    if (awaitingConfirmation) {
      return (
        <PrimaryButton height={"40px"}>
          Awaiting Confirmation
          <DotFlashing />
        </PrimaryButton>
      );
    }

    if (WEB_SETTING.showSignModal && !isTermsAccepted) {
      return (
        <PrimaryButton disabled={true} height={"40px"}>
          Accept Terms Please
        </PrimaryButton>
      );
    }

    if (!userWhitelisted) {
      return (
        <PrimaryButton disabled={true} height={"40px"}>
          You are not whitelisted
        </PrimaryButton>
      );
    }

    return (
      <PrimaryButton onClick={() => onAddAccount()} height={"40px"}>
        {name === "" ? "Enter account name" : "Create Account"}
      </PrimaryButton>
    );
  }

  return (
    <Wrapper modal={onClose ? true : false}>
      <Row>
        <Title>Create Account</Title>
        <RowEnd>
          {onClose && (
            <Close>
              {" "}
              <CloseIcon
                size={12}
                onClick={onClose}
                style={{ marginRight: "12px" }}
              />
            </Close>
          )}
        </RowEnd>
      </Row>
      <ContentWrapper>
        <ImageWrapper>
          <Image
            src={GRADIENT_THENA_LOGO}
            alt="thena_logo"
            width={314}
            height={65}
          />
        </ImageWrapper>
        <AccountWrapper>
          {account && truncateAddress(account)}
          <RowEnd>
            <Wallet />
          </RowEnd>
        </AccountWrapper>
        <AccountNameWrapper>
          <Input
            autoFocus
            type="text"
            placeholder={"Account Name (will be saved on chain)"}
            spellCheck="false"
            onBlur={() => null}
            value={name}
            minLength={1}
            maxLength={20}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
          />
          <RowEnd width={"10%"}>
            <Client />
          </RowEnd>
        </AccountNameWrapper>

        {getActionButton()}
        {onClose && (
          <DescriptionText>{`Create Account > Deposit ${collateralCurrency?.symbol} > Enjoy Trading`}</DescriptionText>
        )}
      </ContentWrapper>
    </Wrapper>
  );
}
