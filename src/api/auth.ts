import { BASE_URL } from "../config/api";
import { User, LoginData, RegisterData } from "../types/auth";

// Get CSRF cookie
export async function getCsrfCookie() {
  await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

// Login
export async function login(data: LoginData): Promise<User> {
  await getCsrfCookie();

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  // 👇 READ ONLY ONCE
  const text = await res.text();
  console.log("SERVER RESPONSE:", text);

  if (!res.ok) {
    throw new Error("Login failed");
  }

  // 👇 convert manually
  return JSON.parse(text);
}
// Get current user
export async function getUser(): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

// Logout
export async function logout() {
  const res = await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("Logout failed");
}

// Register
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

  return res.json();
}