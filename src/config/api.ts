// API base URLs come from environment variables (Vite). Never hardcode them.
// Configure per environment in .env.development / .env.production.
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
const ASSET_URL =
  import.meta.env.VITE_ASSET_URL ?? API_URL.replace(/\/api\/?$/, "");

export const BASE_URL = API_URL.replace(/\/$/, "");
// Backend root, used to resolve relative asset paths (storage/...)
export const ASSET_BASE_URL = ASSET_URL.replace(/\/$/, "");

export function resolveAsset(path?: string | null): string {
  if (!path) return "/placeholder.svg";
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE_URL}/${path.replace(/^\//, "")}`;
}
