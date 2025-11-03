# 🎂 Birthday App - Design Document

## 📋 Project Overview

**Purpose:** Full-stack birthday tracking application for tech lead position interview

**Core Requirements:**

- User authentication (register/login)
- CRUD operations for birthdays
- Calendar view of birthdays
- Filter today's birthdays
- Send birthday wishes
- Responsive design

**Bonus Features:**

- Email integration (Nodemailer)
- Internationalization (EN/HE/ES with RTL)
- Real-time notifications (Socket.io)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│  React 18 + Vite + shadcn/ui + TailwindCSS             │
│  Port: 5173                                             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (Axios + React Query)
                     ↓
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                             │
│  Express + TypeScript + Zod Validation                 │
│  Port: 5000                                             │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                             │
│  MongoDB 7.0                                            │
│  Port: 27017                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Technology Stack Decisions

### Frontend Framework: React 18

**Why YES:**

- ✅ Industry standard - most companies use React
- ✅ Large ecosystem of libraries and tools
- ✅ Strong typing with TypeScript
- ✅ Component reusability
- ✅ Excellent developer experience
- ✅ Virtual DOM for performance
- ✅ Hooks for clean state management

**Why NOT Alternatives:**

**Vue.js:**

- ❌ Smaller job market than React
- ❌ Less familiar to most interviewers
- ✅ Easier learning curve (but not relevant here)

**Angular:**

- ❌ Heavier framework, steeper learning curve
- ❌ More opinionated (less flexibility)
- ❌ Overkill for this project size

**Svelte:**

- ❌ Less mature ecosystem
- ❌ Smaller community
- ❌ Might seem too "trendy" for interview

**Decision:** React 18 - Best balance of modern features, industry relevance, and interviewer familiarity

---

### Build Tool: Vite

**Why YES:**

- ✅ Lightning-fast dev server (instant HMR)
- ✅ Modern standard (2025)
- ✅ Better than Create React App
- ✅ ES modules native support
- ✅ Optimized production builds
- ✅ Excellent TypeScript support

**Why NOT Alternatives:**

**Create React App (CRA):**

- ❌ Deprecated/unmaintained since 2023
- ❌ Slow dev server
- ❌ Webpack configuration complexity

**Webpack (manual):**

- ❌ Complex configuration
- ❌ Slower than Vite
- ❌ Time-consuming setup

**Parcel:**

- ❌ Less popular than Vite
- ❌ Smaller ecosystem

**Decision:** Vite - Modern, fast, industry-moving standard

---

### UI Library: shadcn/ui + Radix UI

**Why YES:**

- ✅ Copy-paste components (owns the code)
- ✅ Built on Radix UI (accessibility by default)
- ✅ Highly customizable
- ✅ No runtime overhead
- ✅ Beautiful default design
- ✅ TypeScript native
- ✅ Works with Tailwind CSS

**Why NOT Alternatives:**

**Material-UI (MUI):**

- ❌ Large bundle size (300KB+)
- ❌ Opinionated design (Google Material)
- ❌ Runtime overhead
- ✅ More components out-of-box (but not needed)

**Ant Design:**

- ❌ Chinese design language (less universal)
- ❌ Heavy bundle size
- ❌ Less customizable

**Chakra UI:**

- ❌ Runtime CSS-in-JS (performance cost)
- ✅ Good DX (but shadcn is better)

**Bootstrap:**

- ❌ Outdated design language
- ❌ jQuery legacy (not modern React)

**Headless UI (Tailwind):**

- ✅ Good alternative
- ❌ Less pre-styled than shadcn/ui

**Decision:** shadcn/ui - Modern, performant, full control

---

### Styling: Tailwind CSS

**Why YES:**

- ✅ Utility-first approach (fast development)
- ✅ No context switching (CSS in JSX)
- ✅ Consistent design system
- ✅ Purged CSS (tiny production bundle)
- ✅ Responsive design utilities
- ✅ Works perfectly with shadcn/ui

**Why NOT Alternatives:**

**CSS Modules:**

- ❌ Separate files (context switching)
- ❌ More boilerplate
- ✅ Better for large teams (but not here)

**Styled Components:**

- ❌ Runtime overhead
- ❌ Larger bundle size
- ❌ Server components issues (React 18+)

**Sass/SCSS:**

- ❌ Build step complexity
- ❌ Less modern than Tailwind

**Plain CSS:**

- ❌ No design system
- ❌ More custom code
- ❌ Harder to maintain

**Decision:** Tailwind CSS - Fast development, modern, works with shadcn/ui

---

### State Management: React Query (TanStack Query)

**Why YES:**

- ✅ Built for server state (API data)
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Error handling built-in
- ✅ Loading states automatic
- ✅ Reduces boilerplate by 80%

**Why NOT Alternatives:**

**Redux Toolkit:**

- ❌ Overkill for this project
- ❌ More boilerplate
- ✅ Better for complex client state (not our case)

**Zustand:**

- ❌ Only handles client state
- ❌ Would need separate API layer
- ✅ Simple and good (but React Query better for API)

**Context API + useState:**

- ❌ No caching
- ❌ Manual loading/error states
- ❌ More code to write

**Decision:** React Query - Perfect for API-driven apps

---

### HTTP Client: Axios

**Why YES:**

- ✅ Interceptors (for auth tokens)
- ✅ Automatic JSON transformation
- ✅ Better error handling than fetch
- ✅ Request/response transformations
- ✅ Cancel requests support
- ✅ Works perfectly with React Query

**Why NOT Alternatives:**

**Fetch API:**

- ❌ No interceptors (manual token injection)
- ❌ Manual JSON parsing
- ❌ Verbose error handling
- ✅ Native (but not worth tradeoffs)

**SuperAgent:**

- ❌ Less popular than Axios
- ❌ Smaller community

**Decision:** Axios - Industry standard for React apps

---

### Backend Framework: Express

**Why YES:**

- ✅ Most popular Node.js framework
- ✅ Lightweight and flexible
- ✅ Huge ecosystem (middleware)
- ✅ Simple and unopinionated
- ✅ Excellent TypeScript support
- ✅ Easy to test

**Why NOT Alternatives:**

**NestJS:**

