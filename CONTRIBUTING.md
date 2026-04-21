# Contributing to Evolo CLI

Thank you for considering contributing to Evolo!

## Prerequisites

- Node.js >= 18
- npm >= 9 (or pnpm)

## Setup

```bash
# Clone the repository
git clone https://github.com/Mahadi-rsio/evolo.git
cd evolo

# Install dependencies
npm install

# Copy env template and configure
cp .env.example .env
```

## Development

```bash
# Watch mode – recompiles on every save
npm run dev

# One-shot build
npm run build

# Run the CLI locally
node dist/index.js <command>
```

## Environment Variables

Copy `.env.example` to `.env` and adjust the values for your local setup:

```bash
EVOLO_API_URL=http://localhost:3000      # point at your local API
EVOLO_AUTH_URL=http://localhost:3001     # point at your local auth server
```

## Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

Tests live in `src/__tests__/`. Please add tests for any new utilities or commands.

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

## Adding a New Command

1. Create `src/commands/<your-command>.ts`
2. Export a `CommandModule` constant from the file
3. Import it in `src/commands/index.ts` and add it to the `commands` array
4. Add tests in `src/__tests__/`

## Pull Request Guidelines

- Keep PRs focused on a single change
- Ensure all CI checks pass (`typecheck`, `lint`, `test`)
- Update `README.md` if you add or change commands or env vars
