/**
 * Check whether a fetch Response appears to be JSON via content-type header.
 */
export function isResponseJson(response: Response): boolean {
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) return true
  else return false
}
