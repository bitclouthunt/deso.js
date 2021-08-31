import axios, { AxiosInstance } from "axios";

const DEFAULT_NODE_URL = "https://bitclout.com/api";

let client: AxiosInstance | null;

export class BitClout {
  baseUrl: string;

  constructor({ baseUrl = DEFAULT_NODE_URL }: { baseUrl?: string }) {
    this.baseUrl = baseUrl;
  }

  async getSingleProfile({ publicKey }: { publicKey: string }) {
    const path = "/v0/get-single-profile";
    const data = {
      PublicKeyBase58Check: publicKey,
    };

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  private getClient() {
    if (client) return client;
    client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return client;
  }
}