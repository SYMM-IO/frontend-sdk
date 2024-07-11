import { useRouter } from "next/router";
import { useEffect } from "react";

import { DEFAULT_HEDGER } from "constants/chains/hedgers";

export default function Trade() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/trade/${DEFAULT_HEDGER?.defaultMarketId}`);
  }, [router]);

  return null;
}
