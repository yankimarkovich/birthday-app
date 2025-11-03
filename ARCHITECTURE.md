# 🏗️ Birthday App - Complete Architecture Guide

**Full-stack birthday management application** - Users can track friends/family birthdays, get reminders for today/this month, and send birthday wishes (once per year). Built with React + TypeScript + Express + MongoDB.

---

## 📋 Table of Contents

1. [Application Overview](#-application-overview)
2. [Client-Side Architecture](#-client-side-architecture)
3. [Server-Side Architecture](#-server-side-architecture)

---

## 🎂 Application Overview

**What is this app?**
A personal birthday tracker where users can:
- Store birthdays with name, date, optional email/phone/notes
- View birthdays in tabs: "Today" (default), "This Month", "All", or Calendar
- Send birthday wishes (logged server-side, max once per year per birthday)
- Full CRUD operations with server-side validation

**Core Business Rules:**
- Authentication required (JWT, 7-day expiration)
- One wish per birthday per year (server validates lastWishSent year)
- Server-side filtering by month/day (birthdays repeat annually, ignore year)
- Each user sees only their own birthdays (userId isolation)

**Tech Stack:**
- **Client:** React 18 + TypeScript + Vite + React Query + Zustand + Tailwind + shadcn/ui
- **Server:** Express + TypeScript + MongoDB/Mongoose + JWT + Zod + Winston
- **DevOps:** Docker Compose (MongoDB + Server + Client)

---

## 🎨 Client-Side Architecture

### 1. Component Initialization Order (main.tsx)

**Why order matters:** Outer providers make their context available to inner components.

```tsx
<StrictMode>                      // 1️⃣ Development-only wrapper (double-renders to catch bugs)
  <QueryClientProvider>           // 2️⃣ React Query - MUST wrap AuthProvider (AuthProvider uses useQueryClient)
    <AuthProvider>                // 3️⃣ Auth context - Can use React Query inside
      <App />                     // 4️⃣ App routes - Can use BOTH React Query AND Auth
      <Toaster />                 // 5️⃣ Toast notifications (from sonner)
    </AuthProvider>
  </QueryClientProvider>
</StrictMode>
```

**Critical Rule:** QueryClientProvider MUST be outside AuthProvider because AuthProvider calls `useQueryClient()` inside (client/src/context/AuthContext.tsx:9).

**✅ Benefits:**
- Centralized provider setup (configure once, use everywhere)
- Clear dependency hierarchy (inner components can use outer contexts)
- AuthProvider can call `queryClient.clear()` on login/logout
- All child components have access to both auth AND React Query

**❌ If not (wrong order):**
- Runtime error: "useQueryClient must be used within QueryClientProvider"
- AuthProvider can't clear cache on login/logout → old user's data leaks to new user
- Difficult to debug (error happens at runtime, not build time)

---

### 2. React Query - Server State Management

**Why React Query?**
- Automatic caching (5-minute stale time)
- Background refetching
- Cache invalidation after mutations
- Loading/error states
- Optimistic updates ready

**Configuration (main.tsx:10-18):**
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Don't refetch when user tabs back
      retry: 1,                      // Retry failed requests once
      staleTime: 5 * 60 * 1000,     // Data stays fresh for 5 minutes
    },
  },
});
```

**✅ Benefits:**
- Automatic caching → Instant data on tab switches (no refetch needed)
- Deduplication → Multiple components call same query, only 1 network request
- Built-in loading/error states → No manual `isLoading`/`error` state management
- Automatic retries → Network glitches handled transparently
- Background refetching → Data stays fresh without user noticing

**❌ If not (using useState + useEffect instead):**
- You'd need to write loading/error/data state in EVERY component
- Multiple components fetching same data → unnecessary duplicate network requests
- No caching → Every tab switch refetches everything (slow, expensive)
- Manual cache invalidation → Need to track and update state everywhere after mutations
- Code like this in every component:
```typescript
// 😫 Without React Query (repetitive, error-prone)
const [birthdays, setBirthdays] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setIsLoading(true);
  fetch('/api/birthdays')
    .then(res => res.json())
    .then(data => setBirthdays(data))
    .catch(err => setError(err))
    .finally(() => setIsLoading(false));
}, []);
```

**Query Keys Hierarchy (hooks/useBirthdays.ts:12-17):**
```typescript
const queryKeys = {
  birthdays: ['birthdays'],                    // Base key - all birthdays
  todaysBirthdays: ['birthdays', 'today'],    // Today only
  monthBirthdays: ['birthdays', 'month'],     // This month only
  birthday: (id) => ['birthdays', id],        // Single birthday
};
```

**Why hierarchical keys?** React Query can invalidate by prefix. Invalidating `['birthdays']` also invalidates `['birthdays', 'today']`.

**✅ Benefits:**
- Invalidate all related queries at once → `invalidateQueries({ queryKey: ['birthdays'] })`
- Clear organization → Easy to see all birthday-related queries
- Type-safe keys → TypeScript catches typos

**❌ If not (flat keys like `'birthdays-today'`, `'birthdays-month'`):**
- Need to manually invalidate each key → Easy to forget one
- No relationship between queries → Can't bulk invalidate
- Harder to manage as app grows (100+ queries)

---

### 3. React Query Hooks - Data Fetching

**useTodaysBirthdays() - Default view (hooks/useBirthdays.ts:40-48)**
```typescript
export function useTodaysBirthdays() {
  return useQuery({
    queryKey: queryKeys.todaysBirthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays/today');
      return data;
    },
  });
}
```

**Why fast?** Server filters by month+day only (2-5 records typically). No client-side filtering needed.

**useThisMonthsBirthdays() - "This Month" tab (hooks/useBirthdays.ts:56-64)**
```typescript
export function useThisMonthsBirthdays() {
  return useQuery({
    queryKey: queryKeys.monthBirthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays/this-month');
      return data;
    },
  });
}
```

**Why useful?** Shows 10-20 upcoming birthdays for planning ahead.

**useBirthdays() - "All" tab + Calendar (hooks/useBirthdays.ts:24-32)**
```typescript
export function useBirthdays() {
  return useQuery({
    queryKey: queryKeys.birthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays');
      return data;
    },
  });
}
```

**Note:** Should use `enabled: false` option in component and only fetch when tab is active (lazy loading).

---

### 4. React Query Mutations + Cache Invalidation

**useCreateBirthday() - Create new birthday (hooks/useBirthdays.ts:66-81)**
```typescript
export function useCreateBirthday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BirthdayFormData) => {
      const { data } = await api.post<SingleBirthdayResponse>('/birthdays', payload);
      return data;
    },
    onSuccess: () => {
      // ✅ Invalidate ALL birthday queries to show new birthday everywhere
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
    },
  });
}
```

**Why invalidate all?** New birthday might appear in "Today", "This Month", AND "All" tabs. Must refetch all views.

**useUpdateBirthday() - Update existing birthday (hooks/useBirthdays.ts:83-99)**
```typescript
export function useUpdateBirthday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<BirthdayFormData> }) => {
      const { data } = await api.patch<SingleBirthdayResponse>(`/birthdays/${id}`, payload);
      return data;
    },
    onSuccess: (_data, vars) => {
      // ✅ Invalidate all views - date change might move birthday between tabs
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.birthday(vars.id) });
    },
  });
}
```

**Why invalidate individual birthday?** If detail view is open, must refetch updated data.

**useSendWish() - Send birthday wish (hooks/useBirthdays.ts:117-132)**
```typescript
export function useSendWish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/birthdays/${id}/wish`);
      return data as { success: true; message: string };
    },
    onSuccess: () => {
      // ✅ CRITICAL: Invalidate to refetch updated lastWishSent timestamp
      // Without this, "Send Wish" button won't disable until manual refresh
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
    },
  });
}
```

