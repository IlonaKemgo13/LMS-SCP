# LMS-SCP — QA, Security, Performance & Test Audit Report

**Date:** 2026-05-28  
**Branch:** `4-authentication`  
**Framework:** Next.js 16 (App Router), TypeScript, Supabase  
**Test runner:** Jest 29 + Testing Library  

---

## 1. Test Suite Summary

| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Zod schema validation | `__tests__/lib/validations.test.ts` | 37 | PASS |
| Auth context hook | `__tests__/lib/auth-context.test.tsx` | 6 | PASS |
| Admin users API | `__tests__/api/admin-users.test.ts` | 23 | PASS |
| Teacher grades API | `__tests__/api/teacher-grades.test.ts` | 9 | PASS |
| Student dashboard API | `__tests__/api/student-dashboard.test.ts` | 11 | PASS |
| Change-password API | `__tests__/api/auth-change-password.test.ts` | 12 | PASS |
| RBAC proxy logic | `__tests__/security/rbac.test.ts` | 29 | PASS |
| Input validation / XSS / SQLi | `__tests__/security/input-validation.test.ts` | 24 | PASS |
| Login page component | `__tests__/components/LoginPage.test.tsx` | 12 | PASS |
| Student dashboard component | `__tests__/components/StudentDashboard.test.tsx` | 11 | PASS |
| **Total** | | **169** | **ALL PASS** |

### Coverage

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| All files (combined) | 83% | 82% | 74% | 83% |
| `src/lib/validations.ts` | 100% | 100% | 100% | 100% |
| `src/app/api/auth/change-password/route.ts` | 100% | 91% | 100% | 100% |
| `src/app/api/student/dashboard/route.ts` | 100% | 82% | 100% | 100% |
| `src/app/api/admin/users/route.ts` | 92% | 82% | 100% | 91% |
| `src/proxy.ts` | 87% | 96% | 43% | 85% |
| `src/app/api/teacher/grades/route.ts` | 81% | 67% | 100% | 78% |
| `src/lib/auth-context.tsx` | 81% | 43% | 73% | 83% |
| `src/app/page.tsx` (Login) | 65% | 68% | 64% | 65% |

---

## 2. How to Run Tests

### Unit & Integration Tests (Jest)
```bash
npm test
# or with coverage
npm test -- --coverage
# run a specific file
npx jest __tests__/api/admin-users.test.ts
```

### Load Test (standalone Node.js — no deps required)
```bash
node __tests__/load/load-test.js
```
Configure the base URL via `BASE_URL` env var (default: `http://localhost:3000`).

---

## 3. Security Findings

### 3.1 RBAC — Proxy Middleware (proxy.ts)

| Finding | Severity | Location |
|---------|----------|----------|
| `/api/auth/*` routes are accessible by any authenticated role with no role check | Medium | `src/proxy.ts:119` |
| Unauthenticated requests to unknown API routes fall through proxy without explicit handling | Low | `src/proxy.ts:48-54` |
| No CSRF protection on state-mutating API routes (POST/PATCH/DELETE) | Medium | All API routes |

**Detail:** The proxy correctly enforces role-based guards for `/admin`, `/teacher`, `/student-*`, and `/dashboard/parent` paths. However, `/api/auth/change-password` is reachable by any authenticated user regardless of role, which is acceptable but should be documented. There is no explicit CSRF token validation — Supabase cookie-based auth is same-origin by default, but explicit `Origin` header checking would harden this.

**Recommendation:** Add `Origin` header validation to state-mutating API routes, or enable SameSite=Strict on auth cookies.

### 3.2 Input Validation

| Finding | Severity | Location |
|---------|----------|----------|
| Zod validates all schema inputs; XSS/SQLi strings are rejected on UUID fields | Pass | `src/lib/validations.ts` |
| Free-text fields (`title`, `content`, `assessment_name`) accept HTML/script tags — no sanitisation | Medium | Multiple API routes |
| `password` field in `createUserSchema` minimum is 8 chars but no complexity requirement | Low | `src/lib/validations.ts:17` |

