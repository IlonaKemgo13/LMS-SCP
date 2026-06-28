"use client"

import Link from "next/link"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentDashboard } from "@/lib/hooks/useStudentDashboard"

export default function StudentDashboardPage() {
  const { data, isLoading } = useStudentDashboard()

  const announcements: any[] = data?.announcements ?? []
  const courses: any[]       = data?.enrollments ?? []
  const grades: any[]        = data?.recentGrades ?? []
  const recordingCount: number = data?.recordingCount ?? 0

  const upcomingDeadlines = announcements.filter(
    (item) => item.deadline && new Date(item.deadline) >= new Date()
  )

  const totalScore    = grades.reduce((sum: number, g: any) => sum + Number(g.score ?? 0), 0)
  const totalMaxScore = grades.reduce((sum: number, g: any) => sum + Number(g.max_score ?? 0), 0)
  const average       = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Smart Communication Portal</p>
          <h1 className="mt-3 text-4xl font-bold">Stay updated. Stay prepared.</h1>
          <p className="mt-3 max-w-3xl opacity-80">
            View your recent announcements, deadlines, enrolled courses, grades, materials, and lecture recordings.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          {[
            ["Courses",     isLoading ? "..." : String(courses.length),          "Active enrolled courses"],
            ["Average",     isLoading ? "..." : `${average}%`,                   "Current performance"],
            ["Deadlines",   isLoading ? "..." : String(upcomingDeadlines.length), "Upcoming deadlines"],
            ["Recordings",  isLoading ? "..." : String(recordingCount),           "Available lectures"],
          ].map(([title, value, desc]) => (
            <div key={title} className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{title}</p>
              <h3 className="mt-2 text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border p-6 shadow-sm lg:col-span-2" style={{ background: "var(--color-bg-card)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent Announcements</h3>
              <span className="rounded-full px-3 py-1 text-sm" style={{ background: "var(--color-primary-50)", color: "var(--color-student-accent)" }}>Latest</span>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No announcements found.</p>
              ) : (
                announcements.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border p-5">
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{item.content || "No content"}</p>
                    <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-danger-main)" }}>
                      {item.deadline ? `Due: ${new Date(item.deadline).toLocaleDateString()}` : "No deadline"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <h3 className="text-xl font-bold">Upcoming Deadlines</h3>
            <div className="mt-5 space-y-4">
              {isLoading ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</p>
              ) : upcomingDeadlines.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((item: any) => (
                  <div key={item.id} className="rounded-xl p-4" style={{ background: "var(--color-neutral-50)" }}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{item.content || "No details"}</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: "var(--color-student-accent)" }}>
                      {new Date(item.deadline).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <h3 className="text-xl font-bold">Enrolled Courses</h3>
            <div className="mt-5 space-y-4">
              {isLoading ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading courses...</p>
              ) : courses.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No enrolled courses found.</p>
              ) : (
                courses.map((enrollment: any) => {
                  const course = enrollment.courses
                  if (!course) return null
                  return (
                    <div key={enrollment.course_id} className="flex items-center justify-between rounded-xl border p-4">
                      <div>
                        <p className="font-semibold">{course.title}</p>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{course.description || "No description"}</p>
                      </div>
                      <Link href="/student-courses" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--color-neutral-900)" }}>
                        View
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <h3 className="text-xl font-bold">Grade Summary</h3>
            <div className="mt-5 space-y-4">
              {isLoading ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading grades...</p>
              ) : grades.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No grades found.</p>
              ) : (
                grades.map((grade: any) => {
                  const percent = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0
                  return (
                    <div key={grade.id} className="flex items-center justify-between rounded-xl p-4" style={{ background: "var(--color-neutral-50)" }}>
                      <div>
                        <p className="font-semibold">{grade.courses?.title || "Unknown Course"}</p>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{grade.assessment_type}: {grade.score}/{grade.max_score}</p>
                      </div>
                      <p className="text-xl font-bold" style={{ color: "var(--color-student-accent)" }}>{percent}%</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  )
}
