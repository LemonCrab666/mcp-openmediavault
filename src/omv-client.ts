
export interface OmvConfig {
  host: string;
  username: string;
  password: string;
}

interface OmvResponse {
  response: unknown;
  error: { code: number; message: string; trace?: string } | null;
}

export type OmvVersion = "omv5" | "omv6" | "omv8" | "unknown";

export class OmvClient {
  private baseUrl: string;
  private sessionCookie: string | null = null;
  private _omvVersion: OmvVersion = "unknown";
  private _versionChecked = false;

  constructor(private config: OmvConfig) {
    this.baseUrl = "http://" + config.host;
  }

  get omvVersion(): OmvVersion {
    return this._omvVersion;
  }

  private async rawRpc(
    service: string,
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    const url = this.baseUrl + "/rpc.php";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.sessionCookie) {
      headers["Cookie"] = this.sessionCookie;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ service, method, params, options: null }),
    });

    if (response.status === 401) {
      this.sessionCookie = null;
      throw new Error("Session expired");
    }
    if (!response.ok) {
      throw new Error("OMV API error (" + response.status + "): " + await response.text());
    }

    const data = (await response.json()) as OmvResponse;
    if (data.error) {
      throw new Error(
        "OMV RPC error [" + service + "." + method + "]: " + data.error.message,
      );
    }
    return data.response;
  }

  async login(): Promise<void> {
    const url = this.baseUrl + "/rpc.php";
    const body = {
      service: "Session",
      method: "login",
      params: {
        username: this.config.username,
        password: this.config.password,
      },
      options: null,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        "OMV login failed (" + response.status + "): " + await response.text(),
      );
    }

    const data = (await response.json()) as OmvResponse;
    if (data.error) {
      throw new Error(
        "OMV login error: " + data.error.message,
      );
    }

    // Get session cookie from Set-Cookie header
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const cookies = setCookie.split(",");
      for (const c of cookies) {
        if (c.includes("OPENMEDIAVAULT-SESSIONID=")) {
          this.sessionCookie = c.split(";")[0].trim();
          break;
        }
      }
    }

    // Fallback: extract sessionid from response body
    if (!this.sessionCookie && data.response && typeof data.response === "object") {
      const resp = data.response as Record<string, unknown>;
      if (resp["sessionid"]) {
        this.sessionCookie = "OPENMEDIAVAULT-SESSIONID=" + resp["sessionid"];
      }
    }

    if (!this.sessionCookie) {
      throw new Error("Login succeeded but no session cookie was returned");
    }
  }

  async detectVersion(): Promise<OmvVersion> {
    if (this._versionChecked) return this._omvVersion;

    await this.login();

    try {
      await this.rawRpc("UserMgmt", "getUserList", {
        start: 0, limit: 1, sortfield: null, sortdir: null,
      });
      this._omvVersion = "omv8";
    } catch {
      try {
        await this.rawRpc("UserMgmt", "getList", {
          start: 0, limit: 1, sortfield: null, sortdir: null,
        });
        this._omvVersion = "omv6";
      } catch {
        this._omvVersion = "unknown";
      }
    }

    this._versionChecked = true;
    return this._omvVersion;
  }

  async rpc(
    service: string,
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    if (!this._versionChecked) {
      await this.detectVersion();
    }
    if (!this.sessionCookie) {
      await this.login();
    }
    try {
      return await this.rawRpc(service, method, params);
    } catch (error: any) {
      if (error.message === "Session expired") {
        await this.login();
        return this.rawRpc(service, method, params);
      }
      throw error;
    }
  }

  async getList(
    service: string,
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown[]> {
    const defaultParams = {
      start: 0, limit: 100, sortfield: null, sortdir: null, ...params,
    };
    const result = await this.rpc(service, method, defaultParams);

    if (result && typeof result === "object" && !Array.isArray(result)) {
      const obj = result as Record<string, unknown>;
      if (Array.isArray(obj["data"])) {
        return obj["data"];
      }
    }
    if (Array.isArray(result)) return result;
    return result ? [result] : [];
  }
}