- ❌ Opinionated architecture (Angular-like)
- ❌ Steeper learning curve
- ❌ More boilerplate
- ✅ Better for large enterprise apps (overkill here)

**Fastify:**

- ❌ Less familiar to interviewers
- ✅ Faster than Express (but not critical here)

**Koa:**

- ❌ Smaller ecosystem
- ❌ Less popular than Express

**Hapi:**

- ❌ Outdated/less maintained
- ❌ Verbose configuration

**Decision:** Express - Simple, familiar, perfect for this scope

---

### Database: MongoDB 7.0

**Why YES:**

- ✅ Flexible schema (birthdays data varies)
- ✅ JSON-like documents (matches JavaScript)
- ✅ Fast development (no migrations)
- ✅ Excellent with Node.js ecosystem
- ✅ Mongoose ODM is mature
- ✅ Easy to scale horizontally

**Why NOT Alternatives:**

**PostgreSQL:**

- ❌ Rigid schema (need migrations)
- ❌ More complex setup
- ✅ Better for relational data (but birthdays aren't complex)
- ✅ ACID transactions (not critical here)

**MySQL:**

- ❌ Same issues as PostgreSQL
- ❌ Less modern than MongoDB

**SQLite:**

- ❌ File-based (not good for Docker/production)
- ✅ Simple setup (but not scalable)

**Decision:** MongoDB - Flexible, fast development, modern

---

### Validation: Zod

**Why YES:**

- ✅ TypeScript-first validation
- ✅ Infer types from schemas (DRY)
- ✅ Runtime type safety
- ✅ Excellent error messages
- ✅ Composable schemas
- ✅ Works server-side and client-side

**Why NOT Alternatives:**

**Joi:**

- ❌ No TypeScript type inference
- ❌ Separate type definitions needed
- ✅ More mature (but Zod caught up)

**Yup:**

- ❌ Weaker TypeScript support than Zod
- ❌ Less modern API

**express-validator:**

- ❌ Tied to Express
- ❌ No type inference

**Decision:** Zod - Best TypeScript integration

---

### Module System: ES Modules

**Why YES:**

- ✅ **Static Analysis** - Imports resolved at compile time
- ✅ **Tree Shaking** - Bundlers eliminate unused code (smaller bundles)
- ✅ **Better IDE Support** - Autocomplete works better with static imports
- ✅ **Modern Standard** - Native browser and Node.js support
- ✅ **Cleaner Syntax** - `import/export` more readable than `require/module.exports`
- ✅ **Top-level Await** - Can await outside async functions

**Example Tree Shaking:**
```typescript
// utils.ts exports 10 functions
export const func1 = () => {};
export const func2 = () => {};
// ... 8 more functions

// app.ts only uses func1
import { func1 } from './utils';

// ✅ Bundler only includes func1 in final bundle (not all 10)
```

**Why NOT CommonJS:**

- ❌ Dynamic imports (`require()` can be anywhere)
- ❌ No tree shaking (entire modules loaded)
- ❌ Harder to statically analyze
- ❌ Older syntax (legacy)

**Configuration:**
```json
// package.json
{
  "type": "module"  // Enable ES modules
}

// tsconfig.json
{
  "module": "ESNext",        // Use modern modules
  "moduleResolution": "node" // Node-style resolution
}
```

**Decision:** ES Modules - Modern, performant, industry standard

---

### Express Middleware Chain Architecture

**Why Ordering Matters:**

Middleware executes sequentially. Wrong order = broken functionality.

**Correct Order Explanation:**

```typescript
// 1. Security Headers (helmet) - FIRST
app.use(helmet());
// Why first: Applies security headers to ALL responses

// 2. CORS - Allow cross-origin requests
app.use(cors({ origin: CLIENT_URL }));
// Why before body parsing: Handles preflight OPTIONS requests

// 3. Body Parsers - Parse request bodies
app.use(express.json());
// Why here: Routes need req.body to be parsed

// 4. Request Tracking (requestId) - After parsing
app.use(requestIdMiddleware);
// Why here: Logger needs parsed request data

// 5. Rate Limiting - Before routes
app.use('/api', apiLimiter);
// Why before routes: Block requests before processing

// 6. Routes - Business logic
app.use('/api/auth', authRoutes);
app.use('/api/birthdays', birthdayRoutes);

// 7. Error Handler - LAST
app.use(errorHandler);
// Why last: Catches errors from all above middleware
```

**Why NOT Random Order:**

**Bad Example:**
```typescript
// ❌ WRONG: Error handler before routes
app.use(errorHandler);      // Won't catch route errors!
app.use('/api', routes);

// ❌ WRONG: Body parser after routes
app.use('/api', routes);    // req.body is undefined!
app.use(express.json());

// ❌ WRONG: Rate limit after routes
app.use('/api', routes);    // Routes process before limiting!
app.use(apiLimiter);
```

**Decision:** Strict middleware ordering prevents subtle bugs and security issues

---

### Request Correlation IDs

**Why YES:**

- ✅ **Track requests** across microservices and logs
- ✅ **Debug distributed systems** - Follow request through system
- ✅ **Request-scoped logging** - All logs for one request grouped
- ✅ **Industry best practice** - Used by all major platforms

**Implementation:**
```typescript
// middleware/request-id.middleware.ts
const id = req.headers['x-request-id'] || crypto.randomUUID();
req.requestId = id;
req.log = logger.child({ requestId: id });  // Scoped logger
res.setHeader('X-Request-ID', id);
```

**Real-world Example:**
```
[2025-11-03 10:30:15] requestId=abc123 | POST /api/birthdays
[2025-11-03 10:30:15] requestId=abc123 | Validating input
[2025-11-03 10:30:16] requestId=abc123 | Saving to database
[2025-11-03 10:30:16] requestId=abc123 | Response sent: 201

// Easy to grep logs: grep "abc123" logs.txt
```

**Why NOT Alternatives:**

- ❌ No tracking - Can't debug production issues
- ❌ Manual IDs - Inconsistent, error-prone

**Decision:** Request IDs essential for production debugging

---

### Rate Limiting Strategy

**Why YES:**

- ✅ **Prevent abuse** - Stop brute force attacks
- ✅ **Protect resources** - Don't overload database
- ✅ **Fair usage** - One user can't monopolize server
- ✅ **Cost control** - Limit expensive operations

**Two-tier Approach:**

**1. General API Rate Limit:**
```typescript
// 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later'
});
```

**2. Login-specific Rate Limit:**
```typescript
// 5 login attempts per 1 minute per IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again'
});

// Applied only to login route
router.post('/login', loginLimiter, login);
```

**Why Two Tiers:**

- ✅ Login is more sensitive (brute force target)
- ✅ Stricter limits don't affect normal usage
- ✅ Defense in depth

**Why NOT Alternatives:**

- ❌ No rate limiting - Vulnerable to attacks
- ❌ Same limit for all - Login too permissive or API too strict

**Decision:** Two-tier rate limiting balances security and UX

---

### Mongoose ODM vs Raw MongoDB

**Why Mongoose YES:**

- ✅ **Schema Validation** - Type safety at runtime
- ✅ **Middleware/Hooks** - Pre-save, post-save logic
- ✅ **Instance Methods** - Custom model behaviors
- ✅ **Query Building** - Chainable, readable queries
- ✅ **Population** - Easy relations (like SQL joins)
- ✅ **Plugins** - Extend functionality

**Example: Pre-save Hook**
```typescript
// Automatic password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Hash password before saving
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Password always hashed, can't forget to do it
await user.save();  // Automatically hashes
```

**Example: Instance Method**
```typescript
// Add custom method to model
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Clean API for password checking
const isValid = await user.comparePassword('password123');
```

**Example: Compound Index**
```typescript
// Optimize queries for userId + date
birthdaySchema.index({ userId: 1, date: 1 });

// ✅ Fast query: find birthdays for user sorted by date
Birthday.find({ userId }).sort({ date: 1 });  // Uses index
```

**Why NOT Raw MongoDB:**

**Raw MongoDB:**
```javascript
// ❌ Manual validation
if (!name || name.length < 2) throw new Error('Invalid');

// ❌ Manual password hashing (can forget!)
const password = await bcrypt.hash(req.body.password, 10);

// ❌ Verbose queries
await db.collection('users').findOne({ _id: new ObjectId(id) });

// ❌ No type safety
```

**Mongoose:**
```typescript
// ✅ Schema validates automatically
const User = mongoose.model('User', userSchema);

// ✅ Hooks handle hashing
await user.save();

// ✅ Clean queries
await User.findById(id);

// ✅ TypeScript types
```

**Decision:** Mongoose - Developer productivity, safety, maintainability

---

### Controllers vs Routes Separation

**Why Separate:**

- ✅ **Single Responsibility** - Routes define paths, controllers handle logic
- ✅ **Testability** - Test business logic without Express
- ✅ **Reusability** - Same controller for different routes
- ✅ **Readability** - Clear separation of concerns

**Example:**

**Routes (birthday.routes.ts):**
```typescript
// ✅ ONLY defines paths and middleware
router.get('/', authenticate, getAllBirthdays);
router.post('/', authenticate, validate(schema), createBirthday);
router.get('/today', authenticate, getTodaysBirthdays);
```

**Controllers (birthday.controller.ts):**
```typescript
// ✅ ONLY handles business logic
export const getAllBirthdays = async (req, res) => {
  const birthdays = await Birthday.find({ userId: req.user.userId });
  return res.json({ success: true, data: birthdays });
};
```

**Why NOT Combined:**

**Bad (Combined):**
```typescript
// ❌ Business logic in routes file
router.get('/birthdays', authenticate, async (req, res) => {
  try {
    const birthdays = await Birthday.find({
      userId: req.user.userId
    }).sort({ date: 1 });

    // 50 more lines of logic...

    return res.json({ success: true, data: birthdays });
  } catch (error) {
    // Error handling...
  }
});

// Problems:
// - Hard to test (needs Express mocks)
// - Routes file becomes huge
// - Can't reuse logic
// - Harder to maintain
```

**Decision:** Separation improves testability and maintainability

---

### Multi-tenant Data Isolation

**Why YES:**

- ✅ **Security** - Users can't see others' data
- ✅ **Privacy** - GDPR/compliance requirement
- ✅ **Trust** - Critical for user confidence

**Implementation:**

```typescript
// ✅ ALWAYS filter by userId from token
export const getAllBirthdays = async (req, res) => {
  const birthdays = await Birthday.find({
    userId: req.user.userId  // From JWT token
  });
  return res.json({ success: true, data: birthdays });
};

export const getBirthdayById = async (req, res) => {
  const birthday = await Birthday.findOne({
    _id: req.params.id,
    userId: req.user.userId  // ✅ Critical: Check ownership
  });

  if (!birthday) {
    return res.status(404).json({ error: 'Not found' });
  }

  return res.json({ success: true, data: birthday });
};
```

**Why This Matters:**

**Without userId check:**
```typescript
// ❌ SECURITY VULNERABILITY
const birthday = await Birthday.findById(req.params.id);

// Problem: User A can access User B's birthday if they know the ID
// Example: GET /api/birthdays/673e5f9a8b2c1d0012345678
// Even if it belongs to another user!
```

**With userId check:**
```typescript
// ✅ SECURE
const birthday = await Birthday.findOne({
  _id: req.params.id,
  userId: req.user.userId
});

// Result: Returns null if birthday belongs to different user
// MongoDB query enforces isolation at database level
```

**Decision:** Multi-tenant isolation is non-negotiable for security

---

### MongoDB Query Patterns for Recurring Dates

**Challenge:** Match birthdays by month/day (ignoring year)

**Why Aggregation Operators:**

```typescript
// ✅ Correct: Use $month and $dayOfMonth
const birthdays = await Birthday.find({
  userId: req.user.userId,
  $expr: {
    $and: [
      { $eq: [{ $month: '$date' }, currentMonth] },
      { $eq: [{ $dayOfMonth: '$date' }, currentDay] }
    ]
  }
});
```

**Why NOT JavaScript Filtering:**

```typescript
// ❌ WRONG: Load all, filter in JavaScript
const allBirthdays = await Birthday.find({ userId });

const todaysBirthdays = allBirthdays.filter(b => {
  return b.date.getMonth() === today.getMonth() &&
         b.date.getDate() === today.getDate();
});

// Problems:
// - Loads entire dataset into memory
// - Slow for large datasets
// - Wastes bandwidth
// - Doesn't use database indexes
```

**JavaScript vs MongoDB Month Indexing:**

```typescript
// ⚠️ IMPORTANT: JavaScript uses 0-based months
const jsDate = new Date('2025-11-03');
jsDate.getMonth();  // Returns 10 (November is 10)

// ✅ MongoDB uses 1-based months
{ $month: '$date' }  // Returns 11 for November

// Solution: Add 1 when comparing
const currentMonth = today.getMonth() + 1;  // Fix for MongoDB
```

**Index + Sort Pattern:**

```typescript
// Index makes sorting FAST but doesn't sort automatically
birthdaySchema.index({ userId: 1, date: 1 });

// ❌ WRONG: Assume index sorts
const birthdays = await Birthday.find({ userId });
// Result: Returns in unpredictable order

// ✅ CORRECT: Explicitly request sorting
const birthdays = await Birthday.find({ userId }).sort({ date: 1 });
// Result: Returns sorted by date (fast because of index)
```

**Why Index Doesn't Auto-sort:**

Think of index like a book's index:
- Index makes finding fast
- But you must tell MongoDB which order you want
- Index makes that ordering fast (avoids full scan)

**Decision:** Use MongoDB aggregation operators for recurring date patterns

---

### PATCH vs PUT for Updates

**Why PATCH:**

- ✅ **Partial Updates** - Only send changed fields
- ✅ **Bandwidth Efficient** - Less data over network
- ✅ **Flexible** - User can update one field at a time
- ✅ **Better UX** - Don't need entire object

**Implementation:**

```typescript
// PATCH /api/birthdays/:id
// Body: { "name": "New Name" }  ← Only changed field

export const updateBirthday = async (req, res) => {
  const birthday = await Birthday.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    req.body,  // Only updates provided fields
    { new: true, runValidators: true }
  );
};
```

**Zod Schema:**
```typescript
// Create schema: All fields required
const createBirthdaySchema = z.object({
  name: z.string().min(2),
  date: z.date(),
  email: z.string().email().optional()
});

// Update schema: All fields optional
const updateBirthdaySchema = createBirthdaySchema.partial();

// ✅ .partial() makes all fields optional
// Update can have just: { name: "New" }
// Or just: { date: "2025-12-25" }
// Or both: { name: "New", date: "2025-12-25" }
```

**Why NOT PUT:**

**PUT (Full Replacement):**
```typescript
// PUT requires ALL fields
// Body: { "name": "New", "date": "...", "email": "...", "phone": "...", ... }

// ❌ Problems:
// - Must send entire object even for one field change
// - Client must track all fields
// - More bandwidth
// - Risk of accidental data loss (forgot a field)
```

**When to Use PUT:**
- ✅ Full resource replacement
- ✅ Idempotent overwrites
- ❌ NOT for partial updates (use PATCH)

**Decision:** PATCH for flexible partial updates

---

### Route Ordering Importance

**Why Order Matters:**

Express matches routes top-to-bottom. First match wins.

**Correct Order:**

```typescript
// ✅ Specific routes FIRST
router.get('/today', getTodaysBirthdays);
router.get('/this-month', getThisMonthsBirthdays);

// ✅ Parameterized routes LAST
router.get('/:id', getBirthdayById);
router.get('/', getAllBirthdays);
```

**Why NOT Wrong Order:**

```typescript
// ❌ WRONG: Parameterized route first
router.get('/:id', getBirthdayById);
router.get('/today', getTodaysBirthdays);  // NEVER REACHED!

// Problem:
// GET /api/birthdays/today
// Matches /:id with id="today"
// getBirthdayById('today') → Invalid ObjectId error
```

**Rule: Specific → Generic**
1. Static paths (`/today`, `/this-month`)
2. Parameterized paths (`/:id`)
3. Catch-all paths (`/` or `/*`)

**Decision:** Route ordering prevents unexpected behavior

---

### Authentication: JWT (JSON Web Tokens)

**Why YES:**

- ✅ Stateless (no session storage)
- ✅ Scalable (no server memory)
- ✅ Works across microservices
- ✅ Industry standard
- ✅ Simple to implement
- ✅ Can store user data in token

**Why NOT Alternatives:**

**Sessions (express-session):**

- ❌ Requires session storage (Redis/MongoDB)
- ❌ Not stateless
- ✅ More secure (can revoke) (but not needed here)

**OAuth 2.0:**

- ❌ Overkill for simple auth
- ❌ Complex implementation
- ✅ Better for third-party login (not required)

**Passport.js:**

- ❌ Adds complexity
- ✅ Good for multiple strategies (but we only need one)

**Decision:** JWT - Simple, stateless, industry standard

---

### DevOps: Docker + Docker Compose

**Why YES:**

- ✅ One-command setup for reviewer
- ✅ Consistent environment
- ✅ Production-like setup
- ✅ Easy MongoDB management
- ✅ Shows DevOps knowledge
- ✅ No "works on my machine" issues

**Why NOT Alternatives:**

**No Docker (manual setup):**

- ❌ Reviewer needs to install MongoDB
- ❌ Different Node versions cause issues
- ❌ More setup steps

**Kubernetes:**

- ❌ Massive overkill
- ❌ Too complex for interview

**Docker Swarm:**

- ❌ Not needed for single-machine dev

**Decision:** Docker Compose - Perfect balance for interview project

---

### Zod Schema Composition Patterns

**Why Zod Schema Composition:**

- ✅ **DRY Principle** - Reuse schemas without duplication
- ✅ **Type Inference** - Single source for runtime validation AND TypeScript types
- ✅ **Consistency** - Same validation on client and server

**Pattern 1: Partial Schemas**

```typescript
// Base schema for creating (all fields required)
const createBirthdaySchema = z.object({
  name: z.string().min(2).max(100),
  date: z.date(),
  email: z.string().email().optional()
});

// Update schema (all fields optional)
const updateBirthdaySchema = createBirthdaySchema.partial();

// ✅ No duplication! Update inherits from create
// partial() makes: { name?: string, date?: Date, email?: string }
```

**Pattern 2: Type Inference**

```typescript
// Schema defines both validation AND types
export const birthdaySchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  date: z.date().or(z.string())
});

// ✅ Infer TypeScript type from schema
export type Birthday = z.infer<typeof birthdaySchema>;

// Result: No separate type definition needed!
// Type automatically matches validation
```

**Pattern 3: Schema Composition (Pick/Omit)**

```typescript
// Full user schema
const userSchema = z.object({
  _id: z.string(),
  email: z.string(),
  password: z.string(),
  createdAt: z.date()
});

// Public profile (omit sensitive fields)
const publicUserSchema = userSchema.omit({ password: true });

// Login request (only email + password)
const loginSchema = userSchema.pick({ email: true, password: true });

// ✅ Single source of truth, multiple views
```

**Pattern 4: Transformations**

```typescript
// Accept string OR Date, always return Date
date: z.string().or(z.date()).transform(val => new Date(val))

// Accept empty string as undefined
email: z.string().email().optional().or(z.literal(''))

// ✅ Flexible input, consistent output
```

**Pattern 5: Custom Refinements**

```typescript
// Complex validation logic
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(val => /[A-Z]/.test(val), 'Must contain uppercase')
  .refine(val => /[0-9]/.test(val), 'Must contain number');

// ✅ Chain multiple validations with custom messages
```

**Why NOT Alternatives:**

**Joi:**
```typescript
// ❌ Separate type definition needed
const joi = Joi.object({ name: Joi.string() });
interface Birthday { name: string }  // Manual duplication!
```

**Yup:**
```typescript
// ❌ Weak TypeScript inference
const yup = yup.object({ name: yup.string() });
// Type inference exists but less powerful than Zod
```

**Decision:** Zod schema composition eliminates duplication and ensures type safety

---

### TypeScript Strict Mode Configuration

**Why ALL Strict Flags:**

- ✅ **Catch bugs early** - At compile time, not runtime
- ✅ **Better refactoring** - Compiler finds issues
- ✅ **Documentation** - Types serve as documentation
- ✅ **Team safety** - Prevents common mistakes

**Configuration:**

```json
// tsconfig.json
{
  "compilerOptions": {
    // Language targeting
    "target": "ES2023",        // Modern JavaScript features
    "module": "ESNext",        // ES modules (import/export)
    "lib": ["ES2023"],         // JavaScript APIs available

    // Strict Type Checking (ALL enabled)
    "strict": true,                        // Enable all strict checks
    "noImplicitAny": true,                 // No implicit 'any' type
    "strictNullChecks": true,              // null/undefined must be explicit
    "strictFunctionTypes": true,           // Function params contravariant
    "strictBindCallApply": true,           // Correct bind/call/apply types
    "strictPropertyInitialization": true,  // Class properties must be initialized
    "noImplicitThis": true,                // 'this' must have explicit type

    // Additional Safety
    "noUnusedLocals": true,                // Error on unused variables
    "noUnusedParameters": true,            // Error on unused params
    "noImplicitReturns": true,             // All paths must return
    "noFallthroughCasesInSwitch": true,    // Switch cases must break

    // Module Resolution
    "moduleResolution": "node",            // Node.js style resolution
    "esModuleInterop": true,               // CommonJS compatibility
    "resolveJsonModule": true,             // Import JSON files

    // Output
    "outDir": "./dist",                    // Compiled output
    "rootDir": "./src",                    // Source files
    "sourceMap": true,                     // Debug support
    "declaration": true                    // Generate .d.ts files
  }
}
```

**Why Each Flag Matters:**

**noImplicitAny:**
```typescript
// ❌ Without flag: 'any' type inferred (dangerous!)
function add(a, b) {  // a: any, b: any
  return a + b;       // No type safety
}

// ✅ With flag: Compiler error
function add(a, b) {  // Error: Parameter 'a' implicitly has 'any' type
  return a + b;
}

// ✅ Fix: Explicit types
function add(a: number, b: number): number {
  return a + b;
}
```

**strictNullChecks:**
```typescript
// ❌ Without flag: null/undefined can be any type
let name: string = null;  // No error (but will crash!)
console.log(name.toUpperCase());  // Runtime error

// ✅ With flag: Must be explicit
let name: string | null = null;  // OK
if (name) {
  console.log(name.toUpperCase());  // Safe
}
```

**noImplicitReturns:**
```typescript
// ❌ Without flag: Missing return path
function getValue(flag: boolean): number {
  if (flag) {
    return 42;
  }
  // Missing else return - undefined at runtime!
}

// ✅ With flag: Compiler error
// Error: Not all code paths return a value
```

**Decision:** Strict mode catches bugs before they reach production

---

### Module Augmentation for Express

**Why Module Augmentation:**

- ✅ **Extend third-party types** - Add custom properties safely
- ✅ **Type safety** - TypeScript knows about custom properties
- ✅ **No runtime overhead** - Only affects types
- ✅ **Maintainable** - Centralized type definitions

**Implementation:**

```typescript
// src/types/express.d.ts
import { Request } from 'express';
import type { Logger } from 'winston';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      requestId?: string;
      log?: Logger;
    }
  }
}
```

**How It Works:**

```typescript
// ✅ Before: TypeScript doesn't know about custom properties
app.use((req, res, next) => {
  req.user = { userId: '123', email: 'user@example.com' };
  //  ^^^^ Error: Property 'user' does not exist on type 'Request'
});

// ✅ After augmentation: TypeScript knows about custom properties
app.use((req, res, next) => {
  req.user = { userId: '123', email: 'user@example.com' };  // OK
  req.requestId = crypto.randomUUID();  // OK
  req.log = logger.child({ requestId: req.requestId });  // OK
});

// ✅ Controllers get type safety
export const getBirthdays = async (req, res) => {
  const userId = req.user?.userId;  // TypeScript knows this exists!
  //             ^^^^^^ Optional chaining (might be undefined)
};
```

**Why NOT Alternatives:**

**Type Assertions:**
```typescript
// ❌ Lose type safety
const userId = (req as any).user.userId;  // No autocomplete, no safety
```

**Custom Request Interface:**
```typescript
// ❌ Must cast everywhere
interface CustomRequest extends Request {
  user?: { userId: string };
}

app.use((req: CustomRequest, res, next) => {
  // Works but must cast in every middleware/controller
});
```

**Decision:** Module augmentation provides global type safety without runtime cost

---

### OpenAPI Documentation Strategy

**Why OpenAPI YES:**

- ✅ **Interactive docs** - Test APIs in browser
- ✅ **Always up-to-date** - Generated from code
- ✅ **Client generation** - Auto-generate API clients
- ✅ **Contract-first** - API contract doubles as documentation

**Three-file Minimal Approach:**

**1. Registry Setup (openapi-registry.ts):**
```typescript
import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// ✅ Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// ✅ Define security scheme once
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});
```

**2. Generator (openapi-generator.ts):**
```typescript
import { OpenAPIGenerator } from '@asteasolutions/zod-to-openapi';
import { registry } from './openapi-registry';

export function generateOpenAPIDocument() {
  const generator = new OpenAPIGenerator(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Birthday App API',
      version: '1.0.0'
    },
    servers: [{ url: '/api' }]
  });
}
```

**3. Endpoint Registration (openapi.ts):**
```typescript
import { registry } from './config/openapi-registry';
import { createBirthdaySchema, birthdaySchema } from './schemas/birthday.schema';

// ✅ Register each endpoint
registry.registerPath({
  method: 'post',
  path: '/api/birthdays',
  summary: 'Create a new birthday',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createBirthdaySchema  // Zod schema becomes OpenAPI
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Birthday created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: birthdaySchema
          })
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]  // Require JWT
});
```

**Key Benefits:**

1. **Single Source of Truth:**
```typescript
// ✅ One schema serves THREE purposes:
export const createBirthdaySchema = z.object({
  name: z.string().min(2)
});

// 1. Runtime validation
validate(createBirthdaySchema)(req, res, next);

// 2. TypeScript types
type CreateBirthday = z.infer<typeof createBirthdaySchema>;

// 3. OpenAPI documentation
registry.registerPath({ request: { body: { schema: createBirthdaySchema }}});
```

2. **Always Synchronized:**
- Change schema → Validation, types, AND docs update automatically
- No manual OpenAPI YAML files to maintain

**Accessing Documentation:**

- **Swagger UI:** http://localhost:5000/docs
- **OpenAPI JSON:** http://localhost:5000/openapi.json

**Decision:** Minimal 3-file approach keeps docs in sync with code

---

### Error Handling Middleware Pattern

**Why Centralized Error Handler:**

- ✅ **Consistent responses** - Same error format everywhere
- ✅ **DRY principle** - Don't repeat error handling
- ✅ **Logging** - All errors logged in one place
- ✅ **Production safety** - Hide sensitive details in prod

**Critical: 4-Parameter Signature**

```typescript
// ✅ CORRECT: 4 parameters (err, req, res, next)
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction  // Must exist even if unused (prefix _ to avoid lint error)
) {
  const logger = req.log || defaultLogger;

  // Log error
  logger.error({
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
    requestId: req.requestId
  });

  // Send response
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}

// ✅ Register LAST in middleware chain
app.use(errorHandler);
```

**Why 4 Parameters:**

Express distinguishes error handlers by signature:
- **3 params** `(req, res, next)` = Regular middleware
- **4 params** `(err, req, res, next)` = Error handler

```typescript
// ❌ WRONG: 3 parameters (not recognized as error handler)
function errorHandler(err: unknown, req: Request, res: Response) {
  // This won't catch errors!
}

// ✅ CORRECT: 4 parameters (error handler)
function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // This catches errors!
}
```

**Error Flow:**

```typescript
// Controller throws error
export const getBirthday = async (req, res, next) => {
  try {
    const birthday = await Birthday.findById(req.params.id);
    if (!birthday) throw new Error('Not found');
    return res.json({ success: true, data: birthday });
  } catch (error) {
    return next(error);  // ✅ Pass to error handler
  }
};

// Express automatically calls errorHandler with 4 params
```

**Zod Validation Errors:**

```typescript
// Validation middleware catches Zod errors
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors  // Detailed field errors
        });
      }
      return next(error);  // Pass other errors to error handler
    }
  };
};
```

**Decision:** 4-parameter error handler centralizes error management

---

### Health Check Endpoint

**Why Health Checks:**

- ✅ **Monitoring** - Kubernetes/Docker can check if app is alive
- ✅ **Load balancers** - Remove unhealthy instances
- ✅ **Debugging** - Quick way to verify server status
- ✅ **Dependencies** - Check database connectivity

**Implementation:**

```typescript
// Simple health check
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Advanced: Check dependencies
app.get('/health', async (req, res) => {
  try {
    // Check database
    await mongoose.connection.db.admin().ping();

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});
```

**Docker Compose Integration:**

```yaml
services:
  server:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Kubernetes Liveness Probe:**

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Decision:** Health checks essential for production deployments

---

### Password Hashing with bcrypt

**Why bcrypt:**

- ✅ **Slow by design** - Prevents brute force
- ✅ **Adaptive** - Can increase cost factor over time
- ✅ **Salt included** - No rainbow table attacks
- ✅ **Industry standard** - Battle-tested since 1999

**Implementation with Mongoose Hooks:**

```typescript
import bcrypt from 'bcrypt';

// Pre-save hook: Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);  // 10 rounds (good balance)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Password automatically hashed on save
const user = new User({ email: 'user@example.com', password: 'plain123' });
await user.save();  // Saves hashed password
```

**Instance Method for Comparison:**

```typescript
// Add method to user model
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Clean API for login
const user = await User.findOne({ email });
const isValid = await user.comparePassword(plainPassword);
if (isValid) {
  // Login successful
}
```

**Salt Rounds Explained:**

```typescript
// Salt rounds = 2^n iterations
const rounds = 10;  // 2^10 = 1,024 iterations

// ✅ 10 rounds: ~100ms per hash (good for 2025)
// ✅ Adjustable for future hardware improvements
// ❌ More rounds = slower (better security, worse UX)
// ❌ Fewer rounds = faster (worse security)
```

**Why NOT Alternatives:**

**Plain Text:**
```typescript
// ❌ NEVER store plain passwords!
password: 'password123'  // Database breach = all passwords leaked
```

**SHA256/MD5:**
```typescript
// ❌ Too fast (billions of hashes per second)
const hash = crypto.createHash('sha256').update(password).digest('hex');
// Vulnerable to brute force and rainbow tables
```

**Argon2:**
```typescript
// ✅ Slightly better than bcrypt
// ❌ Less mature ecosystem in Node.js
// ✅ Good alternative, but bcrypt is proven
```

**Decision:** bcrypt with 10 rounds balances security and performance

---

## 🎁 Optional Features (Bonus)

### 1. Email Integration (Nodemailer)

**Why YES:**

- ✅ Demonstrates real-world feature
- ✅ Shows understanding of SMTP
- ✅ Adds genuine value
- ✅ Easy to implement with Nodemailer

**Why Nodemailer:**

- ✅ Most popular Node.js email library
- ✅ Supports multiple transports (SMTP, SendGrid, etc.)
- ✅ Good documentation
- ✅ TypeScript support

**Configuration:**

- Gmail SMTP (development)
- SendGrid (production alternative)
- Graceful fallback: Logs to console if email fails

**Alternatives Considered:**

**SendGrid SDK:**

- ❌ Vendor lock-in
- ✅ More reliable (but costs money)

**AWS SES:**

- ❌ Requires AWS account setup
- ❌ More complex for interview

**Decision:** Nodemailer with SMTP - Flexible, free, easy to demo

---

### 2. Internationalization (i18next)

**Implementation:**

- English (default)
- Hebrew (RTL support)
- Spanish

**Why YES:**

- ✅ Shows global thinking
- ✅ Demonstrates RTL handling (complex)
- ✅ Important for Israeli market
- ✅ Relatively easy with react-i18next

**Why react-i18next:**

- ✅ Most popular i18n library for React
- ✅ Excellent hooks API
- ✅ Dynamic language switching
- ✅ Namespace support

**Alternatives Considered:**

**FormatJS (react-intl):**

- ❌ More complex API
- ❌ Larger bundle size

**Polyglot.js:**

- ❌ Less features
- ❌ No React hooks

**Decision:** react-i18next - Best React integration

---

### 3. Real-time Notifications (Socket.io)

**Use Cases:**

- New birthday added by another user
- Birthday updated
- Birthday deleted
- Today's birthday reminder

**Why YES:**

- ✅ Modern real-time feature
- ✅ Shows WebSocket knowledge
- ✅ Better UX (instant updates)
- ✅ Impressive for interview

**Why Socket.io:**

- ✅ Most popular WebSocket library
- ✅ Fallback to polling (compatibility)
- ✅ Room support (per-user updates)
- ✅ Works with Express easily

**Alternatives Considered:**

**Server-Sent Events (SSE):**

- ❌ One-way only (server → client)
- ✅ Simpler (but less powerful)

**WebSocket (native):**

- ❌ No fallback mechanism
- ❌ More code to write

**Polling:**

- ❌ Inefficient (constant requests)
- ❌ Not real-time

**Decision:** Socket.io - Full-featured, reliable, industry standard

---

## 📐 Project Structure

```
birthday-app/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── layout/              # Layout components
│   │   │   └── features/            # Feature-specific components
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Calendar.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useBirthdays.ts
│   │   ├── lib/                     # Utilities
│   │   │   ├── axios.ts             # Axios instance
│   │   │   └── utils.ts
│   │   ├── types/                   # TypeScript types
│   │   ├── i18n/                    # Translations (optional)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   └── birthday.controller.ts
│   │   ├── models/                  # Mongoose models
│   │   │   ├── User.model.ts
│   │   │   └── Birthday.model.ts
│   │   ├── routes/                  # Express routes
│   │   │   ├── auth.routes.ts
│   │   │   └── birthday.routes.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── schemas/                 # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   └── birthday.schema.ts
│   │   ├── utils/                   # Utilities
│   │   │   ├── jwt.ts
│   │   │   ├── email.ts (optional)
│   │   │   └── logger.ts
│   │   ├── config/                  # Configuration
│   │   │   ├── database.ts
│   │   │   └── socket.ts (optional)
│   │   ├── types/                   # TypeScript types
│   │   └── index.ts                 # Entry point
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml               # One-command setup
├── .gitignore
├── README.md                        # Setup instructions
└── DESIGN.md                        # This file
```

---

## 🔐 Security Considerations

### 1. Authentication & Authorization

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration
- ✅ HTTP-only cookies for token storage (optional)
- ✅ Protected routes with auth middleware

### 2. Input Validation

- ✅ Zod schemas on both client and server
- ✅ Sanitize user inputs
- ✅ MongoDB injection prevention (Mongoose escapes)

### 3. CORS Configuration

```javascript
cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
});
```

### 4. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use `.env.example` templates
- ✅ Different secrets for dev/prod

### 5. Rate Limiting (Optional)

```javascript
// Prevent brute force attacks
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

