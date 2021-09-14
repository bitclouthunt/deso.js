import axios, { AxiosInstance } from "axios";

const DEFAULT_NODE_URL = "https://bitclout.com/api";

let client: AxiosInstance | null;

export class BitClout {
  baseUrl: string;

  constructor({ baseUrl = DEFAULT_NODE_URL }: { baseUrl?: string }) {
    this.baseUrl = baseUrl;
  }

  async getIsHodlingPublicKey({
    publicKey,
    isHodlingPublicKey,
  }: {
    publicKey?: string;
    isHodlingPublicKey?: string;
  }) {
    if (!publicKey) {
      throw new Error("publicKey is required");
    }

    if (!isHodlingPublicKey) {
      throw new Error("isHodlingPublicKey is required");
    }

    const path = "/v0/is-hodling-public-key";
    const data = {
      PublicKeyBase58Check: publicKey,
      IsHodlingPublicKeyBase58Check: isHodlingPublicKey,
    };

    const result = await this.getClient().post(path, data);

    return result?.data;
  }

  async getSingleProfile({
    publicKey,
    username,
  }: {
    publicKey?: string;
    username?: string;
  }) {
    if (!publicKey && !username)
      throw new Error("publicKey or username is required");

    const path = "/v0/get-single-profile";
    const data: any = {};
    if (publicKey) {
      data.PublicKeyBase58Check = publicKey;
    } else if (username) {
      data.username = username;
    }

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  async getUsersStateless({ publicKeys }: { publicKeys: string[] }) {
    const path = "/v0/get-users-stateless";
    const data = {
      PublicKeysBase58Check: publicKeys,
      SkipForLeaderboard: true,
    };

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  async getFollowsStateless({
    publicKey,
    getEntriesFollowingUsername,
    numToFetch,
  }: {
    publicKey: string;
    getEntriesFollowingUsername: boolean;
    numToFetch: number;
  }) {
    const path = "/v0/get-follows-stateless";
    const data = {
      PublicKeyBase58Check: publicKey,
      GetEntriesFollowingUsername: getEntriesFollowingUsername,
      NumToFetch: numToFetch,
    };

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  async getHoldersForPublicKey({
    readerPublicKey,
    publicKey,
    numToFetch,
  }: {
    readerPublicKey: string;
    publicKey: string;
    numToFetch: number;
  }) {
    const path = "/v0/get-hodlers-for-public-key";
    const data = {
      ReaderPublicKeyBase58Check: readerPublicKey,
      PublicKeyBase58Check: publicKey,
      NumToFetch: numToFetch,
    };

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  async submitTransaction({ transactionHex }: { transactionHex: string }) {
    const path = "/v0/submit-transaction";
    const data = {
      TransactionHex: transactionHex,
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
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
    });
    return client;
  }
}
