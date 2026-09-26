import { BASE_URL } from "@/config/api";
import { User, LoginData, RegisterData } from "../types/auth";

/**
 * Laravel validation errors look like: { field: ["message1", "message2"] }.
 * We surface the first message found, since that's the most actionable one.
 */
function extractErrorMessage(parsed: any, fallback: string): string {
  if (parsed?.errors && typeof parsed.errors === "object") {
    const firstField = Object.keys(parsed.errors)[0];
    const firstMessage = parsed.errors[firstField]?.[0];
    if (firstMessage) return firstMessage;
  }
  return parsed?.message || fallback;
}

export async function login(data: LoginData): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  const parsed = await res.json();
  if (!res.ok) throw new Error(extractErrorMessage(parsed, "Login failed"));
  if (parsed.data?.access_token) localStorage.setItem("auth_token", parsed.data.access_token);
  return parsed.data.user;
}

export async function getUser(): Promise<User | null> {
  const token = localStorage.getItem("auth_token");

  if (!token) return null;

  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem("auth_token");
    return null;
  }

  const parsed = await res.json();
  return parsed.data;
}

export async function logout() {
  const token = localStorage.getItem("auth_token");
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  localStorage.removeItem("auth_token");
}

export async function register(data: RegisterData): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  const parsed = await res.json();
  if (!res.ok) throw new Error(extractErrorMessage(parsed, "Registration failed"));
  if (parsed.data?.access_token) localStorage.setItem("auth_token", parsed.data.access_token);
  return parsed.data.user;
}