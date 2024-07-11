import { getRemainingTime } from "../utils/time";
import { toBN } from "../utils/numbers";

import {
  useAccountPartyAStat,
  useActiveAccountAddress,
} from "../state/user/hooks";

export default function useIsCooldownActive() {
  const activeAccountAddress = useActiveAccountAddress();
  const { accountBalance, withdrawCooldown, cooldownMA } =
    useAccountPartyAStat(activeAccountAddress);
  const { diff } = getRemainingTime(
    toBN(withdrawCooldown).plus(cooldownMA).times(1000).toNumber()
  );

  return diff > 0 || toBN(accountBalance).isGreaterThan(0);
}
