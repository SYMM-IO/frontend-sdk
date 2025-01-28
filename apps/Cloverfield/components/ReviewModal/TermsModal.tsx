import React, { useCallback, useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import Image from "next/image";

import GRADIENT_CLOVERFIELD_LOGO from "/public/static/images/etc/GradientCloverfield.svg";

import { Modal } from "components/Modal";
import { DotFlashing, Wallet } from "components/Icons";

import { Row, RowCenter, RowEnd, RowStart } from "components/Row";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { truncateAddress } from "@symmio/frontend-sdk/utils/address";
import Checkbox from "components/CheckBox";
import { useSignMessage } from "@symmio/frontend-sdk/callbacks/useMultiAccount";
import { useWriteSign } from "@symmio/frontend-sdk/callbacks/useWriteSign";
import { useGetMessage } from "@symmio/frontend-sdk/hooks/useCheckSign";
import GradientButton from "components/Button/GradientButton";
import { TransactionStatus } from "@symmio/frontend-sdk/utils/web3";

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  padding: 16px 12px;
`;

const AccountWrapper = styled(Row)`
  height: 40px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 6px;
  margin-bottom: 16px;
  padding: 10px 12px;
  font-weight: 500;
  font-size: 12px;

  color: ${({ theme }) => theme.primaryBlue};
`;

const ImageWrapper = styled(RowCenter)`
  margin-top: 15px;
  margin-bottom: 34px;
`;

const AcceptRiskWrapper = styled.div`
  padding: 4px 0px 16px 12px;
`;

export default function TermsModal({
  isOpen = true,
  onDismiss,
}: {
  isOpen?: boolean;
  onDismiss: () => void;
}) {
  const { account } = useActiveWagmi();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onBackgroundClick={onDismiss}
      onEscapeKeydown={onDismiss}
    >
      <Wrapper>
        <RowStart>Terms of Service</RowStart>
        <ImageWrapper>
          <Image
            src={GRADIENT_CLOVERFIELD_LOGO}
            alt="cloverfield_logo"
            width={110}
            height={121}
          />
        </ImageWrapper>
        <AccountWrapper>
          {account && truncateAddress(account)}
          <RowEnd>
            <Wallet />
          </RowEnd>
        </AccountWrapper>
        <AcceptRiskWrapper>
          <Checkbox
            name={"user-accept-risk"}
            id={"user-accept-risk"}
            label={"I Accept Terms of Service"}
            checked={isTermsAccepted}
            onChange={() => setIsTermsAccepted((prevValue) => !prevValue)}
          />
        </AcceptRiskWrapper>
        <ActionButton isTermsAccepted={isTermsAccepted} />
      </Wrapper>
    </Modal>
  );
}

function ActionButton({ isTermsAccepted }: { isTermsAccepted: boolean }) {
  const [signature, setSignature] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const message = useGetMessage();
  const { callback: signMessageCallback } = useSignMessage();
  const { callback: writeSignCallback } = useWriteSign();

  const onSignMessage = useCallback(async () => {
    if (!signMessageCallback) return;
    try {
      const sign = await signMessageCallback(message);
      return sign;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.debug(e);
      }
      throw new Error(e.message);
    }
  }, [message, signMessageCallback]);

  const onWriteSignCb = useCallback(
    async (sign: string) => {
      if (!writeSignCallback || !sign) return;

      const { status, message } = await writeSignCallback(sign);
      if (status !== TransactionStatus.SUCCESS) {
        toast.error(message);
      }

      setAwaitingConfirmation(false);
    },
    [writeSignCallback]
  );

  const onClickButton = useCallback(async () => {
    if (isTermsAccepted) {
      setAwaitingConfirmation(true);

      if (!signature) {
        onSignMessage()
          .then((sign) => {
            if (sign) {
              setSignature(sign);
              onWriteSignCb(sign);
            }
          })
          .catch(() => {
            setAwaitingConfirmation(false);
          });
      } else {
        onWriteSignCb(signature);
      }
    }
  }, [isTermsAccepted, onSignMessage, onWriteSignCb, signature]);

  return (
    <GradientButton
      label={"Sign & Accept Terms of Service"}
      onClick={onClickButton}
      disabled={awaitingConfirmation}
    >
      {awaitingConfirmation && <DotFlashing />}
    </GradientButton>
  );
}
