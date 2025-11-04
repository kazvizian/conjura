<div align="center">

# 🜏 Conjura

[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)<br />
![Conventional Commits](https://img.shields.io/badge/commit-conventional-blue.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

</div>

> *A gentle invocation layer for the web — type-safe, predictable, and effortlessly magical.*

Conjura is a tiny, elegant toolkit that turns backend requests into a consistent and intuitive experience.
Once configured, you can call APIs from anywhere — whether in the browser or SSR —
with clean responses, typed errors, and zero fuss setup.


## Why Conjura?

Conjura was designed to make network calls *feel like a spell you can trust* — minimal, declarative, and readable.

- **Configure once** — set your `baseURL` and forget it.
  No more scattering `import.meta.env` everywhere.
- **Predictable returns** — success gives `data`, failure gives rich typed errors.
- **Browser + SSR friendly** — cookies, headers, and credentials handled gracefully.
- **Tiny and strongly typed** — minimal footprint, maximal DX.


## Install

```sh
# Bun
bun add conjura

# npm
npm i conjura

# pnpm
pnpm add conjura
````


## 🚀 Quick Start

Invoke once, call from anywhere — the *ritual begins*.

```ts
import { configureConjura, summon } from "conjura"

configureConjura({ baseURL: "https://api.example.com" })

const users = await summon<{ users: User[] }>("/users", "GET", "users:list")
```

That’s it. `summon` will handle everything — fetch, parse, type, and error wrapping.


## Base URL Configuration

There are several ways to define where your magic flows from:

### 1. Code (recommended)

```ts
import { configureConjura } from "conjura"
configureConjura({ baseURL: "https://api.example.com" })
```

### 2. Global hint (before your bundle)

```html
<script>window.__CONJURA_BE_BASE_URL = "https://api.example.com"</script>
```

### 3. Environment variables

Conjura looks in order:

```
CONJURA_BASE_URL, API_BASE_URL,
VITE_BE_CORE_URL, VITE_BE_URL,
VITE_API_BASE_URL, VITE_BASE_URL
```

### 4. Per-call override

```ts
await summon("/users", "GET", "users:list", { baseURL: "https://alt.example.com" })
```


## Core API

Each function in Conjura represents a different *degree of invocation*:

| Function          | Essence        | Behavior                                                           |
| ----------------- | -------------- | ------------------------------------------------------------------ |
| `invoke<T>()`     | The base spell | Low-level call; returns `{ data }` or `{ error }`, never throws.   |
| `summon<T>()`     | The invocation | High-level call; returns `T` or throws a typed backend error.      |
| `summonJSON<T>()` | The mirror     | Fetches static `.json` from a full URL; handles JSON-only sources. |
| `whisper()`       | The echo       | Fire-and-forget — no throw, only `{ ok, status }`.                 |

All of them accept:
`query`, `payload`, `authKey`, and optional `baseURL` overrides.


## Real-world Examples

### Auth header + array query

```ts
import { invoke } from "conjura"

const res = await invoke<{ users: User[] }>("/users", "GET", "users:list", {
  authKey: token,
  query: { page: 1, role: ["admin", "editor"], active: true }
})
// res -> { data: ... } or { error: ... }
```

### POST with JSON body

```ts
import { summon } from "conjura"

const created = await summon<{ id: string }>("/posts", "POST", "posts:create", {
  payload: { title: "Hello", body: "World" }
})
```

### Static JSON (CDN or data files)

```ts
import { summonJSON } from "conjura"

const settings = await summonJSON<Settings>(
  "https://static.example.com/config/app"
)
```

### Fire-and-forget telemetry

```ts
import { whisper } from "conjura"

const { ok, status } = await whisper("/events", "POST", {
  client: true,
  payload: { type: "page_view" }
})
```


## SSR Behavior

On the server side, Conjura adapts automatically:

* Adds header `x-ssr: true`.
* Forwards cookies as `k=v; ...` if provided.
* Allows custom fetch for SSR, adapters, or tests.

```ts
import { configureConjura } from "conjura"
configureConjura({ fetchImpl: mySSRFetch })
```

`whisper` uses `credentials: "include"` only when `client: true` is passed.


## Error Handling

Errors in Conjura are rich, typed, and readable — not mysterious.

* `summon` throws when backend returns `{ error }`.
* `invoke` gives `{ error }` directly.
* `handleSummonError` can normalize or rethrow as needed.

Error types come from `derbis`:

* `BEError` — a single backend error
* `BEMultiError` — a list of errors (array form)

```ts
import { summon, handleSummonError } from "conjura"

try {
  const data = await summon<Res>("/resource", "GET", "resource:get")
} catch (err) {
  // Typed: BEError | BEMultiError
  console.error(err)
}
```


## TypeScript Power

Conjura exports helpful types for clarity and autocompletion:

`Method`, `QueryParams`, `CookieMap`,
`InvokeOptions`, `SummonOptions`, `WhisperOptions`,
`BEDataResponse`, `BEGenericResponse`.


## Testing

Conjura ships with a Bun-powered test suite.

```sh
bun test
```


## Compatibility

Node 18+ includes a global `fetch`.
For older runtimes, pass your own via `configureConjura({ fetchImpl })`.


## License

MIT © KazViz