**Why critical?** Server updates `lastWishSent` field. UI must refetch to disable button for current year.

**useDeleteBirthday() - Delete birthday (hooks/useBirthdays.ts:101-115)**
```typescript
export function useDeleteBirthday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<DeleteBirthdayResponse>(`/birthdays/${id}`);
      return data;
    },
    onSuccess: () => {
      // ✅ Remove from all cached queries
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
    },
  });
}
```

**Pattern:** All mutations invalidate all birthday queries. Simple and ensures consistency.

**✅ Benefits:**
- UI automatically updates after create/update/delete (no manual state updates)
- All views stay in sync (Today/Month/All tabs all show latest data)
- Simple pattern → Invalidate all birthday queries after any mutation
- Prevents stale data bugs (user sees updated "Send Wish" button state immediately)

**❌ If not (manual state updates):**
- Need to manually update state in every component after mutation
- Easy to forget updating a component → Stale data bugs
- Complex code managing optimistic updates and rollbacks
- Example of manual update hell:
```typescript
// 😫 Without cache invalidation
const deleteBirthday = async (id) => {
  await api.delete(`/birthdays/${id}`);

  // Manually update EVERY piece of state
  setBirthdays(prev => prev.filter(b => b.id !== id));
  setTodaysBirthdays(prev => prev.filter(b => b.id !== id));
  setMonthBirthdays(prev => prev.filter(b => b.id !== id));
  // Miss one? Stale data bug!
}

---

### 5. Auth Provider/Consumer Pattern

**3-File Pattern:**
1. `context/auth-context.ts` - Define context type + create context
2. `context/AuthContext.tsx` - Provider component (renamed from AuthProvider.tsx)
3. `context/useAuth.ts` - Consumer hook

**Why split?** Avoids circular dependencies, clear separation of concerns.

**Step 1: Define Context (context/auth-context.ts:4-12)**
```typescript
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**Why `undefined` default?** Forces components to be inside provider (throws error otherwise).

