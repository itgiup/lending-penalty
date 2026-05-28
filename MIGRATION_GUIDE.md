# 🔄 Migration Guide - TOML to JSONC

## Changes Made

### 1. **wrangler.toml → wrangler.jsonc** ✅

**Why?**
- JSONC supports comments and is more flexible
- Better IDE support with autocomplete
- Easier to parse programmatically

**Migration:**
```bash
# Old (TOML)
wrangler.toml

# New (JSONC)
wrangler.jsonc
```

### 2. **Zod Validation Updates** ✅

**Fixed deprecated API:**
```typescript
// ❌ Old (deprecated)
z.string().email()

// ✅ New (with custom error message)
z.string().email('Invalid email format')
```

**Benefits:**
- Better error messages for users
- No deprecation warnings
- More explicit validation rules

---

## Setup Instructions

### Install Dependencies

```bash
cd worker
npm install
```

This will install:
- `hono` - Web framework
- `@hono/zod-validator` - Request validation
- `zod` - Schema validation
- `bcryptjs` - Password hashing (future)
- `jose` - JWT tokens (future)
- `wrangler` - Cloudflare CLI

### Create Database

```bash
# Create D1 database
wrangler d1 create lending_penalty_db

# Copy the database_id from output
# Update wrangler.jsonc with your database_id
```

### Run Migrations

```bash
npm run db:migrate
```

### Start Development

```bash
npm run dev
```

---

## Available Scripts

```bash
npm run dev          # Start local dev server
npm run deploy       # Deploy to Cloudflare
npm run db:migrate   # Run database migrations
npm run db:shell     # Open D1 database shell
```

---

## Files Changed

| File | Change |
|------|--------|
| `worker/wrangler.jsonc` | ✨ Created (replaces wrangler.toml) |
| `worker/src/index.ts` | ✅ Updated Zod schemas with error messages |
| `worker/package.json` | ✅ Added db:shell script |
| `worker/DATABASE_SETUP.md` | ✅ Updated references to wrangler.jsonc |
| `setup-database.sh` | ✅ Updated references to wrangler.jsonc |

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create database: `wrangler d1 create lending_penalty_db`
3. ✅ Update `wrangler.jsonc` with your database_id
4. ✅ Run migrations: `npm run db:migrate`
5. ✅ Start dev server: `npm run dev`
6. ✅ Test APIs with curl or Postman

---

**Status**: Migration Complete ✅  
**Version**: 2.0.0