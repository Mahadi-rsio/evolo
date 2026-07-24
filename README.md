# Evolo CLI

CLI tool to deploy web projects to the Evolo cloud platform.

## Requirements

- Node.js 18 or later
- npm (or a compatible package manager)

## Installation

```bash
npm install -g evolo
```

Or from this repository:

```bash
npm install
npm run build
npm link
```

## Quick start

```bash
evolo login
cd my-project
evolo init
evolo deploy
```

## Commands

| Command | Description |
|---------|-------------|
| `evolo login` | Authenticate with your Evolo account (device flow) |
| `evolo logout` | Clear the saved session |
| `evolo status` | Show the current login status |
| `evolo init` | Create a new project or link an existing one (`evolo.json`) |
| `evolo deploy` | Deploy existing build output (uploads originals; server optimizes at commit) |
| `evolo pages` | List projects on your account |

### Global options

| Option | Description |
|--------|-------------|
| `--quiet` | Suppress all output except errors |
| `--verbose` | Enable verbose / debug output |
| `-v, --version` | Print version |
| `-h, --help` | Show help |

## How it works

1. **Login** — Device-flow auth; the session token is stored in `~/evolo.session.json`.
2. **Init** — Detects the framework, then either creates a project via the API or links an existing one. Writes `evolo.json` in the project root (and adds it to `.gitignore` when creating a new project).
3. **Deploy** — Requires login, finds an existing build folder (`dist`, `build`, `.next`, or `out`), validates the manifest locally (≤100 files, ≤50 MB/file, ≤250 MB total), then **prepare → presign → PUT originals → commit**. Does **not** run a local build — build the app yourself first. The CLI uploads original files only; Brotli/Gzip and WebP run on the server at commit.

## Configuration

Override defaults with environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `EVOLO_API_URL` | `http://localhost:3000` | Evolo API base URL |
| `EVOLO_AUTH_URL` | `https://auth.cloudisy.com` | Auth server base URL |
| `EVOLO_CLIENT_ID` | `evolo` | OAuth device-flow client ID |

## Supported frameworks

| Category | Frameworks |
|----------|------------|
| Frontend | React, Vue, Angular, Svelte |
| Backend | Express, Hono, Fastify, NestJS, Koa |
| Fullstack | Next.js, Nuxt, SvelteKit |
| Other | Vite, Python (`requirements.txt` / `pyproject.toml`) |

## Development

```bash
npm install
npm run build        # compile TypeScript to dist/
npm run dev          # watch mode
npm run typecheck    # typecheck without emit
npm run lint         # ESLint on src/
npm test             # Vitest
```

Entry point: `src/index.ts`. Commands live under `src/commands/` and are registered in `src/commands/index.ts`.

## License

ISC
