# 🏗️ Lending Penalty - Monorepo Setup

## 📁 Project Structure

```
lending-penalty/
├── apps/
│   ├── web/              # Frontend React app with Vite
│   │   ├── src/
│   │   │   ├── api/      # Hono RPC client
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── pages/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── api/              # Backend Hono API on Cloudflare Workers
│       ├── src/
│       │   └── index.ts  # Hono routes with type exports
│       ├── schema.sql
│       └── package.json
│
├── packages/
│   └── shared/           # Shared types, schemas, constants
│       ├── src/
│       │   ├── types.ts      # TypeScript interfaces
│       │   ├── schemas.ts    # Zod validation schemas
│       │   ├── constants.ts  # App constants
│       │   └── index.ts      # Main export
│       └── package.json
│
├── pnpm-workspace.yaml   # pnpm workspace config
├── turbo.json            # Turborepo config
├── package.json          # Root package.json
└── .npmrc                # pnpm configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 11.0.0

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install all dependencies
pnpm install

# Build shared package first
cd packages/shared && pnpm build
```

### Development

```bash
# Option 1: Run both frontend and backend with Turbo
pnpm dev

# Option 2: Run individually
# Terminal 1 - Backend API
cd apps/api && pnpm dev

# Terminal 2 - Frontend Web
cd apps/web && pnpm dev
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web && pnpm build
cd apps/api && pnpm deploy
```

## 🔧 Key Features

### 1. **Hono RPC (Type-Safe API Calls)**

Frontend uses Hono's `hc` client for type-safe API calls:

```typescript
import { apiClient } from '@/api/client';

// Full TypeScript autocomplete and type checking!
const response = await apiClient.api.loans.$get();
const loans = await response.json(); // Typed as Loan[]
```

### 2. **Shared Package**

Types, schemas, and constants are shared between frontend and backend:

```typescript
// Both apps import from same source
import { createLoanSchema, type Loan } from '@lending-penalty/shared';

// Frontend: Form validation
const isValid = createLoanSchema.safeParse(formData);

// Backend: Request validation
app.post('/api/loans', zValidator('json', createLoanSchema), handler);
```

### 3. **Turborepo**

Fast builds and caching with Turborepo:
- Parallel task execution
- Remote caching (optional)
- Smart dependency graph

## 📦 Package Manager

This project uses **pnpm** for:
- ⚡ Faster installs (2-3x than npm)
- 💾 Less disk space (shared store)
- 🔒 Strict dependency resolution
- 🎯 Monorepo support

## 🛠️ Available Scripts

### Root Level
```bash
pnpm dev        # Run all apps in dev mode
pnpm build      # Build all apps
pnpm lint       # Lint all apps
pnpm clean      # Clean all node_modules
```

### Web App (`apps/web`)
```bash
pnpm dev        # Start Vite dev server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm lint       # Run ESLint
```

### API (`apps/api`)
```bash
pnpm dev        # Start Wrangler dev server
pnpm deploy     # Deploy to Cloudflare Workers
pnpm db:migrate # Run database migrations
pnpm db:shell   # Open D1 database shell
```

### Shared Package (`packages/shared`)
```bash
pnpm build      # Build TypeScript to JS
pnpm dev        # Watch mode for development
```

## 🔄 Migration from Old Structure

If you're migrating from the old single-folder structure:

1. **Old code is still in root** (src/, worker/)
2. **New code is in apps/** (apps/web/src, apps/api/)
3. After testing, you can safely delete old folders:
   ```bash
   rm -rf src/ worker/
   ```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@lending-penalty/shared'"
```bash
# Rebuild shared package
cd packages/shared && pnpm build

# Reinstall dependencies
pnpm install
```

### Issue: Type errors in Hono RPC client
```bash
# Make sure API types are exported correctly
# Check apps/api/src/index.ts has: export type AppType = typeof app;
```

### Issue: pnpm not found
```bash
npm install -g pnpm
```

## 📚 Learn More

- [Hono RPC Documentation](https://hono.dev/docs/guides/rpc)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/repo)
- [Zod Validation](https://zod.dev/)

## 📝 License

MIT