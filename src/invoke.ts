import { FEError } from "derbis"
import { isResponseJson } from "./validator"
import { getBaseURL, getFetchImpl, getConjuraConfig } from "./config"
import type { Method, InvokeOptions, BEGenericResponse } from "./types"

/**
 * Low-level HTTP invocation for backend requests.
 * - Returns either `{ data: T }` or a backend `{ error }` envelope.
 * - Does not throw on backend error; callers decide how to handle it.
 */
export async function invoke<T>(
  pathAPI: string,
  method: Method,
  errCode: string,
  options?: InvokeOptions
): Promise<BEGenericResponse<T> | undefined> {
  const headers = new Headers()
  // Merge default headers from global config first
  const defaults = getConjuraConfig().defaultHeaders
  if (defaults) {
    for (const [k, v] of Object.entries(defaults)) headers.set(k, v)
  }
  headers.append("Accept", "application/json")
  headers.append("Content-Type", "application/json")
  if (options?.authKey)
    headers.append("Authorization", `Bearer ${options?.authKey}`)
  // SSR-only headers and cookie forwarding
  if (typeof window === "undefined") {
    headers.append("x-ssr", "true")
    if (
      options?.cookie &&
      typeof options.cookie === "object" &&
      Object.keys(options.cookie).length > 0
    ) {
      // Always format cookies as: foo=bar; baz=qux
      const cookieStr = Object.entries(options.cookie)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ")
      headers.append("Cookie", cookieStr)
    }
  }

  const queryOptions: RequestInit = {
    method,
    headers,
    credentials: "include"
  }

  if (options?.payload) queryOptions.body = JSON.stringify(options?.payload)

  const resolvedBase = options?.baseURL || getBaseURL()
  if (!resolvedBase) {
    throw new FEError(
      "BASE_URL_NOT_SET",
      "Base URL is not configured. Call configureCrane({ baseURL }) once, or set VITE_BE_CORE_URL/CRANE_BASE_URL env.",
      errCode
    )
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

  if (!isResponseJson(response)) {
    if (!response.ok) {
      // Check for important HTTP status codes before processing JSON
      // Try to parse error details from response body if possible
      let errorBody: { error?: { message?: string; details?: unknown } } = {}
      try {
        if (isResponseJson(response)) {
          errorBody = await response.json()
        }
      } catch {
        // ignore JSON parse errors here
      }

      throw new FEError(
        `HTTP_${response.status}`,
        errorBody?.error?.message || response.statusText || "HTTP error",
        errCode,
        errorBody?.error?.details as Record<string, string | number> | undefined
      )
    } else {
      throw new FEError("INVALID_JSON", "Invalid JSON response", errCode)
    }
  }

  const data = await response.json()

  if (data && typeof data === "object") {
    if ("data" in data) {
      return data
    } else if ("error" in data) {
      return data
    }
  } else {
    throw new FEError(
      "INVALID_STRUCTURE",
      "Invalid response structure",
      errCode
    )
  }
}
