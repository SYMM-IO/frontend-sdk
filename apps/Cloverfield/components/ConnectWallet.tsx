import { PrimaryButton } from "./Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function ConnectWallet(): JSX.Element | null {
  const { openConnectModal } = useConnectModal();
  return (
    <PrimaryButton height={"48px"} onClick={openConnectModal}>
      Connect Wallet
    </PrimaryButton>
  );
}