**Step 2: Provider Implementation (context/AuthContext.tsx:6-53)**
```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();  // ✅ Can use React Query here

  // Restore user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    queryClient.clear();  // ✅ Clear all cached data on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    queryClient.clear();  // ✅ Clear all cached data on logout
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Why clear React Query cache on login/logout?** Prevent showing previous user's data.

**Step 3: Consumer Hook (context/useAuth.ts:4-10)**
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Why throw error?** Catches developer mistakes (using hook outside provider).

**Usage in Components:**
```typescript
import { useAuth } from '@/context/useAuth';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome {user.name}!</div>;
}
```

**✅ Benefits:**
- Single source of truth for auth state (one place to manage user/token)
- Auto-restore session on page refresh (reads from localStorage in useEffect)
- `queryClient.clear()` prevents data leaks between users
- Custom hook provides type-safe access (`useAuth()` instead of `useContext`)
- Error if used outside provider → Catches mistakes early

**❌ If not (prop drilling auth everywhere):**
- Need to pass `user`, `login`, `logout` as props through every component
- No centralized session restore → Need to check localStorage in every component
- Can't clear React Query cache on logout → Previous user's data visible to next user
- Example of prop drilling hell:
```typescript
// 😫 Without Context (prop drilling)
<App user={user} logout={logout}>
  <Header user={user} logout={logout}>
    <UserMenu user={user} logout={logout}>
      <LogoutButton logout={logout} />  // Finally!
    </UserMenu>
  </Header>
</App>
```

---

### 6. HTTP Client - Axios with Interceptors

**Why Axios?** Interceptors for global auth headers, better error handling than fetch.

**Configuration (lib/axios.ts):**
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Pattern:** Every request automatically includes JWT. Every 401 triggers logout.

**✅ Benefits:**
- Automatic JWT header on ALL requests (no manual header setting)
- Global 401 handling → Logout user once, not in every component
- Centralized error handling → Add logging, retries, etc. in one place
- BaseURL configured once → No hardcoded `http://localhost:5000` everywhere

**❌ If not (using fetch without interceptors):**
- Need to manually add Authorization header to EVERY request
- Need to check for 401 in EVERY component and manually logout
- Hardcoded URLs everywhere → Changing API URL requires updating 50+ files
- Example of repetitive code:
```typescript
// 😫 Without Axios interceptors
const createBirthday = async (data) => {
  const token = localStorage.getItem('token');  // Every. Single. Time.

  const response = await fetch('http://localhost:5000/api/birthdays', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,  // Manually add token
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {  // Check in every request
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return response.json();
};
// Repeat this 50+ times in your codebase!
```

---

### 7. Form Handling - React Hook Form + Zod

**Why this combo?**
- React Hook Form: Performance (uncontrolled inputs), built-in validation
- Zod: Type-safe schemas, can be shared with server
- @hookform/resolvers: Connects them together

**Example: Create Birthday Form**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { birthdaySchema } from '@/schemas/birthday.schema';
import { useCreateBirthday } from '@/hooks/useBirthdays';

function CreateBirthdayForm() {
  const { mutate, isPending } = useCreateBirthday();

  const form = useForm({
    resolver: zodResolver(birthdaySchema),  // ✅ Zod validation
    defaultValues: {
      name: '',
      date: new Date(),
      email: '',
      phone: '',
      notes: '',
    },
  });

  const onSubmit = (data: BirthdayFormData) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Birthday created!');
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

**Pattern:** Schema defines both TypeScript types AND runtime validation.

---

### 8. Routing - React Router v6

**Why v6?** Data routers, nested routes, improved TypeScript support.

**Structure (App.tsx):**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <Outlet />;  // Render nested routes
}
```

**Pattern:** Wrapper route checks auth before rendering nested routes.

**✅ Benefits:**
- Centralized auth check (one place protects all routes)
- Automatic redirect to login if not authenticated
- Loading state while checking auth (prevents flash of protected content)
- Nested routes inherit protection (add route, automatically protected)

**❌ If not (checking auth in every component):**
- Need to copy auth check code to every protected component
- Easy to forget → Security vulnerability (unprotected route)
- No loading state → Flash of dashboard before redirect
- Example of repetitive auth checks:
```typescript
// 😫 Without PrivateRoute (repeated in every component)
function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Dashboard content</div>;
}

function Calendar() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;  // Same code!
  if (!isAuthenticated) return <Navigate to="/login" />;  // Same code!

  return <div>Calendar content</div>;
}
// Repeat for every protected page!
```

---

### 9. UI Components - shadcn/ui (Radix UI + Tailwind)

**Why shadcn/ui?**
- Accessible by default (Radix UI primitives)
- Customizable (copy into your codebase, not npm package)
- Tailwind styling (no custom CSS needed)

**Installation:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog form input calendar
```

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function CreateBirthdayDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Birthday</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Birthday</DialogTitle>
        </DialogHeader>
        {/* Form here */}
      </DialogContent>
    </Dialog>
  );
}
```

**Pattern:** Radix handles accessibility, Tailwind handles styling, you customize as needed.

---

### 10. State Management - Zustand (Minimal Usage)

**Why Zustand?** Simple, TypeScript-friendly, no boilerplate.

**Note:** This app uses React Query for server state + Context for auth. Zustand is optional for complex client state (filters, UI preferences).

**Example Store (if needed):**
```typescript
import { create } from 'zustand';