**Detail:** Zod schemas reject SQL injection in UUID fields because the UUID regex is strict (RFC4122). However, string fields like `title` and `content` accept arbitrary text including `<script>` tags. These values are likely rendered in React (which escapes by default), but stored raw in the database. If any page uses `dangerouslySetInnerHTML` or server-side rendering without escaping, XSS is possible.

**Recommendation:** Add a sanitisation step (e.g., DOMPurify or a strip-HTML function) before inserting `title`/`content` fields into the database.

### 3.3 Password Handling

| Finding | Severity | Location |
|---------|----------|----------|
| Change-password flow verifies old password via re-authentication (correct pattern) | Pass | `src/app/api/auth/change-password/route.ts` |
| Admin user creation sends plaintext password in JSON request body over HTTPS | Low | `src/app/api/admin/users/route.ts` |
| Passwords are never logged or returned in responses | Pass | All routes |

**Detail:** The change-password endpoint re-authenticates with the current password before updating — this is the correct approach. Passwords in the admin user-creation flow travel in the HTTP body (acceptable over TLS).

### 3.4 Secrets Exposure

| Finding | Severity | Location |
|---------|----------|----------|
| `.env.local` correctly excluded from git via `.gitignore` | Pass | `.gitignore` |
| `SUPABASE_SERVICE_ROLE_KEY` only imported in `src/lib/supabase/admin.ts` | Pass | `src/lib/supabase/admin.ts` |
| `createAdminClient()` is not guarded from accidental import in client components | Low | `src/lib/supabase/admin.ts` |

**Recommendation:** Add a `"server-only"` import at the top of `src/lib/supabase/admin.ts` to prevent accidental bundle inclusion in client code:
```ts
import "server-only"
```

---

## 4. Performance Findings

### 4.1 N+1 Query Risk

| Finding | Severity | Location |
|---------|----------|----------|
| `GET /api/admin/stats` fires 6 parallel COUNT queries — acceptable | Pass | `src/app/api/admin/stats/route.ts` |
| `GET /api/student/dashboard` fetches profile, enrollments, announcements, grades in parallel | Pass | `src/app/api/student/dashboard/route.ts` |
| No N+1 patterns detected in current API routes | Pass | All routes |

### 4.2 Missing Pagination / Unbounded Queries

| Finding | Severity | Location |
|---------|----------|----------|
| `GET /api/admin/users` (if it exists as a GET) has no pagination or row limit | High | `src/app/api/admin/users/route.ts` (no GET handler) |
| `GET /api/teacher/stats` fetches counts only — no unbounded select | Pass | `src/app/api/teacher/stats/route.ts` |
| Student/parent list routes use `paginationSchema` with `page_size` max 100 | Pass | Multiple routes |
| `GET /api/parent/children` has no limit on the number of parent-linked students returned | Low | `src/app/api/parent/children/route.ts` |

**Detail:** Most list endpoints correctly apply `.range()` using `paginationSchema`. The `/api/parent/children` route fetches all linked students in one query with no limit — for normal use this is fine, but a database trigger preventing >20 parent-links per parent would be a safe guardrail.

### 4.3 Slow Routes

| Finding | Severity | Location |
|---------|----------|----------|
| Change-password does two sequential Supabase calls (getUser + signInWithPassword) before updating | Low | `src/app/api/auth/change-password/route.ts` |
| No query indexes validated for `enrollments.student_id` or `grades.student_id` | Medium | Database (not in codebase) |

**Recommendation:** Ensure database indexes exist on: `enrollments(student_id)`, `grades(student_id)`, `grades(course_id)`, `parent_links(parent_id)`, `announcements(course_id)`.

---

## 5. QA Findings

### 5.1 Dead Code / Unused Variables

| Finding | Severity | Location |
|---------|----------|----------|
| `mockCoursesQuery`, `mockGradesInsert`, `mockGradesSelect` declared but unused (cleaned up) | Fixed | `__tests__/api/teacher-grades.test.ts` |
| `src/app/api/admin/create-user/` and `src/app/api/admin/update-user/` may be duplicate routes if `admin/users` handles POST/PATCH | Low | `src/app/api/admin/` |

