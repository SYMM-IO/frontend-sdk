import axios from "axios";

interface ApiResponse {
  result: any;
  success: boolean;
}

export class MuonClient {
  public APP_METHOD: string;

  constructor({ APP_METHOD }: { APP_METHOD: string }) {
    this.APP_METHOD = APP_METHOD;
  }

  public async _sendRequest(
    baseUrl: string,
    appName: string,
    requestParams: string[][]
  ) {
    const MuonURL = new URL(baseUrl);
    MuonURL.searchParams.set("app", appName);
    MuonURL.searchParams.append("method", this.APP_METHOD);
    requestParams.forEach((param) => {
      MuonURL.searchParams.append(`params[${param[0]}]`, param[1]);
    });

    try {
      const response = await axios.get<ApiResponse>(MuonURL.href);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
        throw new Error(
          error.response?.data.error.message ||
            "An unknown error in get muon response"
        );
      } else {
        console.error(`Error during request to ${baseUrl}:`, error);
        throw error;
      }
    }
  }
}
