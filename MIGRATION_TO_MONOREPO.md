# 🔄 Migration Guide - Old Structure to Monorepo

## 📋 Overview

This guide helps you migrate from the old single-folder structure to the new pnpm monorepo with Hono RPC.

---

## 🏗️ Old vs New Structure

### **Before (Old)**
```
lending-penalty/
├── src/                    # All frontend code
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── ...
├── worker/                 # Backend code
│   ├── src/index.ts
│   └── ...
├── package.json            # Single package.json
└── ...
```

### **After (New)**
```
lending-penalty/
├── apps/
│   ├── web/                # Frontend (moved from src/)
│   │   └── src/
│   └── api/                # Backend (moved from worker/)
│       └── src/
├── packages/
│   └── shared/             # NEW: Shared types & schemas
├── pnpm-workspace.yaml     # NEW: Workspace config
├── turbo.json              # NEW: Turborepo config
└── package.json            # Root package.json
```

---

## ✅ Migration Checklist

### **Phase 1: Setup (Completed)**
- [x] Created pnpm workspace structure
- [x] Moved frontend code to `apps/web`
- [x] Moved backend code to `apps/api`
- [x] Created shared package with types/schemas
- [x] Installed dependencies with pnpm
- [x] Built shared package

### **Phase 2: Testing (TODO)**
- [ ] Test frontend dev server
- [ ] Test backend API server
- [ ] Verify Hono RPC client works
- [ ] Test database migrations
- [ ] Check all features work correctly

### **Phase 3: Cleanup (TODO)**
- [ ] Delete old `src/` folder
- [ ] Delete old `worker/` folder
- [ ] Remove old root dependencies
- [ ] Update CI/CD pipelines
- [ ] Update deployment scripts

---

## 🧪 Testing Steps

### **1. Test Shared Package**

```bash
cd /home/u/Documents/lending-penalty/packages/shared
pnpm build

# Should generate dist/ folder with:
# - index.js
# - index.mjs
# - index.d.ts
# - types.js/mjs/d.ts
# - schemas.js/mjs/d.ts
# - constants.js/mjs/d.ts
```

### **2. Test Backend API**

```bash
cd /home/u/Documents/lending-penalty/apps/api

# Start dev server
pnpm dev

# Should start on http://localhost:8787

# Test health endpoint
curl http://localhost:8787/health

# Test API endpoints (after creating test data)
curl http://localhost:8787/api/loans
```

### **3. Test Frontend Web**

```bash
cd /home/u/Documents/lending-penalty/apps/web

# Start dev server
pnpm dev

# Should start on http://localhost:5173

# Open browser and test:
# - Login/Register pages
# - Dashboard with loan list
# - Create/Edit/Delete loans
# - Payment recording
# - Charts and analytics
# - Excel export
```

### **4. Test Hono RPC Client**

Open browser console at http://localhost:5173 and verify:

```javascript
// Check if RPC client is working
import { apiClient } from './api/client';

// Should have full TypeScript support
const response = await apiClient.api.loans.$get();
console.log(await response.json());
```

### **5. Test Type Safety**

In VSCode, open any file in `apps/web/src`:

```typescript
import { loansAPI } from '@/api/client';

// Should show autocomplete for:
// - loansAPI.getAll()
// - loansAPI.getById()
// - loansAPI.create()
// - etc.

// Hover over function calls should show types
```

---

## 🐛 Troubleshooting

### **Issue 1: "Cannot find module '@lending-penalty/shared'"**

**Solution:**
```bash
# Rebuild shared package
cd packages/shared
pnpm build

# Reinstall dependencies
cd ../..
pnpm install
```

### **Issue 2: Type errors in Hono RPC client**

**Solution:**
```bash
# Make sure API exports AppType
# Check apps/api/src/index.ts has:
export type AppType = typeof app;

# Restart TypeScript server in VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### **Issue 3: Port already in use**

**Solution:**
```bash
# Kill processes on ports
lsof -ti:5173 | xargs kill  # Frontend
lsof -ti:8787 | xargs kill  # Backend

# Or use different ports
pnpm dev -- --port 3000
```

### **Issue 4: Database not found**

**Solution:**
```bash
cd apps/api

# Create D1 database
wrangler d1 create lending_penalty_db

# Update wrangler.jsonc with new database_id

# Run migrations
pnpm db:migrate
```

---

## 🗑️ Cleanup Old Files (After Testing)

Once everything works correctly:

```bash
cd /home/u/Documents/lending-penalty

# Remove old frontend code
rm -rf src/

# Remove old backend code
rm -rf worker/

# Remove old root dependencies
rm -rf node_modules/
rm -f package-lock.json

# Keep these files:
# - apps/
# - packages/
# - pnpm-workspace.yaml
# - turbo.json
# - .npmrc
# - package.json (root)
# - pnpm-lock.yaml
```

---

## 🚀 Next Steps After Migration

### **1. Update CI/CD**

Update your CI/CD pipeline to use pnpm:

```yaml
# Example GitHub Actions
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 11
      - run: pnpm install
      - run: pnpm build
```

### **2. Update Deployment Scripts**

For Cloudflare Workers:
```bash
cd apps/api
pnpm deploy
```

For Frontend hosting (Vercel/Netlify):
```bash
cd apps/web
pnpm build
# Deploy dist/ folder
```

### **3. Add More Apps (Optional)**

You can now easily add more apps:

```bash
# Add mobile app
mkdir -p apps/mobile

# Add admin panel
mkdir -p apps/admin

# Add another shared package
mkdir -p packages/ui
```

---

## 📊 Benefits After Migration

| Feature | Before | After |
|---------|--------|-------|
| **Install Time** | ~30s | ~10s ⚡ |
| **Disk Space** | ~500MB | ~150MB 💾 |
| **Type Safety** | ❌ Manual | ✅ Auto-generated |
| **Schema Sharing** | ❌ Duplicate | ✅ Single source |
| **Monorepo Ready** | ❌ No | ✅ Yes |
| **Scalability** | ⚠️ Limited | ✅ Easy to add apps |

---

## 🎉 Success Criteria

Migration is successful when:

✅ Both dev servers start without errors  
✅ All existing features work correctly  
✅ TypeScript shows no errors  
✅ Hono RPC client has full autocomplete  
✅ Database operations work  
✅ Build commands succeed  
✅ Tests pass (if you have tests)  

---

## 📞 Need Help?

If you encounter issues:

1. Check error messages carefully
2. Verify all dependencies are installed: `pnpm install`
3. Rebuild shared package: `cd packages/shared && pnpm build`
4. Clear caches: `pnpm clean` then `pnpm install`
5. Check MONOREPO_README.md for detailed documentation

---

**Good luck with your migration! 🚀**