### 5.2 Schema Mismatches

| Finding | Severity | Location |
|---------|----------|----------|
| `changePasswordSchema` uses snake_case (`current_password`, `new_password`) — consistent with API | Pass | `src/lib/validations.ts` |
| `paginationSchema` uses snake_case (`page_size`) — consistent with query params | Pass | `src/lib/validations.ts` |
| `updateUserSchema` accepts role `"disabled"` but `createUserSchema` does not — by design | Pass | `src/lib/validations.ts` |

### 5.3 Broken Flows

| Finding | Severity | Location |
|---------|----------|----------|
| After `signOut()`, `window.location.href = "/"` is called directly — prevents React state cleanup if re-render is needed | Low | `src/lib/auth-context.tsx:94` |
| Login page rate-limiter state is client-only: a page refresh resets the lockout counter | Medium | `src/app/page.tsx:20-22` |

**Detail on login lockout:** The 3-attempt lockout uses React `useState` — refreshing the page resets all counters. A server-side rate limiting mechanism (e.g., checking failed attempts in the database, or using a Redis-backed rate limiter in the proxy) would prevent bypass by page reload.

### 5.4 Error Handling

| Finding | Severity | Location |
|---------|----------|----------|
| All API routes return structured `{ error: string }` JSON on failure | Pass | All routes |
| Profile fetch failure in `requireAuth` returns 403 without logging the underlying DB error | Low | `src/lib/api-helpers.ts:29-32` |
| Teacher grade route returns generic 400 on DB insert failure — could leak error messages | Low | `src/app/api/teacher/grades/route.ts:49` |

---

## 6. Severity Summary Table

| # | Finding | Severity | File | Recommendation |
|---|---------|----------|------|----------------|
| 1 | Login lockout is client-side only — bypass via page refresh | Medium | `src/app/page.tsx` | Implement server-side rate limiting in proxy or dedicated endpoint |
| 2 | No CSRF protection on state-mutating routes | Medium | All API routes | Add `Origin` header check or SameSite=Strict cookie policy |
| 3 | Free-text fields stored raw — potential stored XSS | Medium | `src/lib/validations.ts` | Sanitise title/content before DB insert |
| 4 | Missing DB indexes on foreign key columns | Medium | Database schema | Add indexes on `enrollments.student_id`, `grades.student_id`, etc. |
| 5 | `createAdminClient` not guarded with `server-only` | Low | `src/lib/supabase/admin.ts` | Add `import "server-only"` |
| 6 | Password complexity enforcement is minimal (8 chars, no policy) | Low | `src/lib/validations.ts` | Enforce at least one uppercase, digit, or special char |
| 7 | `window.location.href = "/"` in signOut bypasses React routing | Low | `src/lib/auth-context.tsx` | Use `router.push("/")` from `next/navigation` instead |
| 8 | Supabase error messages forwarded to client in some 400 responses | Low | `src/app/api/teacher/grades/route.ts` | Return generic error message; log specifics server-side |
| 9 | `/api/parent/children` has no row limit | Low | `src/app/api/parent/children/route.ts` | Add `.limit(50)` or paginate |

---

## 7. Load Test

`__tests__/load/load-test.js` is a standalone Node.js script using only built-in `http`/`https` modules. It tests the application under simulated concurrent load:

- **Concurrency levels tested:** 50, 100, 200 simultaneous requests  
- **Endpoint tested:** Configurable via `BASE_URL` env variable (defaults to `http://localhost:3000`)  
- **Metrics reported:** Total requests, success rate, average response time, p95 response time, errors  

```bash
# Run against local dev server (start it first with `npm run dev`)
node __tests__/load/load-test.js

# Run against a deployed environment
BASE_URL=https://your-app.vercel.app node __tests__/load/load-test.js
```

**Note:** The load test is excluded from Jest runs (`testPathIgnorePatterns` in `jest.config.js`) because it is a standalone script, not a Jest test file.
