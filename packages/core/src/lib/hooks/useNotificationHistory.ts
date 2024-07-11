import { useCallback, useEffect } from "react";

import { useAppDispatch } from "../../state/declaration";
import { updateTimestamp } from "../../state/notifications/actions";

export default function useNotificationHistory() {
  // save timestamp when enter the page
  // for next time enter we check timestamp if we have, use the timestamp and save new timestamp
  // if we don't have save new timestamp
  // when user wants leave the page we save new timestamp

  const dispatch = useAppDispatch();
  const getLocalStorageTimestamp = () =>
    localStorage.getItem("lastUpdateTimestamp");
  const setCurrentTimestamp = useCallback(
    () => localStorage.setItem("lastUpdateTimestamp", currentTimestamp()),
    []
  );
  const currentTimestamp = () => Math.floor(Date.now() / 1000).toString();

  useEffect(() => {
    return () => {
      setCurrentTimestamp();
    };
  }, [setCurrentTimestamp]);

  useEffect(() => {
    const localStorageTimestamp = getLocalStorageTimestamp();
    const timestamp =
      localStorageTimestamp === null
        ? currentTimestamp()
        : localStorageTimestamp;
    dispatch(updateTimestamp({ timestamp }));
    setCurrentTimestamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
