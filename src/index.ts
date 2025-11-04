/** Low-level HTTP invocation returning `{ data }` or `{ error }`. */
export { invoke } from "./invoke"
/** Fetch a static JSON document from a full URL (auto `.json`). */
export { summonJSON } from "./summon-json"
/** High-level helper returning data or throwing on BE error. */
export { summon } from "./summon"
/** Fire-and-forget HTTP call returning only `{ ok, status }`. */
export { whisper } from "./whisper"
export {
  configureConjura,
  setBaseURL,
  getBaseURL,
  getConjuraConfig,
  type ConjuraConfig
} from "./config"
/** Re-throws BE error envelopes as typed errors. */
export { handleSummonError } from "./exception"
export type {
  Method,
  QueryParams,
  CookieMap,
  InvokeOptions,
  SummonOptions,
  WhisperOptions,
  BEDataResponse,
  BEGenericResponse
} from "./types"
