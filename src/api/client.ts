import { BASE_URL } from "@/config/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    if (res.status === 404) {
      throw new Error("Not found");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed (${res.status})`);
    }
    return res.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(res);
  }
}

export const apiClient = new ApiClient(BASE_URL);
