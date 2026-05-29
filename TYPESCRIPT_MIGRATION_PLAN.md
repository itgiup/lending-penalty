# 🎯 TypeScript Migration Plan - Frontend

##  **Hiện Trạng:**

### ✅ **Đã Là TypeScript:**
- Backend API: `apps/api/src/index.ts`
- Shared package: `packages/shared/src/*.ts`
- API client: `apps/web/src/api/client.ts`
- Google OAuth hook: `apps/web/src/hooks/useGoogleOAuth.tsx` ← Vừa convert!

### ❌ **Cần Convert Sang TypeScript:**
- Context: `apps/web/src/context/AuthContext.jsx` → `.tsx`
- Pages: `apps/web/src/pages/*.jsx` → `.tsx`
- Components: `apps/web/src/components/*.jsx` → `.tsx`
- Utils: `apps/web/src/utils/*.js` → `.ts`
- Config: `apps/web/vite.config.js` → `.ts`

---

## 🔧 **Lợi Ích Của TypeScript:**

1. ✅ **Type Safety** - Catch errors at compile time, not runtime
2. ✅ **Better IDE Support** - Autocomplete, IntelliSense, refactoring
3. ✅ **Self-documenting** - Types serve as documentation
4. ✅ **Easier Maintenance** - Clear contracts between modules
5. ✅ **Industry Standard** - Modern React projects use TS by default
6. ✅ **Hono RPC Integration** - Full type safety với backend

---

## 📋 **Kế Hoạch Convert:**

### **Phase 1: Core Files (Priority High)** ⭐
1. ✅ `hooks/useGoogleOAuth.tsx` - DONE!
2. ⏳ `context/AuthContext.tsx` - User types, auth functions
3. ⏳ `api/client.ts` - Already TS ✓

### **Phase 2: Pages (Priority High)** 
4. ⏳ `pages/Login.tsx`
5.  `pages/Register.tsx`
6.  `pages/Dashboard.tsx`

### **Phase 3: Components (Priority Medium)**
7. ⏳ `components/LoanList.tsx`
8. ⏳ `components/LoanForm.tsx`
9. ⏳ `components/PaymentForm.tsx`
10. ⏳ `components/LoanDetail.tsx`
11. ⏳ `components/DashboardStats.tsx`
12. ⏳ `components/DebtChart.tsx`
13. ⏳ `components/SearchFilter.tsx`
14. ⏳ `components/ProtectedRoute.tsx`
15. ⏳ `components/LoanCalculator.tsx`
16. ⏳ `components/ResultsDisplay.tsx`

### **Phase 4: Utils & Config (Priority Low)**
17. ⏳ `utils/calculations.ts`
18. ⏳ `utils/export.ts`
19. ⏳ `vite.config.ts`

---

## 🎯 **Type Definitions Needed:**

### **From Shared Package:**
```typescript
import { User, Loan, Payment } from '@lending-penalty/shared';
```

### **Local Types:**
```typescript
// Auth types
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (email: string, password: string, name: string, phone?: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Component props
interface LoanListProps {
  loans: Loan[];
  onSelect: (loan: Loan) => void;
}

interface LoanFormProps {
  onSubmit: (data: CreateLoanRequest) => void;
  initialData?: Loan;
}
```

---

## 🚀 **Cách Convert Từng File:**

### **Step 1: Rename File**
```bash
mv Login.jsx Login.tsx
```

### **Step 2: Add Type Imports**
```typescript
import { FC, useState, useEffect } from 'react';
import { User, Loan } from '@lending-penalty/shared';
```

### **Step 3: Type Props**
```typescript
interface LoginProps {
  // Define props here
}

const Login: FC<LoginProps> = ({ ... }) => {
  // Component logic
};
```

### **Step 4: Type State**
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
```

### **Step 5: Type Functions**
```typescript
const handleLogin = async (email: string, password: string): Promise<void> => {
  // Function logic
};
```

### **Step 6: Fix Errors**
Run `pnpm dev` and fix any TypeScript errors that appear.

---

## 📊 **Estimated Effort:**

| Phase | Files | Time Estimate | Difficulty |
|-------|-------|---------------|------------|
| Phase 1 | 2 files | 30 mins | Easy |
| Phase 2 | 3 files | 1 hour | Medium |
| Phase 3 | 10 files | 2-3 hours | Medium-Hard |
| Phase 4 | 3 files | 30 mins | Easy |
| **Total** | **18 files** | **~4-5 hours** | **Medium** |

---

## ️ **Challenges:**

### **1. Ant Design Types**
Some Ant Design components need explicit typing:
```typescript
import { FormInstance } from 'antd/es/form';

const [form] = Form.useForm<FormInstance>();
```

### **2. Framer Motion**
Motion components are already typed, but custom animations may need types.

### **3. React Router**
Use types from `react-router-dom`:
```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import type { Location, NavigateFunction } from 'react-router-dom';
```

### **4. Day.js Dates**
```typescript
import dayjs, { Dayjs } from 'dayjs';

const [date, setDate] = useState<Dayjs>(dayjs());
```

---

## 🎉 **Benefits After Migration:**

### **Before (JavaScript):**
```javascript
const login = async (email, password) => {
  // No type checking
  const response = await axios.post('/api/login', { email, password });
  return response.data; // What's the shape? Who knows!
};
```

### **After (TypeScript):**
```typescript
const login = async (email: string, password: string): Promise<AuthResult> => {
  // Full type checking
  const response = await apiClient.api.auth.login.$post({ json: { email, password } });
  const data = await response.json();
  return data; // Typed! IDE autocomplete works!
};
```

---

## 📝 **Next Steps:**

### **Option 1: Gradual Migration (Recommended)**
Convert files one-by-one as you work on them:
1. Start with frequently-used files (AuthContext, Login, Register)
2. Convert components when you need to modify them
3. Eventually all files will be TypeScript

### **Option 2: Big Bang Migration**
Convert all files at once:
1. Rename all `.jsx` → `.tsx`
2. Run `pnpm dev` and fix all errors
3. Commit when everything compiles

**Recommendation**: Option 1 for less risk, Option 2 for faster completion.

---

## 🛠️ **Tools to Help:**

### **VS Code Extensions:**
- ✅ TypeScript Hero
- ✅ ESLint (with TypeScript support)
- ✅ Prettier

### **Commands:**
```bash
# Check for TypeScript errors
pnpm run build

# Auto-fix some issues
pnpm run lint --fix

# Type check without building
npx tsc --noEmit
```

---

## 📚 **Resources:**

- [TypeScript React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Ant Design TypeScript Guide](https://ant.design/docs/react/use-with-typescript)
- [React Router TypeScript](https://reactrouter.com/en/main/guides/typescript)
- [Hono RPC TypeScript](https://hono.dev/docs/helpers/rpc#typescript-support)

---

## 🎯 **Success Criteria:**

Migration is complete when:
✅ All `.jsx` files converted to `.tsx`  
✅ All `.js` files converted to `.ts`  
✅ No TypeScript compilation errors  
✅ All imports resolve correctly  
✅ Hono RPC client has full type safety  
✅ IDE autocomplete works everywhere  

---

**Ready to start the migration?** I can help you convert files one-by-one or all at once! Just say **"Start TypeScript migration"** and we'll begin! 

---

**Last Updated**: 2026-05-29  
**Status**: 🟡 In Progress (1 file converted)  
**Next**: Convert AuthContext.tsx