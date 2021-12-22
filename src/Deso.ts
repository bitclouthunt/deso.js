import axios, { AxiosInstance } from "axios";

const DEFAULT_NODE_URL = "https://node.deso.org/api";

let client: AxiosInstance | null;

export class DesoClient {
  baseUrl: string;

  constructor({ baseUrl = DEFAULT_NODE_URL }: { baseUrl?: string }) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get BitClout exchange rate, total amount of nanos sold, and Bitcoin exchange rate.
   */
  async getExchangeRate() {
    const path = "/v0/get-exchange-rate";

    const result = await this.getClient().get(path);

    return result?.data;
  }

  /**
   * Get state of BitClout App, such as cost of profile creation and diamond level map.
   */
  async getAppState() {
    const path = "/v0/get-app-state";

    const result = await this.getClient().post(path, {});

    return result?.data;
  }

  /**
   * Get hodling information about a specific Public Key (isHodlingPublicKey) given
   * a hodler Public Key (publicKey)
   */
  async getIsHodlingPublicKey({
    publicKey,
    isHodlingPublicKey,
  }: {
    publicKey: string;
    isHodlingPublicKey: string;
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

  /**
   * Get information about single profile.
   */
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

  /**
   * Get information about users. Request contains a list of public keys of users to fetch.
   */
  async getUsersStateless({ publicKeys }: { publicKeys: string[] }) {
    const path = "/v0/get-users-stateless";
    const data = {
      PublicKeysBase58Check: publicKeys,
      SkipForLeaderboard: true,
    };

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  /**
   * Get followers for given Public Key.
   */
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

  /**
   * Get BalanceEntryResponses for hodlings
   */
  async getHoldersForPublicKey({
    publicKey,
    username,
    numToFetch,
    fetchHodlings,
    lastPublicKey,
    fetchAll,
  }: {
    publicKey: string;
    username?: string;
    numToFetch: number;
    fetchHodlings?: boolean;
    lastPublicKey?: string;
    fetchAll?: boolean;
  }) {
    if (!publicKey && !username) {
      throw new Error("publicKey or username are required");
    }

    if (!numToFetch) {
      throw new Error("numToFetch is required");
    }

    const path = "/v0/get-hodlers-for-public-key";
    const data = {
      Username: username,
      FetchAll: fetchAll,
      PublicKeyBase58Check: publicKey,
      NumToFetch: numToFetch,
      LastPublicKeyBase58Check: lastPublicKey,
      FetchHodlings: fetchHodlings,
    };

    const result = await this.getClient().post(path, data);
    return result?.data;
  }

  /**
   * Get notifications for a given public key.
   * All parameters are required to get a response.
   * fetchStartIndex can be set to -1.
   */
  async getNotifications({
    publicKey,
    fetchStartIndex,
    numToFetch,
  }: {
    publicKey: string;
    fetchStartIndex: number;
    numToFetch: number;
  }) {
    if (!publicKey) {
      throw new Error("publicKey is required");
    }

    if (!fetchStartIndex) {
      throw new Error("fetchStartIndex is required");
    }

    if (!numToFetch) {
      throw new Error("numToFetch is required");
    }

    const path = "/v0/get-notifications";
    const data = {
      PublicKeyBase58Check: publicKey,
      FetchStartIndex: fetchStartIndex,
      NumToFetch: numToFetch,
    };

    const result = await this.getClient().post(path, data);

    return result?.data;
  }

  /**
   * Check if Txn is currently in mempool.
   */
  async getTransaction({ txnHashHex }: { txnHashHex: string }) {
    if (!txnHashHex) {
      throw new Error("txnHashHex is required");
    }

    const path = "/v0/get-txn";
    const data = {
      TxnHashHex: txnHashHex,
    };

    const result = await this.getClient().post(path, data);

    return result?.data;
  }

  /**
   * Submit transaction to BitClout blockchain.
   */
  async submitTransaction({ transactionHex }: { transactionHex: string }) {
    if (!transactionHex) {
      throw new Error("transactionHex is required");
    }

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
