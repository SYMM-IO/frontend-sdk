import { useCallback, useEffect } from "react";
import useBlockNumber from "../useBlockNumber";
import useActiveWagmi from "../useActiveWagmi";
import { usePublicClient } from "wagmi";
import { Address, TransactionReceipt } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useWagmiConfig } from "../../../state/chains";

interface Transaction {
  addedTime: number;
  receipt?: unknown;
  lastCheckedBlockNumber?: number;
}

export function shouldCheck(lastBlockNumber: number, tx: Transaction): boolean {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 60_000;
  if (minutesPending > 60) {
    // every 10 blocks if pending longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending longer than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

interface UpdaterProps {
  pendingTransactions: { [hash: string]: Transaction };
  onCheck: (tx: { chainId: number; hash: string; blockNumber: number }) => void;
  onReceipt: (tx: {
    chainId: number;
    hash: string;
    receipt: TransactionReceipt;
  }) => void;
}

export default function Updater({
  pendingTransactions,
  onCheck,
  onReceipt,
}: UpdaterProps): null {
  const { chainId } = useActiveWagmi();
  const provider = usePublicClient();
  const lastBlockNumber = useBlockNumber();
  const wagmiConfig = useWagmiConfig();

  const getReceipt = useCallback(
    async (hash: string) => {
      try {
        if (!provider || !chainId) throw new Error("No provider or chainId");
        return await waitForTransactionReceipt(wagmiConfig, {
          hash: hash as Address,
          onReplaced: (transaction) => console.log("OnReplace", transaction),
        });
      } catch (event) {
        if (event) {
          console.log("event", event);
        }
      }
    },
    [chainId, provider, wagmiConfig]
  );

  useEffect(() => {
    if (!chainId || !provider || !lastBlockNumber) return;
    const cancels = Object.keys(pendingTransactions)
      .filter((hash) => shouldCheck(lastBlockNumber, pendingTransactions[hash]))
      .map((hash) => {
        const resultReceipt = getReceipt(hash);
        resultReceipt
          .then((receipt) => {
            if (receipt) {
              onReceipt({ chainId, hash, receipt });
            } else {
              onCheck({ chainId, hash, blockNumber: lastBlockNumber });
            }
          })
          .catch((error) => {
            console.log("error reciept", error);
            if (!error.isCancelledError) {
              console.warn(
                `Failed to get transaction receipt for ${hash}`,
                error
              );
            }
          });
        return () => {};
      });

    return () => {
      cancels.forEach((cancel) => cancel());
    };
  }, [
    chainId,
    provider,
    lastBlockNumber,
    getReceipt,
    onReceipt,
    onCheck,
    pendingTransactions,
  ]);

  return null;
}
