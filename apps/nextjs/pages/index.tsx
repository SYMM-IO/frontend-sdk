import React, { useEffect } from "react";
import { updateAccount } from "@symmio/frontend-sdk/state/user/actions";
// import { useActiveAccount } from "@symmio/frontend-sdk/src/state/user/hooks";
import { useAppDispatch } from "@symmio/frontend-sdk/state";
import { useUserAccounts } from "@symmio/frontend-sdk/hooks/useAccounts";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import styled from "styled-components";
import { Box } from "rebass/styled-components";

export const Row = styled(Box)<{
  width?: string;
  align?: string;
  justify?: string;
  padding?: string;
  border?: string;
  gap?: string;
  borderRadius?: string;
}>`
  width: ${({ width }) => width ?? "100%"};
  display: flex;
  padding: 0;
  gap: ${({ gap }) => gap && `${gap}`};
  align-items: ${({ align }) => align ?? "center"};
  justify-content: ${({ justify }) => justify ?? "flex-start"};
  padding: ${({ padding }) => padding};
  padding: ${({ padding }) => padding};
  border-radius: ${({ borderRadius }) => borderRadius};
`;

export const RowCenter = styled(Row)`
  justify-content: center;
`;

export const BaseButton = styled(RowCenter)<{
  active?: boolean;
  disabled?: boolean;
}>`
  padding: 1rem;
  height: 100%;
  font-weight: 600;
  border-radius: 4px;
  outline: none;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }
  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);
  > * {
    user-select: none;
  }
  > a {
    text-decoration: none;
  }
`;

export default function MyFunction() {
  // const activeAccount = useActiveAccount();
  const { openConnectModal } = useConnectModal();
  const dispatch = useAppDispatch();
  const { accounts } = useUserAccounts();
  useEffect(() => {
    if (accounts !== null) {
      const lastSubAccount = accounts[accounts.length - 1];
      dispatch(updateAccount(lastSubAccount));
    }
  }, [accounts, dispatch]);
  return (
    <div>
      <BaseButton onClick={openConnectModal}>click me</BaseButton>
    </div>
  );
}
