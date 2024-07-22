declare global {
  namespace NodeJS {
    interface Process {
      NODE_ENV: "development" | "production";
    }
  }

  interface Window {
    TradingView?: any;
    web3?: Record<string, unknown>;
  }
}

export {};
