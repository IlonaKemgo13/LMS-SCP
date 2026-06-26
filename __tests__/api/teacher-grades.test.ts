/**
 * Tests for /api/teacher/grades route
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

const VALID_UUID   = '123e4567-e89b-12d3-a456-426614174000'
const TEACHER_UUID = '123e4567-e89b-12d3-8888-000000000001'
const COURSE_UUID  = '123e4567-e89b-12d3-8888-000000000002'
const STUDENT_UUID = '123e4567-e89b-12d3-8888-000000000003'

// ── Mock requireAuth ──────────────────────────────────────────────────────────
const mockRequireAuth = jest.fn()
jest.mock('@/lib/api-helpers', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  validationError: (issues: { message: string }[]) =>
    NextResponse.json({ error: issues.map((i) => i.message).join(', ') }, { status: 400 }),
}))

// ── Supabase client mock ──────────────────────────────────────────────────────
const mockCoursesQuery = jest.fn()
const mockGradesInsert = jest.fn()
const mockGradesSelect = jest.fn()

/** Build a chainable .eq().eq().single() mock for the courses table */
function makeCoursesMock(owns: boolean) {
  const coursesSingle = jest.fn().mockResolvedValue(
    owns ? { data: { id: COURSE_UUID } } : { data: null }
  )
  // Use a factory so each .eq() call returns the same chainable object
  function eqFn() {
    return { eq: jest.fn().mockImplementation(eqFn), single: coursesSingle }
  }
  const firstEq = jest.fn().mockImplementation(eqFn)
  const coursesSelect = jest.fn().mockReturnValue({ eq: firstEq })
  return { select: coursesSelect }
}

function makeTeacherAuth(owns: boolean = true) {
  const gradesInsertFn = jest.fn().mockResolvedValue({ data: null, error: null })

  const gradesSelectSingle = jest.fn().mockResolvedValue({ data: { course_id: COURSE_UUID } })
  const gradesSelectEq = jest.fn().mockReturnValue({ single: gradesSelectSingle })
  const gradesSelectFn = jest.fn().mockReturnValue({ eq: gradesSelectEq })

  const gradesUpdateEq = jest.fn().mockResolvedValue({ data: null, error: null })
  const gradesUpdateFn = jest.fn().mockReturnValue({ eq: gradesUpdateEq })

  const supabase = {
    from: jest.fn().mockImplementation((table: string) => {
      if (table === 'courses') return makeCoursesMock(owns)
      if (table === 'grades') return {
        insert: gradesInsertFn,
        select: gradesSelectFn,
        update: gradesUpdateFn,
      }
      return {}
    }),
  }

  return {
    ok: true as const,
    userId: TEACHER_UUID,
    role: 'teacher',
    supabase,
  }
}

import { POST, PATCH } from '@/app/api/teacher/grades/route'

function makeRequest(method: string, body: unknown): Request {
  return new Request(`http://localhost/api/teacher/grades`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => jest.clearAllMocks())

// ── POST tests ────────────────────────────────────────────────────────────────
describe('POST /api/teacher/grades', () => {
  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const res = await POST(makeRequest('POST', {}))
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated as non-teacher', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    })
    const res = await POST(makeRequest('POST', {}))
    expect(res.status).toBe(403)
  })

  it('returns 400 on missing required fields', async () => {
    mockRequireAuth.mockResolvedValue(makeTeacherAuth())
    const res = await POST(makeRequest('POST', { student_id: STUDENT_UUID }))
    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid UUID in student_id', async () => {
    mockRequireAuth.mockResolvedValue(makeTeacherAuth())
    const res = await POST(makeRequest('POST', {
      student_id: 'not-a-uuid',
      course_id: COURSE_UUID,
      assessment_name: 'Midterm',
      assessment_type: 'exam',
      score: 80,
      max_score: 100,
    }))
    expect(res.status).toBe(400)
  })

  it('returns 403 if teacher does not own the course', async () => {
    mockRequireAuth.mockResolvedValue(makeTeacherAuth(false))

    const res = await POST(makeRequest('POST', {
      student_id: STUDENT_UUID,
      course_id: COURSE_UUID,
      assessment_name: 'Quiz',
      assessment_type: 'quiz',
      score: 9,
      max_score: 10,
    }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/not assigned/i)
  })

  it('creates grade successfully when teacher owns course', async () => {
    const auth = makeTeacherAuth(true)
    // Override the grades insert to succeed (already done by makeTeacherAuth)
    mockRequireAuth.mockResolvedValue(auth)

    const res = await POST(makeRequest('POST', {
      student_id: STUDENT_UUID,
      course_id: COURSE_UUID,
      assessment_name: 'Final Exam',
      assessment_type: 'exam',
      score: 90,
      max_score: 100,
    }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})

// ── PATCH tests ───────────────────────────────────────────────────────────────
describe('PATCH /api/teacher/grades', () => {
  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const req = new Request('http://localhost/api/teacher/grades', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 on missing id', async () => {
    mockRequireAuth.mockResolvedValue(makeTeacherAuth())
    const req = new Request('http://localhost/api/teacher/grades', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 80 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when grade not found', async () => {
    const auth = makeTeacherAuth()
    auth.supabase.from = jest.fn().mockImplementation((table: string) => {
      if (table === 'grades') {
        const single = jest.fn().mockResolvedValue({ data: null })
        const eq = jest.fn().mockReturnValue({ single })
        return { select: jest.fn().mockReturnValue({ eq }) }
      }
      return {}
    })
    mockRequireAuth.mockResolvedValue(auth)

    const req = new Request('http://localhost/api/teacher/grades', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: VALID_UUID, score: 80 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(404)
  })
})
