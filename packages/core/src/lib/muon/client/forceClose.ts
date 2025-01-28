import { toast } from "react-hot-toast";
import { MuonClient } from "./base";
import { Address } from "viem";

export class ForceCloseClient extends MuonClient {
  constructor() {
    super({ APP_METHOD: "priceRange" });
  }

  static createInstance(isEnabled: boolean): ForceCloseClient | null {
    if (isEnabled) {
      return new ForceCloseClient();
    }
    return null;
  }

  private _getRequestParams(
    partyA: string | null,
    partyB: string | null,
    t0: number,
    t1: number,
    symbolId: number,
    chainId?: number,
    contractAddress?: string
  ): string[][] | Error {
    if (!partyA) return new Error("Param `partyA` is missing.");
    if (!partyB) return new Error("Param `partyB` is missing.");
    if (!t0) return new Error("Param `start timestamp` is missing.");
    if (!t1) return new Error("Param `end timestamp` is missing.");
    if (!symbolId) return new Error("Param `symbolId` is missing.");
    if (!chainId) return new Error("Param `chainId` is missing.");
    if (!contractAddress)
      return new Error("Param `contractAddress` is missing.");

    return [
      ["partyA", partyA],
      ["partyB", partyB],
      ["t0", t0.toString()],
      ["t1", t1.toString()],
      ["symbolId", symbolId.toString()],
      ["chainId", chainId.toString()],
      ["symmio", contractAddress],
    ];
  }

  public async getMuonSig(
    appName: string,
    partyA: string | null,
    partyB: string | null,
    t0: number,
    t1: number,
    id: number,
    urls: string[],
    chainId?: number,
    contractAddress?: string
  ) {
    let lastError;
    try {
      const requestParams = this._getRequestParams(
        partyA,
        partyB,
        t0,
        t1,
        id,
        chainId,
        contractAddress
      );
      if (requestParams instanceof Error)
        throw new Error(requestParams.message);
      console.info("Requesting data from Muon: ", requestParams);

      const toastId = toast.loading("requesting data from Muon...");
      let result, success;

      for (const url of urls) {
        try {
          const res = await this._sendRequest(url, appName, requestParams);
          if (res) {
            result = res.result;
            success = res.success;
          }

          break; // Exit the loop if successful
        } catch (error: any) {
          console.log("Retrying with the next URL...");
          lastError = error;
        }
      }

      toast.success("Muon responded", {
        id: toastId,
      });

      console.info("Response from Muon: ", result);

      if (!success) {
        throw new Error(lastError.message);
      }

      const reqId = result["reqId"] as Address;
      const timestamp = BigInt(result["data"]["timestamp"]);
      const symbolId = BigInt(result["data"]["result"]["symbolId"]);
      const highest = BigInt(result["data"]["result"]["highest"]);
      const lowest = BigInt(result["data"]["result"]["lowest"]);
      const averagePrice = BigInt(result["data"]["result"]["mean"]);
      const startTime = BigInt(result["data"]["result"]["startTime"]);
      const endTime = BigInt(result["data"]["result"]["endTime"]);
      const upnlPartyB = result["data"]["result"]["uPnlB"];
      const upnlPartyA = result["data"]["result"]["uPnlA"];
      const currentPrice = BigInt(result["data"]["result"]["price"]);
      const gatewaySignature = result["nodeSignature"] as Address;
      const signature = BigInt(result["signatures"][0]["signature"]);
      const owner = result["signatures"][0]["owner"] as Address;
      const nonce = result["data"]["init"]["nonceAddress"] as Address;

      const generatedSignature = {
        reqId,
        timestamp,
        symbolId,
        highest,
        lowest,
        averagePrice,
        startTime,
        endTime,
        upnlPartyB,
        upnlPartyA,
        currentPrice,
        gatewaySignature,
        sigs: { signature, owner, nonce },
      };

      return { success: true, signature: generatedSignature };
    } catch (error: any) {
      console.error(error);
      toast.remove();
      toast.error(error?.message || "Unable to get response from Muon");
      return { success: false, error };
    }
  }
}
