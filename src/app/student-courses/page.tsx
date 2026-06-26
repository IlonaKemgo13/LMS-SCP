"use client"

import { useState } from "react"
import Link from "next/link"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentCourses } from "@/lib/hooks/useStudentData"

export default function StudentCoursesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useStudentCourses(page)

  const enrollments: any[] = data?.courses ?? []
  const total: number      = data?.total ?? 0
  const totalPages         = Math.ceil(total / 20)

  const filtered = enrollments.filter((e: any) => {
    const c = e.courses
    if (!c) return false
    return `${c.title} ${c.description ?? ""}`.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Academic Course Center</p>
          <h1 className="mt-3 text-4xl font-bold">Your learning hub in one place.</h1>
          <p className="mt-3 max-w-3xl opacity-80">Review enrolled courses, monitor academic performance, open course materials, and access recordings.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {[
            ["Enrolled Courses", isLoading ? "..." : String(total), "Active courses"],
          ].map(([label, value, desc]) => (
            <div key={label} className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
              <h3 className="mt-2 text-3xl font-bold">{value}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold">Enrolled Courses</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Search and access your registered courses.</p>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-xl border px-4 py-3 outline-none md:w-80"
              style={{ background: "var(--color-bg-input)" }}
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {isLoading ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading courses...</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center lg:col-span-2">
                <p className="font-semibold">No courses found.</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Your enrolled courses will appear here.</p>
              </div>
            ) : (
              filtered.map((enrollment: any) => {
                const course = enrollment.courses
                if (!course) return null
                return (
                  <div key={enrollment.course_id} className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold">{course.title}</h4>
                        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{course.description || "No description"}</p>
                        {course.profiles?.full_name && (
                          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Teacher: {course.profiles.full_name}</p>
                        )}
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--color-success-light)", color: "var(--color-success-main)" }}>
                        Enrolled
                      </span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/student-grades" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--color-neutral-900)" }}>
                        View Grades
                      </Link>
                      <Link href="/student-recordings" className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Recordings
                      </Link>
                      <Link href="/student-announcements" className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Announcements
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
            </div>
          )}
        </section>
      </div>
    </StudentLayout>
  )
}
