import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { Z_INDEX } from "theme";

import { ChainInfo } from "@symmio/frontend-sdk/constants/chainInfo";
import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import useRpcChangerCallback from "@symmio/frontend-sdk/lib/hooks/useRpcChangerCallback";

import { Row } from "components/Row";
import { Card } from "components/Card";
import { Modal as ModalBody } from "components/Modal";
import ImageWithFallback from "components/ImageWithFallback";
import { getChainLogo } from "utils/chainLogo";
import {
  useAllMultiAccountAddresses,
  useV3Ids,
} from "@symmio/frontend-sdk/state/chains/hooks";
import {
  useFEName,
  useSetActiveSubAccount,
  useSetFEName,
} from "@symmio/frontend-sdk/state/user/hooks";

const ModalWrapper = styled(Card)`
  padding: 0.6rem;
  border: none;
  border-radius: 4px;

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
      min-height: 100%;
      max-height: 400px;
    }
  }
`;

const InlineModal = styled(Card)<{ isOpen: boolean; height?: string }>`
  padding: 0px;
  border-radius: 4px;
  width: clamp(100px, 275px, 99%);
  max-height: ${({ height }) => height ?? "554px"};
  position: absolute;
  z-index: ${Z_INDEX.modal};
  transform: translate(-193px, 29px);
  background: ${({ theme }) => theme.bg1};
  border: 2px solid ${({ theme }) => theme.bg6};
  display: ${(props) => (props.isOpen ? "flex" : "none")};

  & > * {
    &:last-child {
      overflow-y: scroll;
      overflow-x: hidden;
      width: 100%;
      min-height: 100%;
    }
  }
`;

const Modal = styled(ModalBody)`
  border: none;
`;

const Network = styled(Row)<{ active?: boolean }>`
  gap: 12px;
  height: 44px;
  padding: 8px;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  cursor: ${({ active }) => (active ? "default" : "pointer")};
  border: 2px solid ${({ theme }) => theme.border3};
  background: ${({ theme, active }) => (active ? theme.bg4 : theme.bg)};

  ${({ active }) =>
    active &&
    `
    opacity: 0.5;
  `}
`;

const Logo = styled.div`
  min-height: 28px;
  min-width: 28px;
`;

interface IFrontEndsInfo {
  chainId: number;
  name: string;
}

export function NetworksModal({
  isModal,
  isOpen,
  onDismiss,
}: {
  isModal?: boolean;
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const { chainId } = useActiveWagmi();
  const rpcChangerCallback = useRpcChangerCallback();
  const callBackFlag = useRef(false);
  const v3_ids = useV3Ids();
  const MULTI_ACCOUNT_ADDRESS = useAllMultiAccountAddresses();
  const frontEndName = useFEName();
  const setFrontEndName = useSetFEName();
  const updateAccount = useSetActiveSubAccount();

  const handleClick = (chainId: SupportedChainId, name: string) => {
    rpcChangerCallback(chainId);
    setFrontEndName(name);
    updateAccount();
    callBackFlag.current = true;
  };

  useEffect(() => {
    if (callBackFlag.current) {
      onDismiss();
      callBackFlag.current = false;
    }
  }, [chainId, onDismiss]);

  const frontEnds = useMemo(() => {
    const values: IFrontEndsInfo[] = [];
    v3_ids.forEach((chainId: number) => {
      const multiAccounts = Object.keys(MULTI_ACCOUNT_ADDRESS[chainId]);
      multiAccounts.forEach((m) => {
        values.push({ chainId, name: m });
      });
    });
    return values;
  }, [MULTI_ACCOUNT_ADDRESS, v3_ids]);

  // HERE IS NETWORK LIST
  function getInnerContent() {
    return (
      <div>
        {" "}
        {frontEnds.map((chain: IFrontEndsInfo, index) => {
          const Chain = ChainInfo[chain.chainId];
          const active =
            chain.chainId === chainId && frontEndName === chain.name;
          return (
            <Network
              key={index}
              active={active}
              onClick={() => handleClick(chain.chainId, chain.name)}
            >
              <Logo>
                <ImageWithFallback
                  src={getChainLogo(chain.chainId)}
                  alt={Chain.label}
                  width={28}
                  height={28}
                />
              </Logo>
              {Chain.chainName} - {chain.name}
            </Network>
          );
        })}
      </div>
    );
  }

  return isModal ? (
    <Modal
      isOpen={isOpen}
      onBackgroundClick={onDismiss}
      onEscapeKeydown={onDismiss}
    >
      <ModalWrapper>{getInnerContent()}</ModalWrapper>
    </Modal>
  ) : (
    <InlineModal isOpen={isOpen}>{getInnerContent()}</InlineModal>
  );
}
