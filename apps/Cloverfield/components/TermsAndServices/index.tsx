// import React from "react";

import useActiveWagmi from "@symmio/frontend-sdk/lib/hooks/useActiveWagmi";
import { useIsTermsAccepted } from "@symmio/frontend-sdk/state/user/hooks";

import TermsModal from "components/ReviewModal/TermsModal";

export default function TermsAndServices({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const { account } = useActiveWagmi();
  const isTermsAccepted = useIsTermsAccepted();

  if (account && !isTermsAccepted) {
    return <TermsModal onDismiss={onDismiss} />;
  }
  return null;
}
