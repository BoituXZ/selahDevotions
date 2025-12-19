Default to using Bun instead of Node.js.

-   Use `bun <file>` instead of `node <file>` or `ts-node <file>`
-   Use `bun test` instead of `jest` or `vitest`
-   Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
-   Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
-   Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
-   Use `bunx <package> <command>` instead of `npx <package> <command>`
-   Bun automatically loads .env, so don't use dotenv.

## APIs

-   `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
-   `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
-   `Bun.redis` for Redis. Don't use `ioredis`.
-   `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
-   `WebSocket` is built-in. Don't use `ws`.
-   Prefer `Bun.file` over `node:fs`'s readFile/writeFile
-   Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

# Project Selah - Architecture & Implementation Guide

## 1. Project Overview

"Selah" is a spiritual companion application designed to help users process their thoughts through a Biblical lens. It provides AI-generated responses that are pastoral, scripture-rich (NIV/ESV), and comforting.

## 2. Tech Stack

-   **Runtime:** Bun (v1.x)
-   **Backend Framework:** Hono (v4.x)
-   **Language:** TypeScript
-   **AI Infrastructure:** Google Cloud Vertex AI
    -   **Model:** `gemini-3-flash-preview` (Dec 2025 release)
    -   **Location:** `global` endpoint
    -   **Auth:** Google Cloud IAM Service Account (JSON Key)
-   **Database/Auth:** Supabase (PostgreSQL + Auth)
-   **Validation:** Zod + @hono/zod-validator

## 3. Architecture Details

### Backend Structure (`backend/`)

-   **Entry Point:** `src/index.ts` - Hono app initialization.
-   **Routes:** `src/routes/chat.ts` - Handles AI inference.
-   **Security:**
    -   Strict Zod validation on inputs.
    -   IAM Service Account used for Vertex AI (Least Privilege: `Vertex AI User` role).
    -   Environment variables for Project ID and Credentials.

### Critical Configurations

-   **Google Cloud Project:** `selah-prod` (Production Tier)
-   **Vertex Region:** `global` (Required for Gemini 3 Preview)
-   **Service Account:** `backend-user@selah-prod...`

## 4. Operational Requirements

-   **Rate Limiting:** Strict "fair usage" limits required to manage Vertex AI quotas.
-   **Error Handling:** Custom messages for quota exhaustion ("We have run out of fish and bread").
-   **Deployment:** Designed for containerized deployment (Docker/Cloud Run) or VPS.

## 5. Development Commands

-   `bun run dev` - Starts local Hono server.
-   `bun run src/check-models.ts` - Utility to verify Vertex AI connectivity.
