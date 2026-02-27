export interface OmvConfig {
  host: string;
  username: string;
  password: string;
  allowSelfSigned: boolean;
}

interface OmvResponse {
  response: unknown;
  error: { code: number; message: string; trace?: string } | null;
}

export class OmvClient {
  private baseUrl: string;
  private sessionId: string | null = null;
  private cookie: string | null = null;

  constructor(private config: OmvConfig) {
    this.baseUrl = `https://${config.host}`;

    if (config.allowSelfSigned) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
  }

  private parseCookies(setCookieHeaders: string[]): string {
    const cookies: string[] = [];
    for (const header of setCookieHeaders) {
      const parts = header.split(";");
      if (parts[0]) {
        cookies.push(parts[0].trim());
      }
    }
    return cookies.join("; ");
  }

  private extractSessionId(cookieStr: string): string | null {
    const match = cookieStr.match(/PHPSESSID=([^;]+)/);
    return match ? match[1] : null;
  }

  async login(): Promise<void> {
    const url = `${this.baseUrl}/rpc.php`;
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `OMV login failed (${response.status}): ${await response.text()}`,
      );
    }

    // Extract Set-Cookie headers
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      this.cookie = this.parseCookies([setCookieHeader]);
      this.sessionId = this.extractSessionId(setCookieHeader);
    }

    const data = (await response.json()) as OmvResponse;

    if (data.error) {
      throw new Error(
        `OMV login error: ${data.error.message} (code ${data.error.code})`,
      );
    }

    // If we didn't get the session ID from cookie, try to extract it from the response
    if (!this.sessionId && data.response && typeof data.response === "object") {
      const resp = data.response as Record<string, unknown>;
      if (resp["PHPSESSID"]) {
        this.sessionId = resp["PHPSESSID"] as string;
      }
    }

    if (!this.sessionId && this.cookie) {
      this.sessionId = this.extractSessionId(this.cookie);
    }
  }

  async rpc(
    service: string,
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    if (!this.sessionId && !this.cookie) {
      await this.login();
    }

    const url = `${this.baseUrl}/rpc.php`;
    const body = {
      service,
      method,
      params,
      options: null,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.cookie) {
      headers["Cookie"] = this.cookie;
    }
    if (this.sessionId) {
      headers["X-OPENMEDIAVAULT-SESSIONID"] = this.sessionId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      // Session expired — re-login and retry
      await this.login();
      return this.rpc(service, method, params);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OMV API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as OmvResponse;

    if (data.error) {
      throw new Error(
        `OMV RPC error [${service}.${method}]: ${data.error.message} (code ${data.error.code})`,
      );
    }

    return data.response;
  }

  async getList(
    service: string,
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown[]> {
    const defaultParams = {
      start: 0,
      limit: 100,
      sortfield: null,
      sortdir: null,
      ...params,
    };

    const result = await this.rpc(service, method, defaultParams);

    // Many OMV list responses return { data: [...], total: N }
    if (result && typeof result === "object" && !Array.isArray(result)) {
      const obj = result as Record<string, unknown>;
      if (Array.isArray(obj["data"])) {
        return obj["data"];
      }
    }

    if (Array.isArray(result)) {
      return result;
    }

    return result ? [result] : [];
  }
}
