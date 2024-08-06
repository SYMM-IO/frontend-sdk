import { useCallback, useEffect } from "react";
import {
  useActiveAccount,
  useFEName,
  useSetActiveSubAccount,
  useSetFEName,
} from "../../state/user/hooks";
import useActiveWagmi from "./useActiveWagmi";
import useRpcChangerCallback from "./useRpcChangerCallback";

export default function useSubAccountStorage() {
  const { chainId } = useActiveWagmi();
  const frontEndName = useFEName();
  const activeAccount = useActiveAccount();
  const STORAGE_KEY = "subAccountData";
  const storedData = localStorage.getItem(STORAGE_KEY);
  const setFrontEndName = useSetFEName();
  const rpcChangerCallback = useRpcChangerCallback();
  const updateAccount = useSetActiveSubAccount();

  const setData = useCallback(
    (
      id: number,
      feName: string,
      accountName: string,
      accountAddress: string
    ) => {
      rpcChangerCallback(id);
      setFrontEndName(feName);
      updateAccount(accountAddress, accountName);
    },
    [rpcChangerCallback, setFrontEndName, updateAccount]
  );

  const readFromLocalStorage = (): any | null => {
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  };

  const writeToLocalStorage = useCallback((data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  useEffect(() => {
    if (activeAccount && chainId && frontEndName) {
      writeToLocalStorage({ chainId, frontEndName, activeAccount });
    }
  }, [activeAccount, chainId, frontEndName, writeToLocalStorage]);

  useEffect(() => {
    const data = readFromLocalStorage();

    data &&
      setData(
        data.chainId,
        data.frontEndName,
        data.activeAccount.name,
        data.activeAccount.accountAddress
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
