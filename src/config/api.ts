// src/config/api.ts
export const BASE_URL = "http://127.0.0.1:8000/api";
// Backend root, used to resolve relative asset paths (storage/...)
export const ASSET_BASE_URL = "http://127.0.0.1:8000";

export function resolveAsset(path?: string | null): string {
  if (!path) return "/placeholder.svg";
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE_URL}/${path.replace(/^\//, "")}`;
}
