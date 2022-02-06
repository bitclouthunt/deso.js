import { v4 as uuid } from "uuid";

/**
 * This has been copied & adapted from the BitClout identity service
 * See: https://github.com/bitclout/frontend/blob/main/src/app/identity.service.ts
 */

const DESO_IDENTITY_URL = "https://identity.deso.org";

export class IdentityService {
  // Requests that were sent before the iframe initialized
  private pendingRequests: any = [];

  // All outbound request promises we still need to resolve
  private outboundRequests: any = {};

  // The currently active identity window
  private identityWindow: any;
  private identityWindowResolve: any;

  private initialized = false;
  private iframe: any = null;

  // Wait for storageGranted broadcast
  // storageGranted = new Subject();

  // The URL of the identity service
  baseUrl: string;

  // Using testnet or mainnet
  isTestnet: boolean;

  // Jumio referral code
  referralCode: string;

  // Whether we're using a webview
  isWebview: boolean;

  /**
   * @param {string} [serviceUrl="https://identity.deso.org"] The base url for
   * the Identity Service.
   * @param {boolean} [isTestnet=false] Whether to use testnet (or mainnet).
   * @param {boolean} [isWebview=false] Whether we're using webview.
   * @param {string} [referralCode] Referral Code through which the user accessed
   * the site. Allows the user to get a greater amount of money as a sign-up bonus.
   */
  constructor({ serviceUrl = DESO_IDENTITY_URL, isTestnet, isWebView, referralCode }: {
    serviceUrl?: string,
    isTestnet?: boolean,
    isWebView?: boolean,
    referralCode?: string,
  } = {}) {
    if (typeof window === "undefined") return;

    this.baseUrl = serviceUrl;
    this.isTestnet = isTestnet;
    this.isWebview = isWebView;
    this.referralCode = referralCode;

    window.addEventListener("message", (event) => this.handleMessage(event));
  }

  // Launch a new identity window

