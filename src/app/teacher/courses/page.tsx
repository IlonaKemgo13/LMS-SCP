"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Course = {
  id: string
  title: string
  code?: string | null
  description?: string | null
}

type Stats = {
  assignedCourses: number
  totalStudents: number
  announcements: number
}

export default function TeacherCoursesPage() {
  const supabase = createClient()

  const [teacherId, setTeacherId] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats>({
    assignedCourses: 0,
    totalStudents: 0,
    announcements: 0,
  })

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchCurrentTeacher()
  }, [])

  useEffect(() => {
    if (teacherId) {
      fetchDashboardData()
    }
  }, [teacherId])

  const fetchCurrentTeacher = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      setErrorMessage("You must be logged in to view assigned courses.")
      setLoading(false)
      return
    }

    setTeacherId(user.id)
  }

  const fetchDashboardData = async () => {
    setLoading(true)

    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, code, description")
      .eq("teacher_id", teacherId)

    if (coursesError) {
      setErrorMessage(coursesError.message)
      setLoading(false)
      return
    }

    const assignedCourses = coursesData || []
    const courseIds = assignedCourses.map((course) => course.id)

    let totalStudents = 0

    if (courseIds.length > 0) {
      const { data: enrollmentsData, error: enrollmentsError } =
        await supabase
          .from("enrollments")
          .select("student_id, course_id")
          .in("course_id", courseIds)

      if (enrollmentsError) {
        setErrorMessage(enrollmentsError.message)
        setLoading(false)
        return
      }

      const uniqueStudentIds = new Set(
        (enrollmentsData || []).map(
          (enrollment) => enrollment.student_id
        )
      )

      totalStudents = uniqueStudentIds.size
    }

    const { count: announcementsCount, error: announcementsError } =
      await supabase
        .from("announcements")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacherId)

    if (announcementsError) {
      setErrorMessage(announcementsError.message)
      setLoading(false)
      return
    }

    setCourses(assignedCourses)

    setStats({
      assignedCourses: assignedCourses.length,
      totalStudents,
      announcements: announcementsCount || 0,
    })

    setLoading(false)
  }

  if (errorMessage) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-600">
          Error loading courses
        </h1>

        <p className="mt-2 text-gray-600">
          {errorMessage}
        </p>
      </section>
    )
  }

  return (
    <section className="w-full space-y-8">
      {/* Hero */}
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Teacher Workspace
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          My Courses
        </h1>

        <p className="mt-3 max-w-2xl text-white/80">
          Access and manage all assigned courses, monitor course
          activity, and organize teaching resources efficiently.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Assigned Courses"
          value={loading ? "..." : String(stats.assignedCourses)}
          color="from-blue-500 to-cyan-400"
        />

        <StatCard
          title="Total Students"
          value={loading ? "..." : String(stats.totalStudents)}
          color="from-purple-500 to-pink-500"
        />

        <StatCard
          title="Announcements"
          value={loading ? "..." : String(stats.announcements)}
          color="from-emerald-500 to-teal-400"
        />
      </div>

      {/* Courses */}
      <div className="rounded-3xl bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Assigned Courses
          </h2>

          <p className="mt-1 text-gray-500">
            Courses currently assigned to this lecturer.
          </p>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">
              Loading courses...
            </div>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))
          ) : (
            <div className="p-6 text-sm text-gray-500">
              No courses assigned yet.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: string
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className={`h-2 bg-linear-to-r ${color}`} />

      <div className="p-6">
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <h2 className="mt-3 text-4xl font-bold text-gray-900">
          {value}
        </h2>
      </div>
    </div>
  )
}

function CourseCard({
  course,
}: {
  course: Course
}) {
  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-bold text-gray-900">
            {course.title}
          </h3>

          {course.code && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {course.code}
            </span>
          )}
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
          {course.description ||
            "No course description available."}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/teacher/courses/${course.id}`}
          className="rounded-2xl border px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          View Course
        </Link>

        <button className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700">
          Manage
        </button>
      </div>
    </div>
  )
}