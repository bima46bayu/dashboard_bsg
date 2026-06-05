const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

export const useApi = Boolean(API_BASE);

export function apiUrl(path: string) {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

import { authHeaders } from "./auth";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
