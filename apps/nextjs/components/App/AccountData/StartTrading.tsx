import { useEffect, useState } from "react";
import styled from "styled-components";
import Image from "next/legacy/image";

import { formatAmount } from "@symmio/frontend-sdk/utils/numbers";
import { SupportedChainId } from "@symmio/frontend-sdk/constants/chains";

import { ApplicationModal } from "@symmio/frontend-sdk/state/application/reducer";
import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "@symmio/frontend-sdk/state/user/hooks";
import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import {
  useDepositModalToggle,
  useModalOpen,
} from "@symmio/frontend-sdk/state/application/hooks";

import GradientButton from "components/Button/GradientButton";
import { Row, RowStart, RowBetween, RowCenter, RowEnd } from "components/Row";
import DepositModal from "components/ReviewModal/DepositModal";

const Wrapper = styled.div`
  border: none;
  width: 100%;
  min-height: 379px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg0};
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 100%;
  `};
`;

const Title = styled(RowStart)`
  padding: 20px 12px;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: ${({ theme }) => theme.text0};
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 12px;
  flex-flow: column nowrap;
  /* height: 100%; */
  position: relative;
`;

const ImageWrapper = styled(RowCenter)`
  margin-top: 25px;
  margin-bottom: 36px;
`;

const Label = styled.div`
  justify-self: start;
  color: ${({ theme }) => theme.text3};
`;

const Value = styled.div`
  justify-self: end;
`;

const DepositText = styled.div`
  font-size: 14px;
  text-align: center;
  margin-bottom: 37px;

  background: ${({ theme }) => theme.hoverGrad};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export default function StartTrading({ symbol }: { symbol?: string }) {
  const account = useActiveAccountAddress();
  const { collateralBalance } = useAccountPartyAStat(account);
  const showDepositModal = useModalOpen(ApplicationModal.DEPOSIT);
  const toggleDepositModal = useDepositModalToggle();
  const imgSrc = useAssetSrc();

  return (
    <Wrapper>
      <Row>
        <Title>Deposit {symbol}</Title>
        <RowEnd style={{ marginRight: "12px" }}>
          <Image src={imgSrc} alt="Asset" width={103} height={36} />
        </RowEnd>
      </Row>

      <ContentWrapper>
        <ImageWrapper>
          <Image
            src={"/static/images/etc/Asset.svg"}
            alt="Asset"
            width={174}
            height={135}
          />
        </ImageWrapper>
        <DepositText>Deposit {symbol} and start trading</DepositText>
        <RowBetween style={{ marginBottom: "24px" }}>
          <Label>Account Balance:</Label>
          <Value>
            {formatAmount(collateralBalance)} {symbol}
          </Value>
        </RowBetween>
        <GradientButton
          label={`Deposit ${symbol}`}
          onClick={() => toggleDepositModal()}
        />
      </ContentWrapper>
      {showDepositModal && <DepositModal />}
    </Wrapper>
  );
}

function useAssetSrc(): string {
  const { chainId } = useActiveWagmi();
  const [imgSrc, setImgSrc] = useState("/static/images/etc/USDCAsset.svg");

  useEffect(() => {
    switch (chainId) {
      case SupportedChainId.FANTOM:
      case SupportedChainId.BASE:
        setImgSrc("/static/images/etc/USDCAsset.svg");
        break;
      case SupportedChainId.BSC:
      case SupportedChainId.BSC_TESTNET:
        setImgSrc("/static/images/etc/USDTAsset.svg");
        break;
      default:
        setImgSrc("/static/images/etc/USDCAsset.svg");
    }
  }, [chainId]);

  return imgSrc;
}
