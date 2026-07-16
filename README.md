# Evolo CLI

> Deploy web projects to the Evolo cloud platform from your terminal.

## Installation

```bash
npm install -g evolo
```

## Usage

```
evolo <command> [options]

Commands:
  evolo login                        Login to your Evolo account (device flow)
  evolo logout                       Log out and clear saved session
  evolo status                       Check your account login status
  evolo init                         Initialize a project for deployment
  evolo deploy                       Build and deploy the project to the cloud
  evolo list                         List all projects associated with your account
  evolo logs <projectId>             Show deployment logs for a project
  evolo env set <key> <value>        Set an environment variable
  evolo env get [key]                List env vars (or a specific one)
  evolo env delete <key>             Delete an environment variable

Options:
  --quiet    Suppress all output except errors
  --verbose  Enable verbose/debug output
  -v, --version  Show version number
  -h, --help     Show help
```

## Quick Start

```bash
# 1. Authenticate
evolo login

# 2. Navigate to your project and initialize
cd my-project
evolo init

# 3. Deploy
evolo deploy
```

## Configuration

Evolo reads the following environment variables:

| Variable          | Default                          | Description                   |
|-------------------|----------------------------------|-------------------------------|
| `EVOLO_API_URL`   | `https://api.evolo.dev`          | API server base URL           |
| `EVOLO_AUTH_URL`  | `https://cloudisy.vercel.app`    | Auth server base URL          |
| `EVOLO_CLIENT_ID` | `demo-cli`                       | OAuth device-flow client ID   |

See `.env.example` for a template.

## Supported Frameworks

| Category  | Frameworks                                    |
|-----------|-----------------------------------------------|
| Frontend  | React, Vue, Angular, Svelte                   |
| Backend   | Express, Hono, Fastify, NestJS, Koa           |
| Fullstack | Next.js, Nuxt, SvelteKit                      |
| Other     | Vite, Python projects                         |

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions.

## License

ISC
