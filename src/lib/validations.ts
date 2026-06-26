import { z } from "zod"

export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password:     z.string().min(8, "Password must be at least 8 characters"),
})

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role:     z.enum(["admin", "teacher", "student", "parent"]),
})

export const updateUserSchema = z.object({
  id:       z.string().uuid("Invalid user ID"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email:    z.string().email("Invalid email address"),
  role:     z.enum(["admin", "teacher", "student", "parent", "disabled"]),
})

export const disableUserSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
})

export const createCourseSchema = z.object({
  title:      z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  code:       z.string().optional(),
  teacher_id: z.string().uuid("Invalid teacher ID"),
})

export const createEnrollmentSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  course_id:  z.string().uuid("Invalid course ID"),
})

export const createParentLinkSchema = z.object({
  parent_id:  z.string().uuid("Invalid parent ID"),
  student_id: z.string().uuid("Invalid student ID"),
})

export const createGradeSchema = z.object({
  student_id:      z.string().uuid("Invalid student ID"),
  course_id:       z.string().uuid("Invalid course ID"),
  assessment_name: z.string().min(1, "Assessment name is required"),
  assessment_type: z.string().min(1, "Assessment type is required"),
  score:           z.number().min(0).max(10000),
  max_score:       z.number().min(1).max(10000),
})

export const updateGradeSchema = z.object({
  id:              z.string().uuid("Invalid grade ID"),
  assessment_type: z.string().min(1, "Assessment type is required").optional(),
  score:           z.number().min(0).max(10000).optional(),
  max_score:       z.number().min(1).max(10000).optional(),
})

export const createAnnouncementSchema = z.object({
  title:       z.string().min(2, "Title must be at least 2 characters"),
  content:     z.string().optional(),
  deadline:    z.string().optional(),
  course_id:   z.string().uuid("Invalid course ID").optional(),
  target_role: z.string().optional(),
  is_global:   z.boolean().optional(),
})

export const updateAnnouncementSchema = z.object({
  id:       z.string().uuid("Invalid announcement ID"),
  title:    z.string().min(2, "Title must be at least 2 characters").optional(),
  content:  z.string().optional(),
  deadline: z.string().optional(),
})

export const materialMetadataSchema = z.object({
  title:     z.string().min(2, "Title must be at least 2 characters"),
  course_id: z.string().uuid("Invalid course ID"),
})

export const recordingMetadataSchema = z.object({
  title:     z.string().min(2, "Title must be at least 2 characters"),
  course_id: z.string().uuid("Invalid course ID"),
})

export const paginationSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
})

export type LoginInput            = z.infer<typeof loginSchema>
export type ChangePasswordInput   = z.infer<typeof changePasswordSchema>
export type CreateUserInput       = z.infer<typeof createUserSchema>
export type UpdateUserInput       = z.infer<typeof updateUserSchema>
export type CreateCourseInput     = z.infer<typeof createCourseSchema>
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
export type CreateParentLinkInput = z.infer<typeof createParentLinkSchema>
export type CreateGradeInput      = z.infer<typeof createGradeSchema>
export type UpdateGradeInput      = z.infer<typeof updateGradeSchema>
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
