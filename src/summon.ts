import { FEError } from "derbis"
import { invoke } from "./invoke"
import { handleSummonError } from "./exception"
import type { Method, SummonOptions } from "./types"

/**
 * High-level helper for backend requests that returns the `data` field
 * or throws a rich error when the backend responds with an error envelope.
 */
export async function summon<T>(
  pathAPI: string,
  method: Method,
  errCode: string,
  options?: SummonOptions
): Promise<T | undefined> {
  const response = await invoke<T>(pathAPI, method, errCode, { ...options })

  if (!response)
    throw new FEError("RES_NONE", "No response from backend", errCode)

  if ("data" in response) {
    return response.data
  } else if ("error" in response) {
    handleSummonError(response)
  } else {
    throw new FEError(
      "INVALID_STRUCTURE",
      "Invalid response structure",
      errCode
    )
  }
}
