import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export types for TypeScript
export type Profile = {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  created: string
}

export type Course = {
  id: string
  name: string
  description: string
  teacher_id: string
}

export type Grade = {
  id: string
  student_id: string
  course_id: string
  grade: number
  created_at: string
}

export type ParentStudentLink = {
  id: string
  parent_id: string
  student_id: string
  status: string
}