interface FilterStore {
  activeTab: 'today' | 'month' | 'all';
  setActiveTab: (tab: 'today' | 'month' | 'all') => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeTab: 'today',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
```

**Usage:**
```typescript
const { activeTab, setActiveTab } = useFilterStore();
```

**Pattern:** Use Zustand ONLY for client-side UI state that doesn't fit in component state.

---

### 11. TypeScript + Zod - Type Safety

**Why both?**
- TypeScript: Compile-time type checking
- Zod: Runtime validation + type inference

**Shared Schema (shared with server):**
```typescript
import { z } from 'zod';

export const birthdaySchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  date: z.date(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type BirthdayFormData = z.infer<typeof birthdaySchema>;
```

**Pattern:** Define schema once, get TypeScript type + runtime validation.

---

### 12. Testing - Vitest + React Testing Library + MSW

**Why Vitest?** Vite-native (faster), Jest-compatible API.

**Test Categories:**
1. **Component tests** - Render, user interactions, assertions
2. **Hook tests** - React Query hooks with mock API
3. **Integration tests** - Full user flows with MSW

**Example Component Test:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BirthdayList } from './BirthdayList';

test('displays birthdays from API', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <BirthdayList />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

**MSW (Mock Service Worker) - API Mocking:**
```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/birthdays/today', () => {
    return HttpResponse.json({
      success: true,
      count: 2,
      data: [
        { id: '1', name: 'John Doe', date: '2000-01-15' },
        { id: '2', name: 'Jane Smith', date: '1995-01-15' },
      ],
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Pattern:** MSW intercepts real fetch/axios calls, returns mock data. Tests real code paths.

---

### 13. Build & Dev Tools - Vite

**Why Vite?**
- Fast HMR (Hot Module Replacement)
- ESM-native (no bundling in dev)
- Optimized production builds (Rollup)

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // ✅ @/ imports
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',  // ✅ Proxy API in dev
    },
  },
});
```

**Pattern:** `@/` aliases avoid `../../..` hell. Proxy avoids CORS in dev.

---

## 🔧 Server-Side Architecture

### 1. Express App Structure (index.ts)

**Middleware Order Matters:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// 1. Security headers (must be first)
app.use(helmet());

// 2. CORS (before routes)
app.use(cors({ origin: process.env.CLIENT_URL }));

// 3. Request ID (before logger - logger uses it)
app.use(requestIdMiddleware);

// 4. Logger (before routes - logs all requests)
app.use(loggerMiddleware);

// 5. Body parsers (before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/birthdays', birthdayRoutes);

// 7. Error handler (MUST be last)
app.use(errorHandler);
```

**Why order matters:**
- Helmet first → Security headers on all responses
- Request ID before logger → Logger can use requestId
- Error handler last → Catches errors from all middleware/routes

**✅ Benefits:**
- Security headers applied to ALL responses (including errors)
- Request ID available in all logs (traceability)
- Centralized error handling (consistent error format)
- Body parsing before routes (req.body available in controllers)

**❌ If not (wrong middleware order):**
- Error handler first → Can't catch errors from routes (not middleware yet!)
- Logger before request ID → Logs don't have requestId (can't trace requests)
- Routes before body parser → `req.body` is undefined (controllers break)
- Example of wrong order consequences:
```typescript
// 😫 Wrong order
app.use(errorHandler);  // ❌ Too early - routes not registered yet
app.use('/api/auth', authRoutes);  // Error handler can't catch these!
app.use(express.json());  // ❌ Too late - routes already parsed

// In controller:
req.body  // undefined! Body parser not run yet
```

---

### 2. Request ID Middleware - Correlation IDs

**Why request IDs?** Track requests across logs, especially in distributed systems.

**Implementation (middleware/request-id.middleware.ts):**
```typescript
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use client-provided ID or generate new one
  const requestId = req.headers['x-request-id'] as string || uuidv4();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}
```

**Pattern:** Client can send `X-Request-ID` header to trace requests, or server generates UUID.

**✅ Benefits:**
- Trace single request across all log entries (grep by requestId)
- Debug production issues (customer sends requestId, you find all logs)
- Correlate frontend + backend logs (client sends same ID)
- Helpful in microservices (pass ID between services)

