import { toast } from "react-hot-toast";

import { MuonClient } from "./base";
import { toWei } from "../../../utils/numbers";
import { Address } from "viem";

export class QuotesClient extends MuonClient {
  constructor() {
    super({ APP_METHOD: "uPnl_A_withSymbolPrice" });
  }

  static createInstance(isEnabled: boolean): QuotesClient | null {
    if (isEnabled) {
      return new QuotesClient();
    }
    return null;
  }

  private _getRequestParams(
    account: string | null,
    chainId?: number,
    contractAddress?: string,
    marketId?: number
  ): string[][] | Error {
    if (!account) return new Error("Param `account` is missing.");
    if (!chainId) return new Error("Param `chainId` is missing.");
    if (!contractAddress)
      return new Error("Param `contractAddress` is missing.");
    if (!marketId) return new Error("Param `marketId` is missing.");

    return [
      ["partyA", account],
      ["chainId", chainId.toString()],
      ["symmio", contractAddress],
      ["symbolId", marketId.toString()],
    ];
  }

  public async getMuonSig(
    account: string | null,
    appName: string,
    urls: string[],
    chainId?: number,
    contractAddress?: string,
    marketId?: number
  ) {
    try {
      const requestParams = this._getRequestParams(
        account,
        chainId,
        contractAddress,
        marketId
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
        } catch (error) {
          console.log("Retrying with the next URL...");
        }
      }

      toast.success("Muon responded", {
        id: toastId,
      });

      console.info("Response from Muon: ", result);

      if (!success) {
        throw new Error("");
      }

      const reqId = result["reqId"] as Address;
      const timestamp = BigInt(result["data"]["timestamp"]);
      const upnl = BigInt(result["data"]["result"]["uPnl"]);
      const price = BigInt(result["data"]["result"]["price"]);
      const gatewaySignature = result["nodeSignature"] as Address;

      const signature = BigInt(result["signatures"][0]["signature"]);
      const owner = result["signatures"][0]["owner"] as Address;
      const nonce = result["data"]["init"]["nonceAddress"] as Address;

      const generatedSignature = {
        reqId,
        timestamp,
        upnl,
        price: price ? price : toWei(0),
        gatewaySignature,
        sigs: { signature, owner, nonce },
      };

      return { success: true, signature: generatedSignature };
    } catch (error) {
      console.error(error);
      toast.remove();
      toast.error("Unable to get response from Muon");
      return { success: false, error };
    }
  }
}
