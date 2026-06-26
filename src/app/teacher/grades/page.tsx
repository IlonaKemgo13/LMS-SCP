"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

type Course = {
  id: string
  title: string
}

type Student = {
  id: string
  full_name: string
  email: string
}

type Grade = {
  id: string
  assessment_name: string
  assessment_type: string | null
  score: number
  max_score: number
  created_at: string
  courses?: { title: string }
  profiles?: { full_name: string }
}

export default function TeacherGradesPage() {
  const supabase    = createClient()
  const { profile } = useAuth()
  const teacherId   = profile?.id ?? ""

  const [courses,      setCourses]      = useState<Course[]>([])
  const [students,     setStudents]     = useState<Student[]>([])
  const [grades,       setGrades]       = useState<Grade[]>([])
  const [studentGrades, setStudentGrades] = useState<Grade[]>([])

  const [loading,              setLoading]              = useState(true)
  const [studentGradesLoading, setStudentGradesLoading] = useState(false)

  const [selectedCourse,  setSelectedCourse]  = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [clickedStudent,  setClickedStudent]  = useState<Student | null>(null)

  const [assessmentName, setAssessmentName] = useState("")
  const [assessmentType, setAssessmentType] = useState("assignment")
  const [score,          setScore]          = useState("")
  const [maxScore,       setMaxScore]       = useState("100")
  const [searchTerm,     setSearchTerm]     = useState("")

  useEffect(() => {
    if (teacherId) {
      Promise.all([fetchCourses(), fetchGrades()])
    }
  }, [teacherId])

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse(selectedCourse)
    } else {
      setStudents([])
      setSelectedStudent("")
    }
  }, [selectedCourse])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", teacherId)
      .order("title", { ascending: true })

    if (error) { toast.error("Failed to load courses."); return }
    setCourses(data || [])
  }

  async function fetchStudentsForCourse(courseId: string) {
    const { data, error } = await supabase
      .from("enrollments")
      .select("student_id, profiles!enrollments_student_id_fkey(id, full_name, email)")
      .eq("course_id", courseId)

    if (error) { toast.error("Failed to load students."); return }
    const formattedStudents = data?.map((item: any) => item.profiles).filter(Boolean) || []
    setStudents(formattedStudents)
  }

  async function fetchGrades() {
    setLoading(true)
    const { data, error } = await supabase
      .from("grades")
      .select("id, assessment_name, assessment_type, score, max_score, created_at, courses(title), profiles!grades_student_id_fkey(full_name)")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) { toast.error("Failed to load grades."); setLoading(false); return }
    setGrades((data as unknown as Grade[]) || [])
    setLoading(false)
  }

  async function openStudentGrades(student: Student) {
    if (!selectedCourse) {
      toast.error("Please select a course first.")
      return
    }

    setClickedStudent(student)
    setStudentGrades([])
    setStudentGradesLoading(true)

    const { data, error } = await supabase
      .from("grades")
      .select("id, assessment_name, assessment_type, score, max_score, created_at, courses(title), profiles!grades_student_id_fkey(full_name)")
      .eq("teacher_id", teacherId)
      .eq("course_id",  selectedCourse)
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      toast.error("Failed to load student grades.")
      setStudentGradesLoading(false)
      return
    }

    setStudentGrades((data as unknown as Grade[]) || [])
    setStudentGradesLoading(false)
  }

  async function saveGrade() {
    if (!selectedCourse || !selectedStudent || !assessmentName || !score) {
      toast.error("Please fill all required fields.")
      return
    }

    const res = await fetch("/api/teacher/grades", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        student_id:      selectedStudent,
        course_id:       selectedCourse,
        assessment_name: assessmentName,
        assessment_type: assessmentType,
        score:           Number(score),
        max_score:       Number(maxScore),
      }),
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || "Failed to save grade.")
      return
    }

    toast.success("Grade saved!")
    setSelectedStudent("")
    setAssessmentName("")
    setAssessmentType("assignment")
    setScore("")
    setMaxScore("100")
    fetchGrades()
  }

  const filteredGrades = useMemo(
    () => grades.filter((g) => g.assessment_name.toLowerCase().includes(searchTerm.toLowerCase())),
    [grades, searchTerm]
  )

  const selectedCourseTitle = courses.find((c) => c.id === selectedCourse)?.title || ""

  return (
    <>
      <section className="w-full space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Teacher Workspace</p>
          <h1 className="mt-3 text-4xl font-bold">Grade Management</h1>
          <p className="mt-3 max-w-2xl text-white/80">Select a course, record grades, and click a student to view all grades for that course.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Enter Grade</h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                >
                  <option value="">Choose course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedCourse}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">{selectedCourse ? "Choose student" : "Select a course first"}</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
                </select>
              </div>

              <FieldInput label="Assessment Name" value={assessmentName} onChange={setAssessmentName} placeholder="e.g. Assignment 1" />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Assessment Type</label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                >
                  <option value="assignment">Assignment</option>
                  <option value="test">Test</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput label="Score"     value={score}    onChange={setScore}    placeholder="e.g. 85" type="number" />
                <FieldInput label="Max Score" value={maxScore} onChange={setMaxScore} placeholder="100"     type="number" />
              </div>

              <button
                onClick={saveGrade}
                disabled={!teacherId}
                className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Grade
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Students In Selected Course</h2>
            <p className="mt-1 text-gray-500">
              {selectedCourse ? `${students.length} student(s) in ${selectedCourseTitle}` : "Select a course to view enrolled students."}
            </p>

            <div className="mt-6 space-y-4">
              {!selectedCourse ? (
                <EmptyState message="Select a course to display students." />
              ) : students.length > 0 ? (
                students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => openStudentGrades(s)}
                    className="w-full rounded-2xl border p-5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <p className="font-semibold text-gray-900">{s.full_name}</p>
                    <p className="mt-1 text-sm text-gray-500">{s.email}</p>
                  </button>
                ))
              ) : (
                <EmptyState message="No students enrolled in this course." />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Grades</h2>
              <p className="mt-1 text-gray-500">{filteredGrades.length} grade record(s)</p>
            </div>
            <input
              type="text"
              placeholder="Search assessment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:w-72"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading grades...</p>
            ) : filteredGrades.length > 0 ? (
              filteredGrades.map((g) => <GradeCard key={g.id} grade={g} />)
            ) : (
              <EmptyState message="No grades recorded yet." />
            )}
          </div>
        </div>
      </section>

      {clickedStudent && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{clickedStudent.full_name}</h2>
                <p className="mt-1 text-sm text-gray-500">{clickedStudent.email}</p>
                <p className="mt-2 text-sm font-medium text-indigo-600">Grades for {selectedCourseTitle}</p>
              </div>
              <button onClick={() => { setClickedStudent(null); setStudentGrades([]) }} className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {studentGradesLoading ? (
                <p className="text-sm text-gray-500">Loading grades...</p>
              ) : studentGrades.length > 0 ? (
                studentGrades.map((g) => <GradeCard key={g.id} grade={g} />)
              ) : (
                <EmptyState message="No grades found for this student in this course." />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FieldInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
      />
    </div>
  )
}

function GradeCard({ grade }: { grade: Grade }) {
  const percentage = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0

  return (
    <div className="rounded-2xl border p-5 transition hover:border-indigo-300">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{grade.assessment_name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {grade.courses?.title && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">{grade.courses.title}</span>
            )}
            {grade.profiles?.full_name && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{grade.profiles.full_name}</span>
            )}
            {grade.assessment_type && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-600">{grade.assessment_type}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{grade.score}/{grade.max_score}</p>
          <p className="text-sm text-gray-500">{percentage}%</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-400">Posted {new Date(grade.created_at).toLocaleDateString()}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">{message}</div>
  )
}
