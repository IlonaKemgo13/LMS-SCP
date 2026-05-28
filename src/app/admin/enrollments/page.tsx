"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { createClient } from "@/lib/supabase/client"

type Student = {
  id: string
  full_name: string
  email: string
}

type Course = {
  id: string
  title: string
  code: string | null
  description?: string | null
}

type Enrollment = {
  id: string
  student_id: string
  course_id: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  } | null
  courses: Course | null
}

const AVATAR_COLORS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#3b82f6", to: "#6366f1" },
  { from: "#10b981", to: "#0891b2" },
]

const COURSE_COLORS = [
  {
    from: "#7c3aed",
    to: "#a78bfa",
    bg: "#f5f3ff",
    text: "#6d28d9",
    ring: "#ddd6fe",
  },
  {
    from: "#0891b2",
    to: "#22d3ee",
    bg: "#f0fdfa",
    text: "#0f766e",
    ring: "#99f6e4",
  },
  {
    from: "#f43f5e",
    to: "#fb7185",
    bg: "#fff1f2",
    text: "#be123c",
    ring: "#fecdd3",
  },
  {
    from: "#f59e0b",
    to: "#fcd34d",
    bg: "#fffbeb",
    text: "#b45309",
    ring: "#fde68a",
  },
  {
    from: "#3b82f6",
    to: "#93c5fd",
    bg: "#eff6ff",
    text: "#1d4ed8",
    ring: "#bfdbfe",
  },
  {
    from: "#10b981",
    to: "#6ee7b7",
    bg: "#f0fdf4",
    text: "#065f46",
    ring: "#a7f3d0",
  },
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function courseColor(title: string) {
  return COURSE_COLORS[title.charCodeAt(0) % COURSE_COLORS.length]
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminEnrollmentsPage() {
  const supabase = createClient()

  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all")

  const [studentId, setStudentId] = useState("")
  const [courseId, setCourseId] = useState("")

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null)

  const [studentCourses, setStudentCourses] = useState<Enrollment[]>([])
  const [studentCoursesLoading, setStudentCoursesLoading] =
    useState(false)

  useEffect(() => {
    fetchStudents()
    fetchCourses()
    fetchEnrollments()
  }, [])

  async function fetchStudents() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student")
      .order("full_name")

    setStudents(data || [])
  }

  async function fetchCourses() {
    const { data } = await supabase
      .from("courses")
      .select("id, title, code, description")
      .order("title")

    setCourses(data || [])
  }

  async function fetchEnrollments() {
    setLoading(true)

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        course_id,
        created_at,
        profiles!enrollments_student_id_fkey (
          full_name,
          email
        ),
        courses!enrollments_course_id_fkey (
          id,
          title,
          code,
          description
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEnrollments(data as unknown as Enrollment[])
    }

    setLoading(false)
  }

  function closeModal() {
    setStudentId("")
    setCourseId("")
    setShowModal(false)
  }

  async function addEnrollment() {
    if (!studentId || !courseId) {
      toast.error("Please select a student and course.")
      return
    }

    setSaving(true)

    const res  = await fetch("/api/admin/enrollments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ student_id: studentId, course_id: courseId }),
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || "Failed to add enrollment.")
      setSaving(false)
      return
    }

    toast.success("Student enrolled!")
    await fetchEnrollments()
    setSaving(false)
    closeModal()
  }

  async function openStudentCourses(student: Student) {
    setSelectedStudent(student)
    setStudentCourses([])
    setStudentCoursesLoading(true)

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        course_id,
        created_at,
        profiles!enrollments_student_id_fkey (
          full_name,
          email
        ),
        courses!enrollments_course_id_fkey (
          id,
          title,
          code,
          description
        )
      `)
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setStudentCourses(data as unknown as Enrollment[])
    }

    setStudentCoursesLoading(false)
  }

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const search = searchTerm.toLowerCase()

      const matchSearch =
        enrollment.profiles?.full_name
          .toLowerCase()
          .includes(search) ||
        enrollment.profiles?.email
          .toLowerCase()
          .includes(search) ||
        enrollment.courses?.title
          .toLowerCase()
          .includes(search) ||
        enrollment.courses?.code
          ?.toLowerCase()
          .includes(search)

      const matchCourse =
        selectedCourseFilter === "all" ||
        enrollment.courses?.title === selectedCourseFilter

      return matchSearch && matchCourse
    })
  }, [enrollments, searchTerm, selectedCourseFilter])

  return (
    <section className="space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
          Admin Workspace
        </p>

        <h1 className="relative mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
          Enrollment Management
        </h1>

        <p className="relative mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
          Enroll students into courses and monitor course participation.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Students"
          value={students.length}
          icon={<Users className="h-5 w-5 text-violet-600" />}
          bar="from-violet-600 to-violet-300"
        />

        <StatCard
          label="Courses"
          value={courses.length}
          icon={<BookOpen className="h-5 w-5 text-cyan-600" />}
          bar="from-cyan-500 to-cyan-300"
        />

        <StatCard
          label="Enrollments"
          value={enrollments.length}
          icon={
            <GraduationCap className="h-5 w-5 text-emerald-600" />
          }
          bar="from-emerald-500 to-emerald-300"
        />
      </div>

      {/* TABLE CARD */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Student Enrollments
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {loading
                ? "Loading..."
                : `${filteredEnrollments.length} enrollment${
                    filteredEnrollments.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* SEARCH */}

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 sm:w-64"
              />
            </div>

            {/* FILTER */}

            <div className="relative">
              <select
                value={selectedCourseFilter}
                onChange={(e) =>
                  setSelectedCourseFilter(e.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-violet-500 sm:w-48"
              >
                <option value="all">All Courses</option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.title}
                  >
                    {course.title}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              <Plus className="h-4 w-4" />
              Enroll Student
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="min-w-[900px] border-collapse md:min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "STUDENT",
                  "COURSE",
                  "COURSE CODE",
                  "ENROLLED DATE",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-xs font-bold tracking-widest text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    Loading enrollments...
                  </td>
                </tr>
              ) : filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => {
                  const studentName =
                    enrollment.profiles?.full_name || "Unknown"

                  const studentEmail =
                    enrollment.profiles?.email || "—"

                  const courseTitle =
                    enrollment.courses?.title || "Unknown"

                  const avatar = avatarColor(studentName)

                  const courseTheme = courseColor(courseTitle)

                  return (
                    <tr
                      key={enrollment.id}
                      onClick={() => {
                        const student = students.find(
                          (s) =>
                            s.id === enrollment.student_id
                        )

                        if (student) {
                          openStudentCourses(student)
                        }
                      }}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      {/* STUDENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
                            }}
                          >
                            {initials(studentName)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {studentName}
                            </p>

                            <p className="text-xs text-slate-400">
                              {studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* COURSE */}

                      <td className="px-5 py-4 font-medium text-slate-700">
                        {courseTitle}
                      </td>

                      {/* CODE */}

                      <td className="px-5 py-4">
                        {enrollment.courses?.code ? (
                          <span
                            className="rounded-lg px-3 py-1 text-xs font-bold"
                            style={{
                              background: courseTheme.bg,
                              color: courseTheme.text,
                              boxShadow: `0 0 0 1px ${courseTheme.ring}`,
                            }}
                          >
                            {enrollment.courses.code}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {new Date(
                          enrollment.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENROLL MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

            <div className="flex items-start justify-between p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Enroll Student
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Select a student and assign them to a course.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 pb-6">
              <ModalSelect
                label="Student"
                value={studentId}
                onChange={setStudentId}
                placeholder="Select student"
                options={students.map((student) => ({
                  value: student.id,
                  label: `${student.full_name} (${student.email})`,
                }))}
              />

              <ModalSelect
                label="Course"
                value={courseId}
                onChange={setCourseId}
                placeholder="Select course"
                options={courses.map((course) => ({
                  value: course.id,
                  label: `${course.title}${
                    course.code
                      ? ` — ${course.code}`
                      : ""
                  }`,
                }))}
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={closeModal}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={addEnrollment}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-violet-700 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Enrollment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT COURSES MODAL */}

      {selectedStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedStudent.full_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedStudent.email}
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Enrolled Courses
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStudent(null)
                  setStudentCourses([])
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {studentCoursesLoading ? (
                <p className="text-sm text-slate-400">
                  Loading courses...
                </p>
              ) : studentCourses.length > 0 ? (
                studentCourses.map((courseItem) => {
                  const title =
                    courseItem.courses?.title ||
                    "Unknown Course"

                  const courseTheme =
                    courseColor(title)

                  return (
                    <div
                      key={courseItem.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${courseTheme.from}, ${courseTheme.to})`,
                        }}
                      >
                        {initials(title)}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-slate-900">
                          {title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {courseItem.courses
                            ?.description ||
                            "No course description."}
                        </p>
                      </div>

                      {courseItem.courses?.code && (
                        <span
                          className="rounded-lg px-3 py-1 text-xs font-bold"
                          style={{
                            background: courseTheme.bg,
                            color: courseTheme.text,
                            boxShadow: `0 0 0 1px ${courseTheme.ring}`,
                          }}
                        >
                          {courseItem.courses.code}
                        </span>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-400">
                  This student is not enrolled in any course yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
  icon,
  bar,
}: {
  label: string
  value: number
  icon: React.ReactNode
  bar: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
      <div
        className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${bar}`}
      />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
        {value}
      </h2>
    </div>
  )
}

function ModalSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: {
    value: string
    label: string
  }[]
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-violet-500"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}