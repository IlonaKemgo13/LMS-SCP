"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  ChevronDown,
  Plus,
  Search,
  X,
  Users,
  GraduationCap,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Student = { id: string; full_name: string; email: string }

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
  profiles: { full_name: string; email: string } | null
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
  { from: "#7c3aed", to: "#a78bfa", bg: "#f5f3ff", text: "#6d28d9", ring: "#ddd6fe" },
  { from: "#0891b2", to: "#22d3ee", bg: "#f0fdfa", text: "#0f766e", ring: "#99f6e4" },
  { from: "#f43f5e", to: "#fb7185", bg: "#fff1f2", text: "#be123c", ring: "#fecdd3" },
  { from: "#f59e0b", to: "#fcd34d", bg: "#fffbeb", text: "#b45309", ring: "#fde68a" },
  { from: "#3b82f6", to: "#93c5fd", bg: "#eff6ff", text: "#1d4ed8", ring: "#bfdbfe" },
  { from: "#10b981", to: "#6ee7b7", bg: "#f0fdf4", text: "#065f46", ring: "#a7f3d0" },
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

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentCourses, setStudentCourses] = useState<Enrollment[]>([])
  const [studentCoursesLoading, setStudentCoursesLoading] = useState(false)

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
      alert("Please select a student and course.")
      return
    }

    setSaving(true)

    const { error } = await supabase.from("enrollments").insert({
      student_id: studentId,
      course_id: courseId,
    })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

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

  const filteredEnrollments = useMemo(
    () =>
      enrollments.filter((e) => {
        const s = searchTerm.toLowerCase()

        const matchSearch =
          e.profiles?.full_name.toLowerCase().includes(s) ||
          e.profiles?.email.toLowerCase().includes(s) ||
          e.courses?.title.toLowerCase().includes(s) ||
          e.courses?.code?.toLowerCase().includes(s)

        const matchCourse =
          selectedCourseFilter === "all" ||
          e.courses?.title === selectedCourseFilter

        return matchSearch && matchCourse
      }),
    [enrollments, searchTerm, selectedCourseFilter]
  )

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f2f6",
        padding: "28px 32px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          borderRadius: 20,
          background:
            "linear-gradient(135deg, #1a1145 0%, #2d1b6e 50%, #3b2391 100%)",
          padding: "36px 40px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(55,20,180,0.25)",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(196,181,253,0.8)",
            marginBottom: 8,
          }}
        >
          Admin Workspace
        </p>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Enrollment Management
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(196,181,253,0.7)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          Enroll students into courses and monitor course participation.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Students",
            value: students.length,
            bar: "linear-gradient(90deg, #7c3aed, #a78bfa)",
            icon: <Users style={{ width: 20, height: 20, color: "#7c3aed" }} />,
          },
          {
            label: "Courses",
            value: courses.length,
            bar: "linear-gradient(90deg, #0891b2, #22d3ee)",
            icon: <BookOpen style={{ width: 20, height: 20, color: "#0891b2" }} />,
          },
          {
            label: "Enrollments",
            value: enrollments.length,
            bar: "linear-gradient(90deg, #10b981, #6ee7b7)",
            icon: (
              <GraduationCap
                style={{ width: 20, height: 20, color: "#10b981" }}
              />
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "20px 20px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 5,
                background: stat.bar,
              }}
            />

            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#94a3b8",
                margin: "4px 0 8px",
              }}
            >
              {stat.label}
            </p>

            <p
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Student Enrollments
            </h2>

            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
              {loading
                ? "Loading…"
                : `${filteredEnrollments.length} enrollment${
                    filteredEnrollments.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 15,
                  height: 15,
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />

              <input
                type="text"
                placeholder="Search student, email, course…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: 40,
                  width: 240,
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                  paddingLeft: 36,
                  paddingRight: 12,
                  fontSize: 13,
                  color: "#334155",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                  padding: "0 32px 0 12px",
                  fontSize: 13,
                  color: "#334155",
                  appearance: "none",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>

              <ChevronDown
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{
                height: 40,
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                padding: "0 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
              }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Enroll Student
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["STUDENT", "COURSE", "COURSE CODE", "ENROLLED DATE"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#94a3b8",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center" }}>
                    Loading enrollments…
                  </td>
                </tr>
              ) : filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment, idx) => {
                  const name = enrollment.profiles?.full_name || "Unknown"
                  const email = enrollment.profiles?.email || "—"
                  const courseTitle = enrollment.courses?.title || "Unknown"
                  const av = avatarColor(name)
                  const cc = courseColor(courseTitle)

                  return (
                    <tr
                      key={enrollment.id}
                      onClick={() => {
                        const student = students.find(
                          (s) => s.id === enrollment.student_id
                        )

                        if (student) openStudentCourses(student)
                      }}
                      style={{
                        cursor: "pointer",
                        borderBottom:
                          idx < filteredEnrollments.length - 1
                            ? "1px solid #f8fafc"
                            : "none",
                      }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: `linear-gradient(135deg, ${av.from}, ${av.to})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {initials(name)}
                          </div>

                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                              {name}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                              {email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px", fontWeight: 500 }}>
                        {courseTitle}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        {enrollment.courses?.code ? (
                          <span
                            style={{
                              borderRadius: 8,
                              padding: "3px 10px",
                              background: cc.bg,
                              color: cc.text,
                              fontSize: 12,
                              fontWeight: 700,
                              boxShadow: `0 0 0 1px ${cc.ring}`,
                            }}
                          >
                            {enrollment.courses.code}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={{ padding: "14px 20px", color: "#94a3b8" }}>
                        {new Date(enrollment.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center" }}>
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                height: 5,
                background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)",
              }}
            />

            <div
              style={{
                padding: "24px 24px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Enroll Student
                </h2>

                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
                  Select a student and assign them to a course.
                </p>
              </div>

              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                  color: "#94a3b8",
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <ModalSelect
                label="Student"
                value={studentId}
                onChange={setStudentId}
                placeholder="Select student"
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.full_name} (${s.email})`,
                }))}
              />

              <ModalSelect
                label="Course"
                value={courseId}
                onChange={setCourseId}
                placeholder="Select course"
                options={courses.map((c) => ({
                  value: c.id,
                  label: `${c.title}${c.code ? ` — ${c.code}` : ""}`,
                }))}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "14px 24px 20px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 13,
                  padding: "0 18px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={addEnrollment}
                disabled={saving}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: "none",
                  background: saving
                    ? "#a78bfa"
                    : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  padding: "0 20px",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save Enrollment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 620,
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                height: 5,
                background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)",
              }}
            />

            <div
              style={{
                padding: 24,
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {selectedStudent.full_name}
                </h2>

                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                  {selectedStudent.email}
                </p>

                <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0 0" }}>
                  Enrolled Courses
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStudent(null)
                  setStudentCourses([])
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                  color: "#94a3b8",
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {studentCoursesLoading ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading courses...</p>
              ) : studentCourses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {studentCourses.map((item) => {
                    const title = item.courses?.title || "Unknown Course"
                    const color = courseColor(title)

                    return (
                      <div
                        key={item.id}
                        style={{
                          border: "1.5px solid #f1f5f9",
                          borderRadius: 16,
                          padding: 16,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 12,
                          }}
                        >
                          {initials(title)}
                        </div>

                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "#0f172a",
                              fontSize: 14,
                            }}
                          >
                            {title}
                          </p>

                          <p
                            style={{
                              margin: "3px 0 0",
                              color: "#64748b",
                              fontSize: 12,
                            }}
                          >
                            {item.courses?.description || "No course description."}
                          </p>
                        </div>

                        {item.courses?.code && (
                          <span
                            style={{
                              borderRadius: 8,
                              padding: "4px 10px",
                              background: color.bg,
                              color: color.text,
                              fontSize: 12,
                              fontWeight: 700,
                              boxShadow: `0 0 0 1px ${color.ring}`,
                            }}
                          >
                            {item.courses.code}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>
                  This student is not enrolled in any course yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 12,
            border: "1.5px solid #e2e8f0",
            background: "#f8fafc",
            padding: "0 36px 0 14px",
            fontSize: 13,
            color: value ? "#334155" : "#94a3b8",
            appearance: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <ChevronDown
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  )
}