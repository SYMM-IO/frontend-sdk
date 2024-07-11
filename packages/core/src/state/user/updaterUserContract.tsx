import isEqual from "lodash/isEqual.js";
import useActiveWagmi from "../../lib/hooks/useActiveWagmi";
import {
  useAccountPartyAStat,
  useActiveAccountAddress,
  useIsTermsAccepted,
} from "./hooks";
import { usePartyAStats } from "../../hooks/usePartyAStats";
import { useEffect, useState } from "react";
import { updateAcceptTerms, updateAccountPartyAStat } from "./actions";
import { useAppDispatch } from "../declaration";
import { useCheckSignedMessage } from "../../hooks/useCheckSign";

export function UpdaterUserContract(): null {
  const dispatch = useAppDispatch();
  //TODO: maybe there is better way?!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [time, setTime] = useState(0);
  const { account } = useActiveWagmi();
  const previousAccountPartyAStat = useAccountPartyAStat(account);
  const activeAccountAddress = useActiveAccountAddress();
  const previousActiveAccountPartyAStat =
    useAccountPartyAStat(activeAccountAddress);
  const accountPartyAStat = usePartyAStats(account);
  const activePartyAStat = usePartyAStats(activeAccountAddress);

  const previousAcceptTerms = useIsTermsAccepted();
  const { isTermsAccepted } = useCheckSignedMessage(account);

  useEffect(() => {
    if (
      account !== undefined &&
      !isEqual(previousAccountPartyAStat, accountPartyAStat)
    ) {
      dispatch(
        updateAccountPartyAStat({ address: account, value: accountPartyAStat })
      );
    }
  }, [accountPartyAStat, account, dispatch]);

  useEffect(() => {
    if (
      activeAccountAddress &&
      !isEqual(previousActiveAccountPartyAStat, activePartyAStat)
    ) {
      dispatch(
        updateAccountPartyAStat({
          address: activeAccountAddress,
          value: activePartyAStat,
        })
      );
    }
  }, [activePartyAStat, activeAccountAddress, dispatch]);

  useEffect(() => {
    if (account !== undefined && previousAcceptTerms !== isTermsAccepted) {
      dispatch(updateAcceptTerms(isTermsAccepted));
    }
  }, [account, dispatch, isTermsAccepted]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
