/**
 * Tests for /api/student/dashboard route
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

const STUDENT_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

// ── Mock requireAuth ──────────────────────────────────────────────────────────
const mockRequireAuth = jest.fn()
jest.mock('@/lib/api-helpers', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  validationError: (issues: { message: string }[]) =>
    NextResponse.json({ error: issues.map((i) => i.message).join(', ') }, { status: 400 }),
}))

import { GET } from '@/app/api/student/dashboard/route'

function makeStudentAuth(supabase: unknown = null) {
  return {
    ok: true as const,
    userId: STUDENT_UUID,
    role: 'student',
    supabase: supabase || makeDefaultSupabase(),
  }
}

function makeDefaultSupabase() {
  const mockProfile = {
    id: STUDENT_UUID,
    full_name: 'Test Student',
    email: 'student@ex.com',
    role: 'student',
    avatar_url: null,
  }
  const mockEnrollments = [
    { course_id: 'course-1', courses: { id: 'course-1', title: 'Math', teacher_id: 't1', profiles: { full_name: 'Teacher A' } } },
  ]
  const mockAnnouncements = [
    { id: 'a1', title: 'Notice', content: 'Text', deadline: null, created_at: '2026-01-01', course_id: null },
  ]
  const mockGrades = [
    { id: 'g1', assessment_type: 'exam', score: 80, max_score: 100, created_at: '2026-01-01', course_id: 'course-1' },
  ]

  return {
    from: jest.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockProfile }),
            }),
          }),
        }
      }
      if (table === 'enrollments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: mockEnrollments, error: null }),
          }),
        }
      }
      if (table === 'announcements') {
        return {
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: mockAnnouncements, error: null }),
            }),
          }),
        }
      }
      if (table === 'grades') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: mockGrades, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'recordings') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ count: 3, data: null, error: null }),
          }),
        }
      }
      return {}
    }),
  }
}

beforeEach(() => jest.clearAllMocks())

describe('GET /api/student/dashboard', () => {
  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 when not a student', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    })
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns 200 with correct structure for authenticated student', async () => {
    mockRequireAuth.mockResolvedValue(makeStudentAuth())
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('profile')
    expect(body).toHaveProperty('enrollments')
    expect(body).toHaveProperty('announcements')
    expect(body).toHaveProperty('recentGrades')
    expect(body).toHaveProperty('recordingCount')
  })

  it('returns profile data in response', async () => {
    mockRequireAuth.mockResolvedValue(makeStudentAuth())
    const res = await GET()
    const body = await res.json()
    expect(body.profile).not.toBeNull()
    expect(body.profile.full_name).toBe('Test Student')
  })

  it('returns enrollments array', async () => {
    mockRequireAuth.mockResolvedValue(makeStudentAuth())
    const res = await GET()
    const body = await res.json()
    expect(Array.isArray(body.enrollments)).toBe(true)
  })

  it('returns announcements array', async () => {
    mockRequireAuth.mockResolvedValue(makeStudentAuth())
    const res = await GET()
    const body = await res.json()
    expect(Array.isArray(body.announcements)).toBe(true)
  })

  it('returns recentGrades array', async () => {
    mockRequireAuth.mockResolvedValue(makeStudentAuth())
    const res = await GET()
    const body = await res.json()
    expect(Array.isArray(body.recentGrades)).toBe(true)
  })

  it('returns recordingCount as number', async () => {
    mockRequireAuth.mockResolvedValue(makeStudentAuth())
    const res = await GET()
    const body = await res.json()
    expect(typeof body.recordingCount).toBe('number')
  })

  it('returns empty arrays and zero count when no data', async () => {
    const emptySupabase = {
      from: jest.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }
        }
        if (table === 'enrollments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }
        }
        if (table === 'announcements') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }
        }
        if (table === 'grades') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }
        }
        return {}
      }),
    }
    mockRequireAuth.mockResolvedValue(makeStudentAuth(emptySupabase))
    const res = await GET()
    const body = await res.json()
    expect(body.enrollments).toEqual([])
    expect(body.announcements).toEqual([])
    expect(body.recentGrades).toEqual([])
    expect(body.recordingCount).toBe(0)
  })
})
