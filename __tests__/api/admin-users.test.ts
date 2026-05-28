/**
 * Tests for /api/admin/users route
 * Mocks requireAuth and createAdminClient so no real DB calls are made.
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

// ── Mock requireAuth ──────────────────────────────────────────────────────────
const mockRequireAuth = jest.fn()
jest.mock('@/lib/api-helpers', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  validationError: (issues: { message: string }[]) =>
    NextResponse.json({ error: issues.map((i) => i.message).join(', ') }, { status: 400 }),
}))

// ── Mock createAdminClient ────────────────────────────────────────────────────
const mockAdminCreateUser = jest.fn()
const mockAdminUpdateUserById = jest.fn()
const mockAdminFrom = jest.fn()

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
        updateUserById: mockAdminUpdateUserById,
      },
    },
    from: mockAdminFrom,
  }),
}))

import { POST, PATCH, DELETE } from '@/app/api/admin/users/route'

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeAdminAuth() {
  return {
    ok: true as const,
    userId: VALID_UUID,
    role: 'admin',
    supabase: {} as never,
  }
}

function makeInsertChain(error: unknown = null) {
  return { insert: jest.fn().mockResolvedValue({ data: null, error }) }
}

function makeUpdateChain(error: unknown = null) {
  const updateBuilder = {
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ data: null, error }),
  }
  return updateBuilder
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── POST tests ────────────────────────────────────────────────────────────────
describe('POST /api/admin/users', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const res = await POST(makeRequest({}))
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated as non-admin', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    })

    const res = await POST(makeRequest({}))
    expect(res.status).toBe(403)
  })

  it('returns 400 on missing required fields', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())

    const res = await POST(makeRequest({ email: 'bad' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid email', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())

    const res = await POST(makeRequest({
      fullName: 'Test User',
      email: 'not-an-email',
      password: 'password123',
      role: 'student',
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 if password too short', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())

    const res = await POST(makeRequest({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'short',
      role: 'student',
    }))
    expect(res.status).toBe(400)
  })

  it('creates user successfully', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())
    mockAdminCreateUser.mockResolvedValue({ data: { user: { id: 'new-uid' } }, error: null })
    mockAdminFrom.mockReturnValue(makeInsertChain(null))

    const res = await POST(makeRequest({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: 'teacher',
    }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 400 if admin.auth.createUser fails', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())
    mockAdminCreateUser.mockResolvedValue({ data: null, error: { message: 'Email already exists' } })

    const res = await POST(makeRequest({
      fullName: 'User',
      email: 'dup@example.com',
      password: 'password123',
      role: 'student',
    }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Email already exists')
  })
})

// ── PATCH tests ───────────────────────────────────────────────────────────────
describe('PATCH /api/admin/users', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const req = new Request('http://localhost/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 on invalid UUID', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())

    const req = new Request('http://localhost/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'not-uuid', fullName: 'X', email: 'x@x.com', role: 'student' }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it('updates user successfully', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())
    mockAdminUpdateUserById.mockResolvedValue({ error: null })

    const updateChain = makeUpdateChain(null)
    mockAdminFrom.mockReturnValue(updateChain)

    const req = new Request('http://localhost/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: VALID_UUID, fullName: 'Updated Name', email: 'upd@ex.com', role: 'teacher' }),
    })
    const res = await PATCH(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})

// ── DELETE tests ──────────────────────────────────────────────────────────────
describe('DELETE /api/admin/users', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const req = new Request('http://localhost/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 on invalid UUID', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())

    const req = new Request('http://localhost/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'bad-id' }),
    })
    const res = await DELETE(req)
    expect(res.status).toBe(400)
  })

  it('disables user successfully (sets role to disabled)', async () => {
    mockRequireAuth.mockResolvedValue(makeAdminAuth())

    const updateChain = makeUpdateChain(null)
    mockAdminFrom.mockReturnValue(updateChain)

    const req = new Request('http://localhost/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: VALID_UUID }),
    })
    const res = await DELETE(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
