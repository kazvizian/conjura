import { BEError, BEErrorRespone, BEMultiError } from "derbis"

/**
 * Convert a backend error envelope into a typed exception.
 * - If the backend returned multiple errors, throws a {@link BEMultiError}.
 * - Otherwise throws a single {@link BEError}.
 */
export function handleSummonError(response: BEErrorRespone) {
  if (Array.isArray(response.error)) {
    throw new BEMultiError(response.error)
  } else {
    throw new BEError(
      response.error.code,
      response.error.message,
      response.error.status,
      response.error.source,
      response.error.details
    )
  }
}
