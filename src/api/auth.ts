import { BASE_URL } from "@/config/api";
import { User, LoginData, RegisterData } from "../types/auth";

export async function getCsrfCookie() {
  await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

export async function login(data: LoginData): Promise<User> {
  await getCsrfCookie();
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const text = await res.text();
  if (!res.ok) throw new Error("Login failed");
  const parsed = JSON.parse(text);
  // Store token if returned
  if (parsed.token) {
    localStorage.setItem("auth_token", parsed.token);
  }
  return parsed;
}

export async function getUser(): Promise<User> {
  const headers: HeadersInit = { Accept: "application/json" };
  const token = localStorage.getItem("auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/auth/me`, { credentials: "include", headers });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function logout() {
  const headers: HeadersInit = { Accept: "application/json" };
  const token = localStorage.getItem("auth_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include", headers });
  localStorage.removeItem("auth_token");
  if (!res.ok) throw new Error("Logout failed");
}

export async function register(data: RegisterData): Promise<User> {
  await getCsrfCookie();
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }
  const parsed = await res.json();
  if (parsed.token) {
    localStorage.setItem("auth_token", parsed.token);
  }
  return parsed;
}
