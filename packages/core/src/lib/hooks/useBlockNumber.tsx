import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import useIsWindowVisible from "./useIsWindowVisible";
import useActiveWagmi from "./useActiveWagmi";
import { Config, usePublicClient } from "wagmi";
import { watchBlockNumber } from "@wagmi/core";

const MISSING_PROVIDER = Symbol();
const BlockNumberContext = createContext<
  | {
      value?: number;
      fastForward(block: number): void;
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER);

function useBlockNumberContext() {
  const blockNumber = useContext(BlockNumberContext);
  if (blockNumber === MISSING_PROVIDER) {
    throw new Error(
      "BlockNumber hooks must be wrapped in a <BlockNumberProvider>"
    );
  }
  return blockNumber;
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  return useBlockNumberContext().value;
}

export function useFastForwardBlockNumber(): (block: number) => void {
  return useBlockNumberContext().fastForward;
}

export function BlockNumberProvider({
  wagmiConfig,
  children,
}: {
  wagmiConfig: Config;
  children: ReactNode;
}) {
  const { chainId: activeChainId } = useActiveWagmi();
  const provider = usePublicClient();
  const [{ chainId, block }, setChainBlock] = useState<{
    chainId?: number;
    block?: number;
  }>({ chainId: activeChainId });

  const onBlock = useCallback(
    (block: number) => {
      setChainBlock((chainBlock) => {
        if (chainBlock.chainId === activeChainId) {
          if (!chainBlock.block || chainBlock.block < block) {
            return { chainId: activeChainId, block };
          }
        }
        return chainBlock;
      });
    },
    [activeChainId, setChainBlock]
  );

  const windowVisible = useIsWindowVisible();

  const unwatch = watchBlockNumber(wagmiConfig, {
    chainId: activeChainId,
    onBlockNumber(blockNumber) {
      onBlock(Number(blockNumber));
    },
    poll: true,
    pollingInterval: 1_000,
  });

  useEffect(() => {
    if (activeChainId) {
      // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.
      setChainBlock((chainBlock) =>
        chainBlock.chainId === activeChainId
          ? chainBlock
          : { chainId: activeChainId }
      );
      return () => {
        unwatch();
      };
    }
    return void 0;
  }, [activeChainId, provider, onBlock, setChainBlock, windowVisible, unwatch]);

  const value = useMemo(
    () => ({
      value: chainId === activeChainId ? block : undefined,
      fastForward: (update: number) => {
        if (block && update > block) {
          setChainBlock({ chainId: activeChainId, block: update });
        }
      },
    }),
    [activeChainId, block, chainId]
  );
  return (
    <BlockNumberContext.Provider value={value}>
      {children}
    </BlockNumberContext.Provider>
  );
}
