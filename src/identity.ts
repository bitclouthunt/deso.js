import { v4 as uuid } from "uuid";

/**
 * This has been copied & adapted from the BitClout identity service
 * See: https://github.com/bitclout/frontend/blob/main/src/app/identity.service.ts
 */

export class IdentityService {
  // Requests that were sent before the iframe initialized
  private pendingRequests: any = [];

  // All outbound request promises we still need to resolve
  private outboundRequests: any = {};

  // The currently active identity window
  private identityWindow: any;
  private identityWindowResolve: any;

  // The URL of the identity service
  identityServiceURL = "https://identity.deso.org/";

  private initialized = false;
  private iframe: any = null;

  // Wait for storageGranted broadcast
  // storageGranted = new Subject();

  // Using testnet or mainnet
  isTestnet = false;

  constructor() {
    if (typeof window === "undefined") return;
    window.addEventListener("message", (event) => this.handleMessage(event));
  }

  // Launch a new identity window

  login({ accessLevel }: { accessLevel: number }): Promise<any> {
    return this.launch(`/log-in?accessLevelRequest=${accessLevel}`);
  }

  launch(
    path?: string
    // params?: { publicKey?: string; tx?: string }
  ): Promise<any> {
    let url = this.identityServiceURL as string;
    if (path) {
      url += path;
    }

    // TODO: support params

    // let httpParams = new HttpParams();
    // if (this.isTestnet) {
    //   httpParams = httpParams.append("testnet", "true");
    // }

    // if (params?.publicKey) {
    //   httpParams = httpParams.append("publicKey", params.publicKey);
    // }

    // if (params?.tx) {
    //   httpParams = httpParams.append("tx", params.tx);
    // }

    // const paramsStr = httpParams.toString();
    // if (paramsStr) {
    //   url += `?${paramsStr}`;
    // }

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

  sign(payload: {
    accessLevel: number;
    accessLevelHmac: string;
    encryptedSeedHex: string;
    transactionHex: string;
  }): Promise<any> {
    return this.send("sign", payload);
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

export const identity = new IdentityService();
