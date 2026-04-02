# AGENTS.md - Project Guide

## Project Overview

Payload CMS 3.0 + Next.js 15 + Cloudflare. TypeScript-first headless CMS with D1 SQLite database.

## Build & Development Commands

```bash
# Development
pnpm dev              # Start dev server (no fast refresh)
pnpm devsafe          # Clean .next and start dev

# Production Build
pnpm build            # Build for production
pnpm start            # Start production server

# Payload Specific
pnpm generate:types   # Generate TypeScript types from schema
pnpm generate:importmap # Regenerate component import map
pnpm payload          # Payload CLI access
```

## Test Commands

```bash
# Run all tests
pnpm test             # Runs both int and e2e tests

# Integration tests (Vitest)
pnpm test:int                              # Run all integration tests
pnpm vitest run tests/int/api.int.spec.ts  # Run single test file
pnpm vitest run -t "fetches users"         # Run single test by name

# E2E tests (Playwright)
pnpm test:e2e                              # Run all E2E tests
pnpm playwright test tests/e2e/admin.e2e.spec.ts  # Run single file
pnpm playwright test -g "can navigate"       # Run tests matching pattern
```

## Lint & Type Check

```bash
pnpm lint             # ESLint (Next.js rules)
tsc --noEmit          # TypeScript check (no emit)
```

## Code Style Guidelines

### Formatting (Prettier)

- Single quotes, no semicolons
- Trailing commas everywhere
- 100 character line width
- 2-space indentation

### TypeScript

- Strict mode enabled, but `strictNullChecks: false`
- Target: ES2022, Module: ESNext
- Import aliases: `@/*` → `./src/*`, `@payload-config` → `./src/payload.config.ts`

### Imports

```typescript
// External imports first
import { buildConfig } from 'payload'
import type { CollectionConfig } from 'payload'

// Internal imports (absolute with @/)
import { Users } from '@/collections/Users'
import config from '@payload-config'
```

### Naming Conventions

- Collections: PascalCase singular (e.g., `Users`, `Media`, `Posts`)
- Fields: camelCase (e.g., `publishedAt`, `featuredImage`)
- Access functions: camelCase descriptive (e.g., `authenticated`, `adminOnly`)
- Hooks: camelCase with operation context (e.g., `beforeValidate`, `afterChange`)

### Error Handling

```typescript
// Use Payload's APIError for endpoints
import { APIError } from 'payload'
throw new APIError('Unauthorized', 401)

// Always check user in protected endpoints
if (!req.user) throw new APIError('Unauthorized', 401)
```

## CRITICAL Security Patterns

### 1. Local API Access Control (MOST IMPORTANT)

```typescript
// ❌ WRONG: Access control bypassed even with user!
await payload.find({ collection: 'posts', user: someUser })

// ✅ CORRECT: Enforces user permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // REQUIRED
})
```

### 2. Transaction Safety in Hooks

```typescript
// ❌ WRONG: Missing req breaks atomicity
await req.payload.create({ collection: 'logs', data: { docId: doc.id } })

// ✅ CORRECT: Pass req for transaction safety
await req.payload.create({ collection: 'logs', data: { docId: doc.id }, req })
```

### 3. Prevent Infinite Hook Loops

```typescript
// ✅ Use context flag
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Next.js frontend routes
│   └── (payload)/            # Payload admin + API routes
├── collections/              # Collection configs (Users.ts, Media.ts)
├── payload.config.ts         # Main Payload config
└── payload-types.ts          # Generated types (don't edit)

tests/
├── int/                      # Vitest integration tests (*.int.spec.ts)
├── e2e/                      # Playwright E2E tests (*.e2e.spec.ts)
└── helpers/                  # Test utilities (login.ts, seedUser.ts)
```

## Quick Reference

| Task            | Command                       |
| --------------- | ----------------------------- |
| Dev server      | `pnpm dev`                    |
| Type check      | `tsc --noEmit`                |
| Generate types  | `pnpm generate:types`         |
| Single int test | `pnpm vitest run <file>`      |
| Single e2e test | `pnpm playwright test <file>` |
| Lint            | `pnpm lint`                   |

## Cursor Rules

For detailed patterns, see `.cursor/rules/`:

- `security-critical.mdc` - Security patterns (CRITICAL)
- `collections.md` - Collection configs
- `access-control.md` - Permission patterns
- `hooks.md` - Lifecycle hooks
- `queries.md` - Local API usage
- `components.md` - Custom React components
