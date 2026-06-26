import {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  disableUserSchema,
  createCourseSchema,
  createEnrollmentSchema,
  createParentLinkSchema,
  createGradeSchema,
  updateGradeSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  materialMetadataSchema,
  recordingMetadataSchema,
  paginationSchema,
} from '@/lib/validations'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

// ─── loginSchema ────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.issues[0].message
      expect(msg).toMatch(/email/i)
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(false)
  })
})

// ─── changePasswordSchema ────────────────────────────────────────────────────
describe('changePasswordSchema', () => {
  it('accepts valid current and new passwords', () => {
    const result = changePasswordSchema.safeParse({
      current_password: 'OldPass123',
      new_password: 'NewPass123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty current_password', () => {
    const result = changePasswordSchema.safeParse({
      current_password: '',
      new_password: 'NewPass123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects new_password shorter than 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      current_password: 'OldPass123',
      new_password: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/8 characters/i)
    }
  })

  it('accepts new_password exactly 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      current_password: 'OldPass',
      new_password: '12345678',
    })
    expect(result.success).toBe(true)
  })
})

// ─── createUserSchema ────────────────────────────────────────────────────────
describe('createUserSchema', () => {
  const valid = {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'teacher' as const,
  }

  it('accepts valid user data', () => {
    expect(createUserSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects fullName shorter than 2 characters', () => {
    const result = createUserSchema.safeParse({ ...valid, fullName: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({ ...valid, email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = createUserSchema.safeParse({ ...valid, password: 'pass' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({ ...valid, role: 'superuser' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid roles', () => {
    for (const role of ['admin', 'teacher', 'student', 'parent']) {
      expect(createUserSchema.safeParse({ ...valid, role }).success).toBe(true)
    }
  })
})

// ─── updateUserSchema ────────────────────────────────────────────────────────
describe('updateUserSchema', () => {
  const valid = {
    id: VALID_UUID,
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    role: 'student' as const,
  }

  it('accepts valid update', () => {
    expect(updateUserSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects non-UUID id', () => {
    const result = updateUserSchema.safeParse({ ...valid, id: 'not-a-uuid' })
    expect(result.success).toBe(false)
    if (!result.success) {
      // Error message is "Invalid user ID"
      expect(result.error.issues[0].message).toMatch(/invalid/i)
    }
  })

  it('accepts "disabled" as role', () => {
    const result = updateUserSchema.safeParse({ ...valid, role: 'disabled' })
    expect(result.success).toBe(true)
  })
})

// ─── disableUserSchema ────────────────────────────────────────────────────────
describe('disableUserSchema', () => {
  it('accepts valid UUID', () => {
    expect(disableUserSchema.safeParse({ id: VALID_UUID }).success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    expect(disableUserSchema.safeParse({ id: 'bad-id' }).success).toBe(false)
  })

  it('rejects missing id', () => {
    expect(disableUserSchema.safeParse({}).success).toBe(false)
  })
})

// ─── createCourseSchema ──────────────────────────────────────────────────────
describe('createCourseSchema', () => {
  const valid = {
    title: 'Mathematics 101',
    teacher_id: VALID_UUID,
  }

  it('accepts minimal valid course', () => {
    expect(createCourseSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts course with description and code', () => {
    expect(createCourseSchema.safeParse({ ...valid, description: 'Intro', code: 'MATH101' }).success).toBe(true)
  })

  it('rejects title shorter than 2 characters', () => {
    expect(createCourseSchema.safeParse({ ...valid, title: 'X' }).success).toBe(false)
  })

  it('rejects invalid teacher_id', () => {
    expect(createCourseSchema.safeParse({ ...valid, teacher_id: 'not-uuid' }).success).toBe(false)
  })
})

// ─── createEnrollmentSchema ──────────────────────────────────────────────────
describe('createEnrollmentSchema', () => {
  it('accepts valid UUIDs', () => {
    const result = createEnrollmentSchema.safeParse({
      student_id: VALID_UUID,
      course_id: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid student_id', () => {
    expect(createEnrollmentSchema.safeParse({ student_id: 'bad', course_id: VALID_UUID }).success).toBe(false)
  })
})

// ─── createParentLinkSchema ──────────────────────────────────────────────────
describe('createParentLinkSchema', () => {
  it('accepts valid UUIDs', () => {
    expect(createParentLinkSchema.safeParse({ parent_id: VALID_UUID, student_id: VALID_UUID }).success).toBe(true)
  })

  it('rejects invalid parent_id', () => {
    expect(createParentLinkSchema.safeParse({ parent_id: 'bad', student_id: VALID_UUID }).success).toBe(false)
  })
})

// ─── createGradeSchema ───────────────────────────────────────────────────────
describe('createGradeSchema', () => {
  const valid = {
    student_id: VALID_UUID,
    course_id: VALID_UUID,
    assessment_name: 'Midterm',
    assessment_type: 'exam',
    score: 85,
    max_score: 100,
  }

  it('accepts valid grade', () => {
    expect(createGradeSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects score below 0', () => {
    expect(createGradeSchema.safeParse({ ...valid, score: -1 }).success).toBe(false)
  })

  it('rejects max_score below 1', () => {
    expect(createGradeSchema.safeParse({ ...valid, max_score: 0 }).success).toBe(false)
  })

  it('rejects score above 10000', () => {
    expect(createGradeSchema.safeParse({ ...valid, score: 10001 }).success).toBe(false)
  })

  it('rejects empty assessment_name', () => {
    expect(createGradeSchema.safeParse({ ...valid, assessment_name: '' }).success).toBe(false)
  })

  it('rejects invalid student_id UUID', () => {
    expect(createGradeSchema.safeParse({ ...valid, student_id: 'not-uuid' }).success).toBe(false)
  })
})

// ─── updateGradeSchema ───────────────────────────────────────────────────────
describe('updateGradeSchema', () => {
  it('accepts valid update with all optional fields', () => {
    const result = updateGradeSchema.safeParse({
      id: VALID_UUID,
      score: 90,
      max_score: 100,
      assessment_type: 'exam',
    })
    expect(result.success).toBe(true)
  })

  it('accepts update with only id (all others optional)', () => {
    expect(updateGradeSchema.safeParse({ id: VALID_UUID }).success).toBe(true)
  })

  it('rejects invalid UUID for id', () => {
    expect(updateGradeSchema.safeParse({ id: 'bad' }).success).toBe(false)
  })
})

// ─── createAnnouncementSchema ────────────────────────────────────────────────
describe('createAnnouncementSchema', () => {
  it('accepts minimal valid announcement', () => {
    expect(createAnnouncementSchema.safeParse({ title: 'Notice' }).success).toBe(true)
  })

  it('rejects title shorter than 2 characters', () => {
    expect(createAnnouncementSchema.safeParse({ title: 'X' }).success).toBe(false)
  })

  it('accepts full announcement with all fields', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Exam Notice',
      content: 'Exam on Friday',
      deadline: '2026-06-01',
      course_id: VALID_UUID,
      target_role: 'student',
      is_global: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid course_id UUID', () => {
    expect(createAnnouncementSchema.safeParse({ title: 'Notice', course_id: 'bad' }).success).toBe(false)
  })
})

// ─── updateAnnouncementSchema ────────────────────────────────────────────────
describe('updateAnnouncementSchema', () => {
  it('accepts valid update', () => {
    expect(updateAnnouncementSchema.safeParse({ id: VALID_UUID, title: 'Updated' }).success).toBe(true)
  })

  it('rejects non-UUID id', () => {
    expect(updateAnnouncementSchema.safeParse({ id: 'bad', title: 'Updated' }).success).toBe(false)
  })
})

// ─── materialMetadataSchema ──────────────────────────────────────────────────
describe('materialMetadataSchema', () => {
  it('accepts valid metadata', () => {
    expect(materialMetadataSchema.safeParse({ title: 'Lecture Notes', course_id: VALID_UUID }).success).toBe(true)
  })

  it('rejects title shorter than 2 characters', () => {
    expect(materialMetadataSchema.safeParse({ title: 'X', course_id: VALID_UUID }).success).toBe(false)
  })
})

// ─── recordingMetadataSchema ─────────────────────────────────────────────────
describe('recordingMetadataSchema', () => {
  it('accepts valid metadata', () => {
    expect(recordingMetadataSchema.safeParse({ title: 'Week 1 Recording', course_id: VALID_UUID }).success).toBe(true)
  })

  it('rejects invalid course_id', () => {
    expect(recordingMetadataSchema.safeParse({ title: 'Week 1', course_id: 'not-uuid' }).success).toBe(false)
  })
})

// ─── paginationSchema ────────────────────────────────────────────────────────
describe('paginationSchema', () => {
  it('accepts valid page and page_size', () => {
    const result = paginationSchema.safeParse({ page: '2', page_size: '10' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.page_size).toBe(10)
    }
  })

  it('uses defaults when no input provided', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.page_size).toBe(20)
    }
  })

  it('rejects page = 0', () => {
    expect(paginationSchema.safeParse({ page: '0' }).success).toBe(false)
  })

  it('rejects page_size > 100', () => {
    expect(paginationSchema.safeParse({ page_size: '101' }).success).toBe(false)
  })

  it('coerces string numbers', () => {
    const result = paginationSchema.safeParse({ page: '3', page_size: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
    }
  })
})