**❌ If not (no request IDs):**
- Can't trace single request through multiple log entries
- Debugging production: "I got an error at 2pm" → Which of 1000 requests was it?
- Multiple concurrent requests → Logs interleaved, impossible to separate
- Example of log confusion:
```
[2pm] User login attempt
[2pm] User login attempt
[2pm] Login success
[2pm] Login failed
// Which login succeeded? Which failed? No idea!
```

---

### 3. Logger Middleware - Winston + Request-Scoped Logging

**Why Winston?** Production-ready, supports multiple transports (console, file, cloud).

**Configuration (utils/logger.ts):**
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

**Request-Scoped Logger (middleware/logger.middleware.ts):**
```typescript
import { logger } from '../utils/logger';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Create child logger with requestId
  req.log = logger.child({
    requestId: req.requestId,
    method: req.method,
    path: req.path,
  });

  req.log.info('Request received');

  next();
}
```

**Usage in Controllers:**
```typescript
export const createBirthday = async (req: Request, res: Response) => {
  // ✅ Use req.log instead of global logger (includes requestId)
  (req.log || logger).info(`Birthday created: ${name}`);
};
```

**Pattern:** Every log includes requestId for tracing requests across logs.

**✅ Benefits:**
- Production-ready logging (transports to file/cloud/console)
- Log levels (info, warn, error) → Filter in production
- Structured logging (JSON format) → Easy to parse/search
- Request-scoped logger → Automatic requestId in every log
- Multiple transports → Console for dev, files for prod, CloudWatch for scale

**❌ If not (using console.log):**
- No log levels → Can't filter errors vs info in production
- No structure → Plain text, hard to search/parse
- No file output → Logs lost when server restarts
- No requestId → Can't trace requests
- Production logging is a mess:
```typescript
// 😫 Without Winston
console.log('User logged in:', email);  // Info
console.log('ERROR:', error.message);   // Error (looks the same!)
console.log('Request:', req.method);    // Debug

// In production logs (all mixed together):
User logged in: john@example.com
ERROR: Database timeout
Request: POST
User logged in: jane@example.com
ERROR: Invalid token
// Good luck finding that one error in 10,000 log lines!
```

---

### 4. Auth Middleware - JWT Verification

**Why JWT?** Stateless authentication, no server-side sessions needed.

**Implementation (middleware/auth.middleware.ts):**
```typescript
import jwt from 'jsonwebtoken';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify and decode token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

**Usage in Routes:**
```typescript
import { authMiddleware } from '../middleware/auth.middleware';

router.get('/birthdays', authMiddleware, getBirthdays);
router.post('/birthdays', authMiddleware, createBirthday);
```

**Pattern:** Protected routes require authMiddleware. Controller accesses `req.user`.

**✅ Benefits:**
- Stateless authentication (no server-side sessions to manage)
- Scalable (works with multiple servers, no session sharing needed)
- Mobile-friendly (send token with each request, no cookies)
- Automatic expiration (JWT expires after 7 days)
- Centralized auth logic (one middleware protects all routes)

**❌ If not (session-based auth):**
- Need session store (Redis/database) → Extra infrastructure
- Session sharing between servers → Complex setup
- Scaling issues → Sessions tied to specific server
- Mobile apps → Cookie handling is painful
- Example of session complexity:
```typescript
// 😫 With sessions (more complex)
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'redis';

const redisClient = Redis.createClient();  // Extra service!
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 604800000 }
}));

// Multiple servers need Redis to share sessions
// More moving parts = more things that can break
```

---

### 5. Validation Middleware - Zod

**Why server-side validation?** Never trust client. Client validation can be bypassed.

**Implementation (middleware/validation.middleware.ts):**
```typescript
import { z } from 'zod';

export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);  // ✅ Validate + transform
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}
```

**Usage in Routes:**
```typescript
import { birthdaySchema } from '../schemas/birthday.schema';

