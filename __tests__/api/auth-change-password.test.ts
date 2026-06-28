/**
 * Tests for /api/auth/change-password route
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

const USER_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

// ── Mock requireAuth ──────────────────────────────────────────────────────────
const mockRequireAuth = jest.fn()
jest.mock('@/lib/api-helpers', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  validationError: (issues: { message: string }[]) =>
    NextResponse.json({ error: issues.map((i) => i.message).join(', ') }, { status: 400 }),
}))

// ── Mock createClient (server) for verify client ──────────────────────────────
const mockSignInWithPassword = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    })
  ),
}))

import { POST } from '@/app/api/auth/change-password/route'

function makeAuthenticatedUser(overrides: Partial<{
  signInError: unknown
  updateError: unknown
  getUserData: unknown
}> = {}) {
  const signInError = overrides.signInError ?? null
  const updateError = overrides.updateError ?? null
  const getUserData = overrides.getUserData ?? { user: { id: USER_UUID, email: 'test@example.com' } }

  mockSignInWithPassword.mockResolvedValue({
    data: signInError ? null : {},
    error: signInError,
  })

  return {
    ok: true as const,
    userId: USER_UUID,
    role: 'teacher',
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: getUserData }),
        updateUser: jest.fn().mockResolvedValue({ data: null, error: updateError }),
      },
    },
  }
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/auth/change-password', () => {
  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await POST(makeRequest({ current_password: 'old', new_password: 'newpass123' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when current_password is missing', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser())
    const res = await POST(makeRequest({ new_password: 'newpass123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when new_password is too short', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser())
    const res = await POST(makeRequest({ current_password: 'OldPass123', new_password: 'short' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/8 characters/i)
  })

  it('returns 400 when current_password is empty', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser())
    const res = await POST(makeRequest({ current_password: '', new_password: 'NewPass123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when current password is wrong', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser({
      signInError: { message: 'Invalid login credentials' },
    }))
    const res = await POST(makeRequest({ current_password: 'WrongOld123', new_password: 'NewPass123' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/incorrect/i)
  })

  it('returns 200 when current password is correct and new password meets requirements', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser())
    const res = await POST(makeRequest({ current_password: 'CorrectOld123', new_password: 'NewPass456!' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('returns 400 if user email cannot be retrieved', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser({
      getUserData: { user: null },
    }))
    const res = await POST(makeRequest({ current_password: 'OldPass123', new_password: 'NewPass123' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/identify user/i)
  })

  it('returns 400 if updateUser fails', async () => {
    mockRequireAuth.mockResolvedValue(makeAuthenticatedUser({
      updateError: { message: 'Update failed' },
    }))
    const res = await POST(makeRequest({ current_password: 'OldPass123', new_password: 'NewPass123' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Failed to update/i)
  })
})
