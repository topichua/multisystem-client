# Multi-sale

React, TypeScript, Vite application.

## Setup

Install dependencies:

```sh
npm install
```

Create local environment variables:

```sh
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to the backend API base URL.

## Scripts

```sh
npm run dev
npm run lint
npm run typecheck
npm run build
npm run format
```

## Architecture

The project uses a small layered structure:

- `src/app` contains application composition and routing.
- `src/pages` contains route-level screens.
- `src/features` contains domain features, their model, API, and UI.
- `src/shared` contains feature-agnostic infrastructure and reusable UI.

Dependency direction should stay one-way:

```txt
app -> pages -> features -> shared
```

`shared` must not import from `features`, `pages`, or `app`.

## Imports

Use the root alias for cross-layer imports:

```ts
import { useAuth } from "@/features/auth/model/useAuth";
```

Use relative imports only for colocated files:

```ts
import * as S from "./login-page.styled";
```

Avoid `../../` imports between top-level layers.
