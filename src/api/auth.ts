import { BASE_URL } from "@/config/api";
import { User, LoginData, RegisterData } from "../types/auth";

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
  if (!res.ok) throw new Error(parsed.message || "Login failed");
  if (parsed.token) localStorage.setItem("auth_token", parsed.token);
  return parsed.user;
}

export async function getUser(): Promise<User> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
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
  if (!res.ok) throw new Error(parsed.message || "Registration failed");
  if (parsed.token) localStorage.setItem("auth_token", parsed.token);
  return parsed.user;
}