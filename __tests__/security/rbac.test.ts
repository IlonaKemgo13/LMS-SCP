/**
 * Role-based access control tests.
 * Tests proxy.ts routing logic with mocked Supabase.
 * @jest-environment node
 */

// Mock @supabase/ssr BEFORE importing proxy.ts
const mockGetUser = jest.fn()
const mockProfileSingle = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockImplementation(() => ({
    auth: { getUser: mockGetUser },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockProfileSingle,
    }),
  })),
}))

import { proxy } from '@/proxy'

function makeNextRequest(pathname: string) {
  // Build a minimal NextRequest-compatible object using the real NextRequest
  // Only works in node environment where Request is available from undici/next
  const { NextRequest } = jest.requireActual('next/server') as typeof import('next/server')
  const url = `http://localhost${pathname}`
  return new NextRequest(url, { method: 'GET' })
}

function setUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
}

function setUserWithRole(role: string) {
  const userId = 'test-user-id'
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
  mockProfileSingle.mockResolvedValue({ data: { role }, error: null })
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
})

// ── Unauthenticated access ────────────────────────────────────────────────────
describe('Proxy — unauthenticated access', () => {
  it('allows access to "/" (login page) without auth', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/')
    const res = await proxy(req)
    expect(res.status).not.toBe(401)
  })

  it('allows access to "/reset-password" without auth', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/reset-password')
    const res = await proxy(req)
    expect(res.status).not.toBe(401)
    const location = res.headers.get('location')
    if (location) {
      expect(location).not.toContain('/admin')
      expect(location).not.toContain('/teacher')
    }
  })

  it('returns 401 for API routes when unauthenticated', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/api/admin/users')
    const res = await proxy(req)
    expect(res.status).toBe(401)
  })

  it('redirects unauthenticated users away from /admin to login', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/admin')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    const location = res.headers.get('location')
    expect(location).toMatch(/\/$/)
  })

  it('redirects unauthenticated users away from /teacher to login', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/teacher')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
  })

  it('redirects unauthenticated users away from /student-dashboard to login', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/student-dashboard')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
  })

  it('redirects unauthenticated users away from /dashboard/parent to login', async () => {
    setUnauthenticated()
    const req = makeNextRequest('/dashboard/parent')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
  })
})

// ── Student role guards ───────────────────────────────────────────────────────
describe('Proxy — student role guards', () => {
  it('blocks student from /admin page (redirects)', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/admin')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    const location = res.headers.get('location') ?? ''
    expect(location).not.toContain('/admin')
  })

  it('blocks student from /api/admin/* with 403', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/api/admin/users')
    const res = await proxy(req)
    expect(res.status).toBe(403)
  })

  it('blocks student from /teacher page', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/teacher')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
  })

  it('blocks student from /api/teacher/* with 403', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/api/teacher/grades')
    const res = await proxy(req)
    expect(res.status).toBe(403)
  })

  it('allows student to access /student-dashboard', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/student-dashboard')
    const res = await proxy(req)
    expect(res.status).not.toBe(403)
    const location = res.headers.get('location') ?? ''
    if (location) {
      expect(location).toContain('/student')
    }
  })

  it('blocks student from /dashboard/parent', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/dashboard/parent')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
  })
})

// ── Teacher role guards ───────────────────────────────────────────────────────
describe('Proxy — teacher role guards', () => {
  it('blocks teacher from /admin page', async () => {
    setUserWithRole('teacher')
    const req = makeNextRequest('/admin')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    const location = res.headers.get('location') ?? ''
    expect(location).not.toContain('/admin')
  })

  it('blocks teacher from /api/admin/* with 403', async () => {
    setUserWithRole('teacher')
    const req = makeNextRequest('/api/admin/users')
    const res = await proxy(req)
    expect(res.status).toBe(403)
  })

  it('allows teacher to access /teacher', async () => {
    setUserWithRole('teacher')
    const req = makeNextRequest('/teacher')
    const res = await proxy(req)
    expect(res.status).not.toBe(403)
    const location = res.headers.get('location') ?? ''
    expect(location).not.toContain('/admin')
    expect(location).not.toContain('/student')
  })
})

// ── Admin role guards ─────────────────────────────────────────────────────────
describe('Proxy — admin role guards', () => {
  it('blocks admin from /student-dashboard', async () => {
    setUserWithRole('admin')
    const req = makeNextRequest('/student-dashboard')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    const location = res.headers.get('location') ?? ''
    expect(location).not.toContain('/student')
  })

  it('blocks admin from /api/student/* with 403', async () => {
    setUserWithRole('admin')
    const req = makeNextRequest('/api/student/dashboard')
    const res = await proxy(req)
    expect(res.status).toBe(403)
  })

  it('allows admin to access /admin', async () => {
    setUserWithRole('admin')
    const req = makeNextRequest('/admin')
    const res = await proxy(req)
    expect(res.status).not.toBe(403)
    expect(res.status).not.toBe(401)
  })
})

// ── Parent role guards ────────────────────────────────────────────────────────
describe('Proxy — parent role guards', () => {
  it('blocks parent from /teacher/* with redirect', async () => {
    setUserWithRole('parent')
    const req = makeNextRequest('/teacher')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    const location = res.headers.get('location') ?? ''
    expect(location).not.toContain('/teacher')
  })

  it('blocks parent from /api/teacher/* with 403', async () => {
    setUserWithRole('parent')
    const req = makeNextRequest('/api/teacher/grades')
    const res = await proxy(req)
    expect(res.status).toBe(403)
  })

  it('allows parent to access /dashboard/parent', async () => {
    setUserWithRole('parent')
    const req = makeNextRequest('/dashboard/parent')
    const res = await proxy(req)
    expect(res.status).not.toBe(403)
    expect(res.status).not.toBe(401)
  })
})

// ── Authenticated user on login page ─────────────────────────────────────────
describe('Proxy — authenticated user hits login page', () => {
  it('redirects admin to /admin when hitting "/"', async () => {
    setUserWithRole('admin')
    const req = makeNextRequest('/')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('/admin')
  })

  it('redirects student to /student-dashboard when hitting "/"', async () => {
    setUserWithRole('student')
    const req = makeNextRequest('/')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('/student-dashboard')
  })

  it('redirects teacher to /teacher when hitting "/"', async () => {
    setUserWithRole('teacher')
    const req = makeNextRequest('/')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('/teacher')
  })

  it('redirects parent to /dashboard/parent when hitting "/"', async () => {
    setUserWithRole('parent')
    const req = makeNextRequest('/')
    const res = await proxy(req)
    expect([301, 302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('/dashboard/parent')
  })
})
