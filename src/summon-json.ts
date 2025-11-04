import { FEError } from "derbis"

/**
 * Utility function to fetch static JSON .
 *
 * Path must begin with complete URL including domain.
 * `.json` extension is not required.
 * - Correct: `https://example.com/data/file`.
 * - Wrong: `https://example.com/data/file.json`
 * - Wrong: `/data/file`
 */
export async function summonJSON<T = unknown>(
  path: string,
  errCode = "summonJSON"
): Promise<T> {
  const url = new URL(`${path}.json`)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  })

  if (!response.ok) {
    throw new FEError(
      "FETCH_JSON_FAILED",
      `Failed to fetch JSON: ${url} (${response.status} ${response.statusText})`,
      errCode
    )
  }

  try {
    return await response.json()
  } catch {
    throw new FEError("JSON_INVALID", `Invalid JSON in ${url}`, errCode)
  }
}