---

## 🧪 Testing Strategy

### Frontend Testing (Vitest + React Testing Library)

```typescript
// Component tests
describe('BirthdayCard', () => {
  it('displays birthday information', () => {
    render(<BirthdayCard birthday={mockBirthday} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Backend Testing (Jest + Supertest)

```typescript
// API endpoint tests
describe('POST /api/birthdays', () => {
  it('creates a new birthday', async () => {
    const res = await request(app)
      .post('/api/birthdays')
      .set('Authorization', `Bearer ${token}`)
      .send(mockBirthday);
    expect(res.status).toBe(201);
  });
});
```

### Test Coverage Goals

- Controllers: 80%+
- Models: 90%+
- Utilities: 80%+
- Components: 70%+

---

## 🚀 Performance Optimizations

### Frontend

1. **Code Splitting**

   - Route-based splitting with React.lazy()
   - Lazy load heavy components

2. **React Query Caching**

   - Automatic background refetch
   - Stale-while-revalidate pattern

3. **Image Optimization**

   - Use WebP format
   - Lazy load images

4. **Bundle Size**
   - Tree shaking with Vite
   - Analyze with rollup-plugin-visualizer

### Backend

1. **Database Indexing**

```javascript
birthdaySchema.index({ userId: 1, date: 1 });
birthdaySchema.index({ userId: 1, isToday: 1 });
```

2. **Response Compression**

```javascript
app.use(compression());
```

3. **MongoDB Query Optimization**
   - Use lean() for read-only queries
   - Limit fields with select()

---

## 🔄 API Design

### REST Endpoints

**Authentication:**

```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get current user
```

**Birthdays:**

```
GET    /api/birthdays              # List all birthdays
POST   /api/birthdays              # Create birthday
GET    /api/birthdays/:id          # Get single birthday
PUT    /api/birthdays/:id          # Update birthday
DELETE /api/birthdays/:id          # Delete birthday
GET    /api/birthdays/today        # Get today's birthdays
POST   /api/birthdays/:id/wish     # Send birthday wish
```

**Health Check:**

```
GET    /health                     # Health check endpoint
```

### Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Birthday created successfully"
}
```

