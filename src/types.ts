import type { BEErrorRespone } from "derbis"

/** HTTP methods supported by the helpers. */
export type Method = "GET" | "POST" | "PATCH" | "DELETE"
/** Query string parameter bag; arrays are encoded as repeated keys. */
export type QueryParams = Record<string, string | string[] | number | boolean>
/** Cookie bag used when forwarding cookies in SSR. */
export type CookieMap = Record<string, string | null | undefined>

/** Backend success envelope used by invoke. */
export type BEDataResponse<T> = { data: T }
/** Backend generic envelope: either success `{ data }` or error `{ error }`. */
export type BEGenericResponse<T> = BEDataResponse<T> | BEErrorRespone

/** Options for low-level {@link invoke} calls. */
export type InvokeOptions = {
  authKey?: string
  cookie?: CookieMap | null
  payload?: unknown
  query?: QueryParams
  baseURL?: string
}

/** Options for high-level {@link summon} calls. */
export type SummonOptions = Omit<InvokeOptions, "baseURL"> & {
  baseURL?: string
}

/** Options for {@link whisper} calls. */
export type WhisperOptions = {
  authKey?: string
  cookie?: CookieMap
  client?: boolean
  payload?: unknown
  query?: QueryParams
  baseURL?: string
}