  /**
   * This endpoint is used to handle user login or account creation.
   *
   * @param {number} [accessLevel=2] Requested access level.
   * @param {boolean} [jumio=false] Whether to show "get free deso" during signup.
   * @param {boolean} [hideGoogle=false] Hide Google login from the Identity UI.
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  login({ accessLevel, jumio, hideGoogle }: {
    accessLevel?: number,
    jumio?: boolean,
    hideGoogle?: boolean,
  }): Promise<any> {
    const params = new URLSearchParams();

    if (accessLevel) {
      params.append("accessLevelRequest", accessLevel.toString());
    }

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    if (this.isWebview) {
      params.append("webview", String(this.isWebview));
    }

    if (jumio) {
      params.append("jumio", String(jumio));
    }

    if (this.referralCode) {
      params.append("referralCode", this.referralCode);
    }

    if (hideGoogle) {
      params.append("hideGoogle", String(hideGoogle));
    }

    return this.launch("/log-in", params);
  }

  /**
   * Used to reset the accessLevel of an individual user. You should handle user
   * logout by calling this endpoint. When you logout a user, you should delete
   * the corresponding userCredentials entry form the local storage/database.
   *
   * @param {string} publicKey Public key of the user that is logging out
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  logout({ publicKey }: { publicKey: string }): Promise<any> {
    const params = new URLSearchParams();

    if (!publicKey) {
      throw new Error("publicKey is required");
    }

    params.append("publicKey", publicKey);

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    if (this.isWebview) {
      params.append("webview", String(this.isWebview));
    }

    return this.launch("/logout", params);
  }

  /**
   * The approve endpoint is used for transaction signing. Usually, the approve
   * endpoint is called when you want to sign a transaction that's outside the
   * scope of the accessLevel you have requested during login.
   *
   * @param {string} transactionHex Transaction hex of the transaction to sign.
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  approve({ transactionHex }: { transactionHex: string }): Promise<any> {
    const params = new URLSearchParams();

    if (!transactionHex) {
      throw new Error("transactionHex is required");
    }

    params.append("tx", transactionHex);

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    if (this.isWebview) {
      params.append("webview", String(this.isWebview));
    }

    return this.launch("/approve", params);
  }

  /**
   * Used to generate a derived key for a user. When you hold a derived key, you
   * can sign transactions for a user without having to interact with the DeSo
   * Identity Service. Derived keys are intended to be used primarily in mobile
   * applications and with callbacks.
   *
   * @param {string} [callback] Callback URL for the payload.
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  derive({ callback }: { callback?: string }): Promise<any> {
    const params = new URLSearchParams();

    if (callback) {
      params.append("callback", callback);
    }

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    if (this.isWebview) {
      params.append("webview", String(this.isWebview));
    }

    return this.launch("/derive", params);
  }

  /**
   * This endpoint is intended to be used in combination with derived keys. It allows
   * you to get message encryption/decryption keys, or shared secrets, so that you
   * can read messages without querying Identity.
   *
   * @param {string} callback Callback URL for the payload.
   * @param {string} ownerPublicKey Master public key that was used to get the derived key.
   * @param {string} derivedPublicKey Derived public key.
   * @param {string} jwt JWT signed by the derived key, it's returned as derivedJwt
   * from {@link derive}.
   * @param messagePublicKeys Public keys of users for which we want to fetch shared
   * secrets.
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  getSharedSecrets({ callback, ownerPublicKey, derivedPublicKey, jwt, messagePublicKeys }: {
    callback: string,
    ownerPublicKey: string,
    derivedPublicKey: string,
    jwt: string,
    messagePublicKeys: string[],
  }): Promise<any> {
    const params = new URLSearchParams();

    if (!callback) {
      throw new Error("callback is required");
    }

    if (!ownerPublicKey) {
      throw new Error("ownerPublicKey is required");
    }

    if (!derivedPublicKey) {
      throw new Error("derivedPublicKey is required");
    }

    if (!jwt) {
      throw new Error("jwt is required");
    }

    if (!messagePublicKeys || messagePublicKeys.length === 0) {
      throw new Error("messagePublicKeys is required");
    }

    params.append("callback", callback);
    params.append("ownerPublicKey", ownerPublicKey);
    params.append("derivedPublicKey", derivedPublicKey);
    params.append("JWT", jwt);
    params.append("messagePublicKeys", messagePublicKeys.join());

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    return this.launch("/get-shared-secrets", params);
  }

  /**
   * Allows for launching the Jumio KYC flow, and if completed successfully, it
   * will end up sending your users free starter DeSo or their referral bonus.
   *
   * @param publicKey Public key of the user to be KYC verified.
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  getFreeDeso({ publicKey }: { publicKey: string }): Promise<any> {
    const params = new URLSearchParams();

    if (!publicKey) {
      throw new Error("publicKey is required");
    }

    params.append("publicKey", publicKey);

    if (this.referralCode) {
      params.append("referralCode", this.referralCode);
    }

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    return this.launch("/get-free-deso", params);
  }

  /**
   * Gives the user some starter DeSo after a successful phone verification.
   *
   * @param publicKey Public key of the user to be phone verified.
   * @returns {Promise<any>} A Promise that resolves the response message payload.
   */
  verifyPhoneNumber({ publicKey }: { publicKey: string }): Promise<any> {
    const params = new URLSearchParams();

    if (!publicKey) {
      throw new Error("publicKey is required");
    }

    params.append("publicKey", publicKey);

    if (this.isTestnet) {
      params.append("testnet", String(this.isTestnet));
    }

    return this.launch("/verify-phone-number", params);
  }

  launch(
    path?: string,
    params?: URLSearchParams
  ): Promise<any> {
    let url = this.baseUrl;

    if (path) {
      url += path;
    }

    if (params && params.toString().length > 0) {
      url += "?" + params.toString();
    }

    // center the window
    const h = 1000;
    const w = 800;
    const y = window.outerHeight / 2 + window.screenY - h / 2;
    const x = window.outerWidth / 2 + window.screenX - w / 2;

    this.identityWindow = window.open(
      url,
      undefined,
      `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`
    );

    const promise = new Promise((res, rej) => {
      this.identityWindowResolve = res;
    });
    return promise;
  }

