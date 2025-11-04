/**
 * Global configuration for the fetcher utilities.
 *
 * Configure this once at app startup via {@link configureCrane} or {@link setBaseURL}.
 * Consumers can also rely on environment variables or a global hint
 * `window.__CRANE_BE_BASE_URL` as a fallback.
 */
export type ConjuraConfig = {
  /** Base URL for backend API requests, e.g. https://api.example.com */
  baseURL?: string
  /** Default headers to apply to every request (merged, user overrides last) */
  defaultHeaders?: Record<string, string>
  /** Optional custom fetch implementation (SSR, tests) */
  fetchImpl?: typeof fetch
}

type GlobalWithConjura = typeof globalThis & {
  __CONJURA_CONFIG__?: ConjuraConfig
}

function getGlobal(): GlobalWithConjura {
  return globalThis as GlobalWithConjura
}

function storage(): ConjuraConfig {
  const g = getGlobal()
  if (!g.__CONJURA_CONFIG__) g.__CONJURA_CONFIG__ = {}
  return g.__CONJURA_CONFIG__!
}

/**
 * Merge and set global configuration.
 * Repeated calls will shallow-merge with the previous configuration.
 */
export function configureConjura(cfg: Partial<ConjuraConfig>) {
  Object.assign(storage(), cfg)
}

export function setBaseURL(baseURL: string) {
  storage().baseURL = baseURL
}

export function getConjuraConfig(): Readonly<ConjuraConfig> {
  return storage()
}

/**
 * Resolve a base URL from (in order):
 * 1) explicitly configured config.baseURL
 * 2) runtime globals like window.__CRANE_BE_BASE_URL
 * 3) env-style values (import.meta.env.*, process.env.*)
 */
/**
 * Resolve the base URL to be used for requests.
 *
 * Priority order:
 * 1) Explicitly configured via {@link configureCrane} or {@link setBaseURL}
 * 2) Runtime global hint `window.__CRANE_BE_BASE_URL`
 * 3) Node.js environment variables (CRANE_BASE_URL, API_BASE_URL, etc.)
 * 4) Vite `import.meta.env` variables (VITE_BE_CORE_URL, etc.)
 */
export function getBaseURL(): string | undefined {
  const cfg = storage()
  if (cfg.baseURL) return cfg.baseURL

  // 2) window/global hints
  const hinted = (globalThis as any).__CONJURA_BE_BASE_URL as string | undefined
  if (typeof hinted === "string" && hinted.length > 0) return hinted

  // 3) Prefer Node envs first (avoids CJS import.meta warnings in practice)
  const penv = (globalThis as any).process?.env as
    | Record<string, string | undefined>
    | undefined
  if (penv) {
    const v =
      penv.VITE_BE_CORE_URL ||
      penv.CONJURA_BASE_URL ||
      penv.BE_CORE_URL ||
      penv.API_BASE_URL
    if (v) return v
  }

  // 4) Vite envs (guarded)
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
      const env = (import.meta as any).env as Record<string, string | undefined>
      const v =
        env.VITE_BE_CORE_URL ||
        env.VITE_BE_URL ||
        env.VITE_API_BASE_URL ||
        env.VITE_BASE_URL
      if (v) return v
    }
  } catch {
    // ignore
  }

  return undefined
}

/**
 * Get the fetch implementation (configured or global).
 */
export function getFetchImpl(): typeof fetch {
  return storage().fetchImpl || globalThis.fetch.bind(globalThis)
}

/**
 * Testing helper: reset all configuration.
 * Not intended for production use.
 */
export function resetConjuraConfig() {
  const g = getGlobal()
  g.__CONJURA_CONFIG__ = {}
}
