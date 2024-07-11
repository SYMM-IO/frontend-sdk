export type ConstructCallReturnType = Promise<
  | {
      args: ReadonlyArray<any>;
      functionName: string;
      config: {
        account: `0x${string}`;
        to: `0x${string}`;
        data: `0x${string}`;
        value: bigint;
      };
    }
  | {
      args: ReadonlyArray<any>;
      functionName: string;
      config: {
        account: `0x${string}`;
        to: `0x${string}`;
        data: `0x${string}`;
        value: bigint;
      };
      error: any;
    }
>;
