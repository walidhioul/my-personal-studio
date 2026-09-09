import { BASE_URL } from "@/config/api";

export interface ApiEnvelope<T = null> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

/** Thrown when the backend returns success:false, carrying the validation errors. */
export class ApiValidationError extends Error {
  errors: Record<string, string[]> | null;
  constructor(message: string, errors: Record<string, string[]> | null) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** POST /auth/forgot-password — never sends Authorization. */
export async function forgotPassword(email: string): Promise<ApiEnvelope> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
  const parsed = (await res.json().catch(() => ({}))) as ApiEnvelope;
  if (!res.ok || parsed?.success === false) {
    throw new ApiValidationError(parsed?.message || "Request failed", parsed?.errors ?? null);
  }
  return parsed;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

/** POST /auth/reset-password — never sends Authorization / Bearer token. */
export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiEnvelope> {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  const parsed = (await res.json().catch(() => ({}))) as ApiEnvelope;
  if (!res.ok || parsed?.success === false) {
    throw new ApiValidationError(parsed?.message || "Request failed", parsed?.errors ?? null);
  }
  return parsed;
}

/** POST /auth/email/verification-notification — requires the Bearer token. */
export async function resendVerificationEmail(): Promise<ApiEnvelope> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}/auth/email/verification-notification`, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const parsed = (await res.json().catch(() => ({}))) as ApiEnvelope;
  if (!res.ok || parsed?.success === false) {
    throw new ApiValidationError(
      parsed?.message || "Could not send the verification email",
      parsed?.errors ?? null,
    );
  }
  return parsed;
}