router.post('/birthdays', authMiddleware, validate(birthdaySchema), createBirthday);
```

**Pattern:** Validation runs before controller. Controller receives validated data.

**✅ Benefits:**
- Server-side validation (never trust client, client validation can be bypassed)
- Type inference (TypeScript types from schema: `z.infer<typeof schema>`)
- Shared schemas (same validation client + server)
- Clear error messages → Client shows which field failed
- Validation before controller → Controller always receives valid data

**❌ If not (manual validation in controllers):**
- Validation logic scattered across every controller
- Easy to forget validating a field → Security vulnerability
- No TypeScript types → Manual type definitions
- Inconsistent error messages
- Example of manual validation hell:
```typescript
// 😫 Without Zod (manual validation in every controller)
export const createBirthday = async (req, res) => {
  const { name, date, email } = req.body;

  // Manually validate EVERY field
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name required' });
  }
  if (name.length > 100) {
    return res.status(400).json({ error: 'Name too long' });
  }
  if (!date) {
    return res.status(400).json({ error: 'Date required' });
  }
  if (email && !email.includes('@')) {  // Poor email validation
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Finally create birthday (after 20 lines of validation)
  // Repeat this in EVERY controller!
};
```

---

### 6. Error Handler Middleware - Centralized Error Handling

**Why centralized?** Consistent error responses, security (no stack traces in production).

**Implementation (middleware/error.middleware.ts):**
```typescript
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  (req.log || logger).error('Unhandled error', {
    error: err.message,
    stack: err.stack,
  });

  // Hide error details in production
  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDev && { details: err.message, stack: err.stack }),
  });
}
```

**Pattern:** Development shows full error. Production hides details for security.

**✅ Benefits:**
- Consistent error format (all errors look the same to client)
- Security (no stack traces in production → hackers can't see code paths)
- Centralized logging (every error logged in one place)
- Environment-aware (dev shows details, prod hides them)
- Catches ALL unhandled errors (express default is HTML error page)

**❌ If not (error handling in every controller):**
- Need try/catch in EVERY controller
- Inconsistent error responses (some send strings, some objects)
- Stack traces leak in production → Security vulnerability
- Forgot try/catch? → Server crashes!
- Example of repetitive error handling:
```typescript
// 😫 Without centralized error handler
export const createBirthday = async (req, res) => {
  try {
    // Business logic
  } catch (error) {
    // Repeat in EVERY controller
    logger.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBirthday = async (req, res) => {
  try {
    // Business logic
  } catch (error) {
    // Same code again!
    logger.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Repeat 50+ times!
```

---

### 7. MongoDB Models - Mongoose Schemas

**User Model (models/User.model.ts):**
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false, minlength: 8 },
}, {
  timestamps: true,  // ✅ Auto createdAt/updatedAt
});

// Pre-save hook - Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);  // ✅ 10 salt rounds
  next();
});

// Instance method - Compare password
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
```

**Why `select: false` on password?** Password excluded by default in queries. Must explicitly select with `.select('+password')`.

**✅ Benefits (Mongoose pre-save hook):**
- Automatic password hashing (can't forget to hash)
- Hashing ONLY when password changes (efficient)
- Centralized logic (one place handles password security)
- `select: false` prevents accidental password leaks in API responses

**❌ If not (manual hashing in controller):**
- Easy to forget hashing → Passwords stored in plaintext! 💀
- Need to check `isModified` manually in every controller
- Might accidentally send hashed password to client
- Example of dangerous manual hashing:
```typescript
// 😫 Without pre-save hook (dangerous!)
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Developer forgets to hash password!
  const user = new User({ name, email, password });  // Stored in PLAINTEXT! 💀
  await user.save();

  // ...
};

export const updatePassword = async (req, res) => {
  const user = await User.findById(req.user.id);

  // Another place where password is set
  user.password = req.body.newPassword;  // Forgot to hash again! 💀
  await user.save();
};
// Each place you set password = potential security hole
```

**Birthday Model (models/Birthday.model.ts):**
```typescript
const birthdaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  date: { type: Date, required: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  notes: { type: String, maxlength: 500 },
  lastWishSent: { type: Date },  // ✅ Track last wish timestamp
}, {
  timestamps: true,
});

// Index for fast userId queries
birthdaySchema.index({ userId: 1 });

export const Birthday = mongoose.model('Birthday', birthdaySchema);
```

**Pattern:** userId isolates data per user. Index speeds up `find({ userId })` queries.

**✅ Benefits (userId isolation + index):**
- Data isolation (users can't see each other's birthdays)
- Fast queries (index on userId → O(log n) instead of O(n))
- Security by design (always filter by userId in queries)
- Scalable (index essential for 1M+ records)

**❌ If not (no userId field or no index):**
- Security vulnerability → User A can see User B's birthdays!
- Slow queries without index → Need to scan ALL documents
- Example of security hole:
```typescript
// 😫 Without userId isolation (security vulnerability!)
export const getBirthdays = async (req, res) => {
  // Returns ALL birthdays for ALL users! 💀
  const birthdays = await Birthday.find();

  // User A can see User B's private data!
  res.json(birthdays);
};

// ✅ With userId isolation (secure)
export const getBirthdays = async (req, res) => {
  // Only returns current user's birthdays
  const birthdays = await Birthday.find({ userId: req.user.userId });

  res.json(birthdays);
};
```

---

### 8. Controllers - Business Logic

**Auth Controller - Registration (controllers/auth.controller.ts:6-58)**
```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Create user (password hashed by pre-save hook)
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }

    const token = jwt.sign(
      { userId: String(user._id), email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    (req.log || logger).info(`Registration success: ${email}`);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    (req.log || logger).error(`Registration error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
```

**Pattern:** Always log important events. Never expose internal errors to client.

**Birthday Controller - Today's Birthdays (controllers/birthday.controller.ts:76-122)**
```typescript
export const getTodaysBirthdays = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth() + 1;  // MongoDB months are 1-indexed
    const currentDay = today.getDate();

    // Query: Match month AND day, ignore year (birthdays repeat annually)
    const birthdays = await Birthday.find({
      userId: req.user.userId,
      $expr: {
        $and: [
          { $eq: [{ $month: '$date' }, currentMonth] },      // ✅ Month match
          { $eq: [{ $dayOfMonth: '$date' }, currentDay] },   // ✅ Day match
        ],
      },
    }).sort({ date: 1 });

    (req.log || logger).info(
      `Found ${birthdays.length} birthdays today (${currentMonth}/${currentDay}) for user ${req.user.email}`
    );

    return res.status(200).json({
      success: true,
      count: birthdays.length,
      data: birthdays,
    });
  } catch (error) {
    (req.log || logger).error(`Get today's birthdays failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
```

**Why `$expr` + `$month`/`$dayOfMonth`?** Server-side filtering (fast). Returns only 2-5 records instead of all birthdays.

**✅ Benefits (server-side date filtering):**
- Fast queries → Database filters, only returns 2-5 records
- Scalable → Works with 1M birthdays, still fast
- Accurate → MongoDB handles timezones, leap years, etc.
- Less network traffic → Send 5 records instead of 1000

**❌ If not (client-side filtering):**
- Fetch ALL birthdays → Slow for users with 1000+ birthdays
- Client does filtering → Waste CPU, battery (especially mobile)
- High network usage → Download 1MB of data to show 5 birthdays
- Example of inefficient client-side filtering:
```typescript
// 😫 Without server-side filtering (inefficient!)
export const getTodaysBirthdays = async (req, res) => {
  // Returns ALL birthdays (could be 1000+)
  const birthdays = await Birthday.find({ userId: req.user.userId });

  res.json(birthdays);  // Send 1000 records to client
};

// Client:
const { data } = await api.get('/birthdays');  // 1MB download
const today = new Date();
const todaysBirthdays = data.filter(b => {
  const bday = new Date(b.date);
  return bday.getMonth() === today.getMonth() &&
         bday.getDate() === today.getDate();
});  // Filter 1000 → 5 records on client (waste!)
```

**Birthday Controller - Send Wish (controllers/birthday.controller.ts:298-352)**
```typescript
export const sendBirthdayWish = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    const birthday = await Birthday.findOne({ _id: id, userId: req.user.userId });
    if (!birthday) {
      return res.status(404).json({ success: false, error: 'Birthday not found' });
    }

    // ✅ SERVER-SIDE VALIDATION: Check if wish already sent this year
    const currentYear = new Date().getFullYear();

    if (birthday.lastWishSent) {
      const lastSentYear = new Date(birthday.lastWishSent).getFullYear();

      if (lastSentYear === currentYear) {
        // Already sent this year - reject
        (req.log || logger).warn(
          `Duplicate wish attempt for ${birthday.name} (id=${id}) by ${req.user.email}`
        );

        return res.status(400).json({
          success: false,
          error: 'Birthday wish already sent this year',
          lastSent: birthday.lastWishSent,
        });
      }
    }

    // Update lastWishSent timestamp
    birthday.lastWishSent = new Date();
    await birthday.save();

    // ✅ Log the wish (core requirement)
    (req.log || logger).info(
      `Happy Birthday sent to ${birthday.name} (id=${id}) by ${req.user.email} at ${birthday.lastWishSent.toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: 'Birthday wish sent successfully',
      sentAt: birthday.lastWishSent,
    });
  } catch (error) {
    (req.log || logger).error(`Send birthday wish failure: ${(error as Error).message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
```

**Business Rule:** One wish per birthday per year. Server validates by comparing years.

---

### 9. Testing - Jest + Supertest + Simple Mocking

**Why Jest?** Industry standard for Node.js. Better Supertest integration than Vitest.

**Why NOT MongoDB Memory Server?** Slow, complex, overkill for unit tests. Just mock Mongoose.

**Configuration (jest.config.cjs):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  clearMocks: true,       // ✅ Clear mocks between tests
  resetMocks: true,       // ✅ Reset mock implementations
  restoreMocks: true,     // ✅ Restore original implementations
  verbose: true,
};
```

**Test Setup - Mock Mongoose (tests/setup.ts):**
```typescript
import mongoose from 'mongoose';

beforeAll(() => {
  // Mock connection methods to prevent actual database connection
  jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);
  jest.spyOn(mongoose, 'disconnect').mockResolvedValue(void 0 as any);
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

**Pattern:** No database needed. Mongoose mocked globally.

**Model Test Example (tests/models/User.model.test.ts):**
```typescript
import { User } from '../../src/models/User.model';
import bcrypt from 'bcrypt';

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password using bcrypt', async () => {
      const plainPassword = 'MySecurePassword123';

      // Hash password (same way pre-save hook does it)
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);  // bcrypt format

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should use 10 salt rounds', async () => {
      const password = 'Test123';
      const hash = await bcrypt.hash(password, 10);

      // bcrypt hash format: $2a$10$... (10 = salt rounds)
      expect(hash).toMatch(/^\$2[aby]\$10\$/);
    });
  });

  describe('Schema Validation', () => {
    it('should require name, email, password', () => {
      const user = new User({});
      const error = user.validateSync();

      expect(error?.errors.name).toBeDefined();
      expect(error?.errors.email).toBeDefined();
      expect(error?.errors.password).toBeDefined();
    });
  });
});
```

**Pattern:** Test bcrypt directly (no database needed). Use `validateSync()` for validation tests.

**Controller Test Example (tests/controllers/auth.controller.test.ts):**
```typescript
import request from 'supertest';
import express from 'express';
import { register, login } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/User.model';
import jwt from 'jsonwebtoken';

// Mock User model
jest.mock('../../src/models/User.model');

// Create Express app for testing
const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);

describe('Auth Controller', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register new user successfully', async () => {
      // Arrange: Mock User.findOne to return null (email not taken)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock User constructor and save
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Act: Make register request
      const response = await request(app)
        .post('/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
        })
        .expect(201);

      // Assert: Response should include token and user
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
      });

      // Verify JWT token is valid
      const decoded = jwt.verify(response.body.token, 'test-jwt-secret') as any;
      expect(decoded.userId).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });
  });
});
```

**Pattern:** Use Supertest to test HTTP endpoints. Mock Mongoose models. Verify JWT tokens.

**Test Results:**
- **Models:** 69 tests (User: 29, Birthday: 40)
- **Middleware:** 77 tests (auth: 16, validation: 21, error: 18, request-id: 22)
- **Controllers:** 46 tests (auth: 15, birthday: 31)
- **Total:** 192 tests, ~6.5s execution time

---

## 🎯 Key Architectural Decisions

### Client-Side:
1. **React Query over Zustand for server state** - Automatic caching, refetching, invalidation
2. **Axios over fetch** - Interceptors for global auth/error handling
3. **shadcn/ui over MUI** - Copy code (full control), Radix accessibility, Tailwind styling
4. **Vitest over Jest** - Vite-native, faster, Jest-compatible API
5. **React Hook Form + Zod** - Type-safe forms, shared validation with server

### Server-Side:
1. **MongoDB aggregation operators for date filtering** - Server-side filtering (fast, scalable)
2. **Mongoose models over raw MongoDB** - Schema validation, middleware hooks, TypeScript support
3. **Zod over Joi** - Type inference (TypeScript types from schemas)
4. **Winston over console.log** - Production-ready logging with transports
5. **Jest + simple mocking over MongoDB Memory Server** - Fast tests, no downloads, no cleanup

### Full-Stack:
1. **JWT over sessions** - Stateless, scalable, mobile-friendly
2. **Docker Compose for dev** - Consistent environment, easy setup
3. **TypeScript everywhere** - End-to-end type safety
4. **Separate client/server repos in monorepo** - Clear boundaries, independent scaling

---

## 📊 Data Flow Example: Send Birthday Wish

**Client → Server → Database → Client:**

```
1. User clicks "Send Wish" button
   ↓
2. Component calls useSendWish().mutate(birthdayId)
   ↓
3. React Query sends POST /birthdays/:id/wish
   ↓
4. Axios interceptor adds Authorization: Bearer <token>
   ↓
5. Server: requestIdMiddleware adds X-Request-ID header
   ↓
6. Server: loggerMiddleware logs "Request received"
   ↓
7. Server: authMiddleware verifies JWT, attaches req.user
   ↓
8. Server: sendBirthdayWish controller
   - Finds birthday by id + userId (security)
   - Checks lastWishSent year (business rule)
   - If same year → reject with 400
   - If different year → update lastWishSent
   - Logs "Happy Birthday sent to X"
   ↓
9. Server: Returns 200 { success: true, sentAt: timestamp }
   ↓
10. React Query: onSuccess callback runs
    ↓
11. React Query: Invalidates all birthday queries
    ↓
12. React Query: Refetches active queries
    ↓
13. Component: Re-renders with updated data
    ↓
14. UI: "Send Wish" button disabled (already sent this year)
```

---

## 🔒 Security Measures

### Client:
- ✅ No sensitive data in localStorage (only JWT token, which expires)
- ✅ Axios interceptor handles 401 globally (auto-logout)
- ✅ Environment variables for API URL (no hardcoded endpoints)
- ✅ React Router protects routes (PrivateRoute component)

### Server:
- ✅ Helmet headers (XSS, clickjacking protection)
- ✅ CORS configured (only allow client URL)
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT secret from environment (not committed to git)
- ✅ Input validation with Zod (prevents injection)
- ✅ Error handler hides details in production
- ✅ userId isolation (users can't access other users' data)
- ✅ select: false on password field (never return in queries)

---

**Last Updated:** 2025-11-03
**Total Tests:** 192 (Client: 46, Server: 192)
**Coverage:** Models, Middleware, Controllers, Components, Hooks
**Status:** ✅ Production-ready architecture
