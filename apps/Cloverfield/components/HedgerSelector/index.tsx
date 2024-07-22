import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import useOnOutsideClick from "lib/hooks/useOnOutsideClick";

import { NavButton } from "components/Button";
import HedgersModal from "./HedgersModal";
import {
  useGetAddedHedgers,
  useSetHedgerDataCallback,
} from "@symmio/frontend-sdk/state/user/hooks";
import { AddedHedgersData } from "@symmio/frontend-sdk/state/user/types";

const Container = styled.div`
  display: unset;
  align-items: center;
  height: 100%;
`;

export default function HedgerSelector() {
  const ref = useRef(null);
  useAddedHedgersData();
  useOnOutsideClick(ref, () => {
    if (!isMobile) setModalOpen(false);
  });
  const [modalOpen, setModalOpen] = useState(false);

  const closeOnClick = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <div ref={ref}>
      <NavButton onClick={closeOnClick} width={"unset"}>
        Hedgers
      </NavButton>
      <>
        {isMobile ? (
          <>
            <HedgersModal
              isModal
              isOpen={modalOpen}
              onDismiss={() => setModalOpen(false)}
            />
          </>
        ) : (
          <Container>
            {modalOpen && (
              <div>
                <HedgersModal
                  isOpen
                  onDismiss={() => setModalOpen(!modalOpen)}
                />
              </div>
            )}
          </Container>
        )}
      </>
    </div>
  );
}

function useAddedHedgersData() {
  const addedHedgers = useGetAddedHedgers();
  const setAddedHedgersData = useSetHedgerDataCallback();

  const STORAGE_KEY = "addedHedgersData";
  const storedData = localStorage.getItem(STORAGE_KEY);

  const readFromLocalStorage = (): AddedHedgersData | null => {
    if (storedData) {
      return JSON.parse(storedData) as AddedHedgersData;
    }
    return null;
  };

  const writeToLocalStorage = useCallback((data: AddedHedgersData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  useEffect(() => {
    if (Object.keys(addedHedgers).length > 0) {
      writeToLocalStorage(addedHedgers);
    }
  }, [addedHedgers, writeToLocalStorage]);

  useEffect(() => {
    const data = readFromLocalStorage();
    setAddedHedgersData(data ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
