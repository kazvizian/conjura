/**
 * Lightweight, non-critical HTTP call (e.g., tracker, telemetry).
 * Does not throw and does not return a response body; only `{ ok, status }`.
 */
import { getBaseURL, getFetchImpl } from "./config"
import type { Method, WhisperOptions } from "./types"

export async function whisper(
  pathAPI: string,
  method: Method,
  options?: WhisperOptions
): Promise<{ ok: boolean; status: number }> {
  try {
    const headers = new Headers()
    headers.append("Accept", "application/json")
    headers.append("Content-Type", "application/json")
    if (options?.authKey)
      headers.append("Authorization", `Bearer ${options?.authKey}`)
    // SSR-only cookie + x-ssr header
    if (typeof window === "undefined") {
      headers.append("x-ssr", "true")
      if (
        options?.cookie &&
        typeof options.cookie === "object" &&
        Object.keys(options.cookie).length > 0
      ) {
        const cookieStr = Object.entries(options.cookie)
          .map(([k, v]) => `${k}=${v ?? ""}`)
          .join("; ")
        headers.append("Cookie", cookieStr)
      }
    }

    const queryOptions: RequestInit = {
      method,
      headers,
      // Only set credentials on the client
      credentials: options?.client ? "include" : undefined
    }
    if (options?.payload) queryOptions.body = JSON.stringify(options?.payload)

    const resolvedBase = options?.baseURL || getBaseURL()
    if (!resolvedBase) {
      // For whisper, don't throw; return a synthetic failure
      return { ok: false, status: 0 }
    }
    const base = String(resolvedBase).replace(/\/+$/, "")
    const p = pathAPI.startsWith("/") ? pathAPI : `/${pathAPI}`
    const url = new URL(base + p)
    if (options && options.query) {
      const query = options.query
      const params = new URLSearchParams()
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, item.toString()))
        } else {
          params.append(key, value.toString())
        }
      })
      url.search = params.toString()
    }

    const response = await getFetchImpl()(url.toString(), queryOptions)
    return { ok: response.ok, status: response.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