**Error:**

```json
{
  "success": false,
  "error": "Validation error",
  "details": [{ "field": "name", "message": "Name is required" }]
}
```

---

## 📊 Data Models

### User Model

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,           // Unique
  password: string,        // Hashed with bcrypt
  createdAt: Date,
  updatedAt: Date
}
```

### Birthday Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId,        // Reference to User
  name: string,            // Person's name
  date: Date,              // Birthday date
  email?: string,          // Optional for sending wishes
  phone?: string,          // Optional
  notes?: string,          // Optional notes
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 UI/UX Design Principles

### 1. Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### 2. Accessibility (a11y)

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)

### 3. Loading States

- Skeleton loaders
- Spinners for actions
- Optimistic updates

### 4. Error Handling

- Toast notifications
- Inline form errors
- Retry mechanisms

### 5. Dark Mode (Optional)

```javascript
// Tailwind dark mode
<div className="bg-white dark:bg-gray-900">
```

---

## 🐛 Error Handling Strategy

### Frontend

```typescript
// React Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['birthdays'],
  queryFn: fetchBirthdays,
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### Backend

```typescript
// Global error middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message,
  });
});
```

---

## 📝 Development Workflow

### 1. Local Development

```bash
# Start all services
docker-compose up

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# MongoDB:  localhost:27017
```

