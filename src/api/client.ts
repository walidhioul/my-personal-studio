import { BASE_URL } from "@/config/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(hasBody: boolean = true, isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = { Accept: "application/json" };
    // Only set JSON content-type for plain object bodies.
    // For FormData, the browser sets Content-Type (incl. multipart boundary) automatically.
    if (hasBody && !isFormData) headers["Content-Type"] = "application/json";
    const token = localStorage.getItem("auth_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      // Session is gone: drop the token and send the user to login once
      // (guard against redirect loops when already on the login page).
      localStorage.removeItem("auth_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
      throw new Error("Unauthorized");
    }
    // 403 = authenticated but not allowed. Keep the session; never log out.
    if (res.status === 403) throw new Error("You are not allowed to perform this action");
    if (res.status === 404) throw new Error("Not found");
    if (res.status === 204) return undefined as T;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed (${res.status})`);
    }
    return res.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(false),
      credentials: "include",
    });
    return this.handleResponse<T>(res);
  }

  // Fetch a binary response (e.g. a generated image/PDF) as a Blob.
  // Reuses the same auth/error handling as get(), but returns raw bytes.
  async getBlob(endpoint: string): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(false),
      credentials: "include",
    });
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
      throw new Error("Unauthorized");
    }
    if (res.status === 403) throw new Error("You are not allowed to perform this action");
    if (res.status === 404) throw new Error("Not found");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed (${res.status})`);
    }
    // A JSON body here means the backend declined to send the binary file
    // (e.g. certificate not earned yet). Surface its message instead of
    // downloading the JSON payload as a fake image.
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await res.json().catch(() => ({}));
      if (body && body.success === false) {
        throw new Error(body.message || "Certificate not available");
      }
    }
    return res.blob();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(true, isFormData),
      credentials: "include",
      body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(true, isFormData),
      credentials: "include",
      body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(true, isFormData),
      credentials: "include",
      body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(false),
      credentials: "include",
    });
    return this.handleResponse<T>(res);
  }
}

export const apiClient = new ApiClient(BASE_URL);