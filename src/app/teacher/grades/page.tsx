"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

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
  courses?: {
    title: string
  }
  profiles?: {
    full_name: string
  }
}

export default function TeacherGradesPage() {
  const supabase = createClient()

  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [assessmentName, setAssessmentName] = useState("")
  const [assessmentType, setAssessmentType] = useState("assignment")
  const [score, setScore] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [searchTerm, setSearchTerm] = useState("")

  // TEMPORARY teacher id
  const teacherId = "405b56ca-8e7a-41e7-96dd-417041305cdf"

  useEffect(() => {
    fetchCourses()
    fetchGrades()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse(selectedCourse)
    } else {
      setStudents([])
      setSelectedStudent("")
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", teacherId)

    if (!error && data) {
      setCourses(data)
    }
  }

  const fetchStudentsForCourse = async (courseId: string) => {
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        student_id,
        profiles!enrollments_student_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq("course_id", courseId)

    if (!error && data) {
      const formattedStudents =
        data.map((item: any) => item.profiles).filter(Boolean) || []

      setStudents(formattedStudents)
    }
  }

  const fetchGrades = async () => {
    const { data, error } = await supabase
      .from("grades")
      .select(`
        id,
        assessment_name,
        assessment_type,
        score,
        max_score,
        created_at,
        courses (
          title
        ),
        profiles!grades_student_id_fkey (
          full_name
        )
      `)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setGrades(data as unknown as Grade[])
    }

    setLoading(false)
  }

  const saveGrade = async () => {
    if (!selectedCourse || !selectedStudent || !assessmentName || !score) return

    const { error } = await supabase.from("grades").insert({
      student_id: selectedStudent,
      course_id: selectedCourse,
      teacher_id: teacherId,
      assessment_name: assessmentName,
      assessment_type: assessmentType,
      score: Number(score),
      max_score: Number(maxScore),
    })

    if (!error) {
      setSelectedStudent("")
      setAssessmentName("")
      setAssessmentType("assignment")
      setScore("")
      setMaxScore("100")
      fetchGrades()
    }
  }

  const filteredGrades = useMemo(() => {
    return grades.filter((grade) =>
      grade.assessment_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [grades, searchTerm])

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Teacher Workspace
        </p>

        <h1 className="mt-3 text-4xl font-bold">Grade Management</h1>

        <p className="mt-3 max-w-2xl text-white/80">
          Select an assigned course, choose an enrolled student, and record
          assessment grades.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Enter Grade</h2>
            <p className="mt-1 text-gray-500">
              Grades are linked to the selected course and student.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Course
              </label>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              >
                <option value="">Choose course</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Student
              </label>

              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedCourse}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="">
                  {selectedCourse ? "Choose student" : "Select a course first"}
                </option>

                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Assessment Name
              </label>

              <input
                type="text"
                placeholder="e.g. Assignment 1"
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Assessment Type
              </label>

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
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Score
                </label>

                <input
                  type="number"
                  placeholder="e.g. 85"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Max Score
                </label>

                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={saveGrade}
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Save Grade
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Grades
              </h2>
              <p className="mt-1 text-gray-500">
                {filteredGrades.length} grade record(s)
              </p>
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
              filteredGrades.map((grade) => (
                <GradeCard key={grade.id} grade={grade} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
                No grades recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function GradeCard({ grade }: { grade: Grade }) {
  const percentage =
    grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0

  return (
    <div className="rounded-2xl border p-5 transition hover:border-indigo-300">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {grade.assessment_name}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            {grade.courses?.title && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {grade.courses.title}
              </span>
            )}

            {grade.profiles?.full_name && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {grade.profiles.full_name}
              </span>
            )}

            {grade.assessment_type && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-600">
                {grade.assessment_type}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {grade.score}/{grade.max_score}
          </p>
          <p className="text-sm text-gray-500">{percentage}%</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Posted {new Date(grade.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}