### 2. Hot Reload

- Frontend: Vite HMR (instant)
- Backend: Nodemon (auto-restart)
- Database: Volume-mounted (persists)

### 3. Debugging

```json
// VS Code launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Node",
  "port": 9229
}
```

---

## 🚢 Deployment Strategy (Production)

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render/Fly.io)

```dockerfile
# Use Dockerfile.prod
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Database (MongoDB Atlas)

- Free tier available
- Automatic backups
- Global clusters

---

## ⚡ Quick Start Commands

```bash
# Development (one command!)
docker-compose up

# Stop services
docker-compose down

# Reset database
docker-compose down -v

# View logs
docker-compose logs -f server

# Access MongoDB
mongosh mongodb://admin:admin123@localhost:27017/birthday_app?authSource=admin
```

---

## 🎓 Interview Talking Points

### 1. Scalability

- Stateless JWT auth → Horizontal scaling
- MongoDB sharding for large datasets
- React Query caching → Reduced API calls

### 2. Maintainability

- TypeScript → Catch errors early
- Modular structure → Easy to navigate
- Zod schemas → Single source of validation

### 3. Developer Experience

- Docker → Consistent environment
- Hot reload → Fast iteration
- Clear folder structure → Easy onboarding

### 4. Production Readiness

- Health checks → Monitoring
- Error handling → Graceful degradation
- Environment variables → Configuration management
- Logging → Debugging in production

### 5. Trade-offs Made

- MongoDB over PostgreSQL → Faster development
- REST over GraphQL → Simpler, easier to review
- Docker Compose over K8s → Right-sized complexity
- JWT over sessions → Stateless, scalable
- ENV vars in docker-compose → Reviewer convenience (noted for production change)

---

## 📚 Resources & Documentation

### Official Docs

- React: https://react.dev
- Vite: https://vitejs.dev
- Express: https://expressjs.com
- MongoDB: https://www.mongodb.com/docs
- Mongoose: https://mongoosejs.com
- React Query: https://tanstack.com/query
- Zod: https://zod.dev
- shadcn/ui: https://ui.shadcn.com
- Tailwind: https://tailwindcss.com

### Learning Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs
- Docker Docs: https://docs.docker.com
- JWT.io: https://jwt.io

---

## ✅ Project Status Checklist

### Phase 1: Setup ✅

- [x] Project structure
- [x] Docker configuration
- [x] TypeScript configuration
- [x] Design documentation

### Phase 2: Backend ✅

- [x] MongoDB models
- [x] Authentication endpoints
- [x] Birthday CRUD endpoints
- [x] Validation middleware
- [x] Error handling
- [x] Health check endpoint

### Phase 3: Frontend ✅

- [x] React app setup
- [x] shadcn/ui components
- [x] Authentication pages
- [x] Dashboard page
- [x] Calendar view
- [x] API integration

### Phase 4: Optional Features ✅

- [x] Email integration (Nodemailer)
- [x] Multiple tabs (Today, This Month, All)
- [x] Birthday wishes (once per year)
- [x] Test data creation scripts

### Phase 5: Polish ✅

- [x] Testing setup
- [x] Comprehensive documentation
- [x] Code cleanup
- [x] README with setup instructions

---

## 🎯 Success Criteria

**Functional Requirements:**

- ✅ User can register and login
- ✅ User can add/edit/delete birthdays
- ✅ User can view calendar of birthdays
- ✅ User can filter today's birthdays
- ✅ User can send birthday wishes

**Technical Requirements:**

- ✅ TypeScript throughout
- ✅ Responsive design
- ✅ Error handling
- ✅ Input validation
- ✅ Authentication/authorization

**Interview Criteria:**

- ✅ Clean, readable code
- ✅ Proper project structure
- ✅ Good design decisions
- ✅ Documentation
- ✅ Easy to run (docker-compose up)

---

**End of Design Document**

_Last Updated: 2025-11-03_
_Author: Yanki Markovich_
_Purpose: Tech Lead Position Interview Assignment_