  // Outgoing messages

  /**
   * The sign message is responsible for signing transaction hexes.
   *
   * @param {string} payload.transactionHex Hex of the transaction you want to sign.
   */
  sign(payload: {
    accessLevel: number;
    accessLevelHmac: string;
    encryptedSeedHex: string;
    transactionHex: string;
  }): Promise<any> {
    return this.send("sign", payload);
  }

  /**
   * The encrypt API is responsible for encrypting messages.
   *
   * @param {string} payload.recipientPublicKey Public key of the recipient in
   * base58check format.
   * @param {string} payload.message Message text that you want to encrypt.
   */
  encrypt(payload: {
    accessLevel: number;
    accessLevelHmac: string;
    encryptedSeedHex: string;
    recipientPublicKey: string;
    message: string;
  }): Promise<any> {
    return this.send("encrypt", payload);
  }

  /**
   * The decrypt API is responsible for decrypting messages.
   *
   * @param {string[]} payload.encryptedMessages List of encrypted messages objects.
   */
  decrypt(payload: {
    accessLevel: number;
    accessLevelHmac: string;
    encryptedSeedHex: string;
    encryptedMessages: any[];
  }): Promise<any> {
    return this.send("decrypt", payload);
  }

  /**
   * The jwt message creates signed JWT tokens that can be used to verify a user's
   * ownership of a specific public key. The JWT is only valid for 10 minutes.
   */
  jwt(payload: {
    accessLevel: number;
    accessLevelHmac: string;
    encryptedSeedHex: string;
  }): Promise<any> {
    return this.send("jwt", payload);
  }

  // Incoming messages

  private handleInitialize(event: MessageEvent) {
    if (!this.initialized) {
      this.initialized = true;
      this.iframe = document.getElementById("identity");
      for (const request of this.pendingRequests) {
        this.postMessage(request);
      }
      this.pendingRequests = [];
    }

    // acknowledge, provides hostname data
    this.respond(event.source as Window, event.data.id, {});
  }

  private handleLogin(payload: any) {
    this.identityWindow.close();
    this.identityWindow = null;

    this.identityWindowResolve(payload);
    this.identityWindowResolve = null;
  }

  private handleInfo(id: string) {
    this.respond(this.identityWindow, id, {});
  }

  // Message handling

  private handleMessage(event: MessageEvent) {
    const { data } = event;
    const { service, method } = data;

    if (service !== "identity") {
      return;
    }

    // Methods are present on incoming requests but not responses
    if (method) {
      this.handleRequest(event);
    } else {
      this.handleResponse(event);
    }
  }

  private handleRequest(event: MessageEvent) {
    const {
      data: { id, method, payload },
    } = event;

    console.log(`handleRequest: ${method}`);
    if (method === "initialize") {
      this.handleInitialize(event);
      // } else if (method === "storageGranted") {
      // this.handleStorageGranted();
    } else if (method === "login") {
      this.handleLogin(payload);
    } else if (method === "info") {
      this.handleInfo(id);
    } else {
      console.error("Unhandled identity request");
      console.error(event);
    }
  }

  private handleResponse(event: MessageEvent) {
    const {
      data: { id, payload },
    } = event;

    const { resolve, reject } = this.outboundRequests[id];
    resolve(payload);
    delete this.outboundRequests[id];
  }

  // Send a new message and expect a response
  private send(method: string, payload: any) {
    const req = {
      id: uuid(),
      method,
      payload,
      service: "identity",
    };

    const promise = new Promise((resolve, reject) => {
      this.postMessage(req);
      this.outboundRequests[req.id] = { resolve, reject };
    });

    return promise;
  }

  private postMessage(req: any) {
    if (this.initialized) {
      this.iframe.contentWindow.postMessage(req, "*");
    } else {
      this.pendingRequests.push(req);
    }
  }

  // Respond to a received message
  private respond(window: Window, id: string, payload: any): void {
    window.postMessage({ id, service: "identity", payload }, "*");
  }
}
