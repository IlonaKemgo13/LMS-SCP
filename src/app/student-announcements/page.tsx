"use client"

import { useState } from "react"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentAnnouncements } from "@/lib/hooks/useStudentData"

export default function StudentAnnouncementsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStudentAnnouncements(page)

  const announcements: any[] = data?.announcements ?? []
  const total: number        = data?.total ?? 0
  const totalPages           = Math.ceil(total / 20)

  const upcoming = announcements.filter(
    (item) => item.deadline && new Date(item.deadline) >= new Date()
  )

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Smart Communication Portal</p>
          <h1 className="mt-3 text-4xl font-bold">Never miss an academic update.</h1>
          <p className="mt-3 max-w-3xl opacity-80">See course-specific announcements, assignment reminders, project deadlines, and general school updates.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            ["Total Announcements", isLoading ? "..." : String(total),           "Available to you"],
            ["Upcoming Deadlines",  isLoading ? "..." : String(upcoming.length), "Still pending"],
          ].map(([label, value, desc]) => (
            <div key={label} className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
              <h3 className="mt-2 text-3xl font-bold">{value}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border p-6 shadow-sm lg:col-span-2" style={{ background: "var(--color-bg-card)" }}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">All Announcements</h3>
              <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: "var(--color-primary-50)", color: "var(--color-student-accent)" }}>Student View</span>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <p className="font-semibold">No announcements found.</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>New updates will appear here when teachers post them.</p>
                </div>
              ) : (
                announcements.map((item: any) => {
                  const isUrgent = item.deadline && new Date(item.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  return (
                    <div key={item.id} className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-bold">{item.title}</h4>
                          <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{item.content || "No content provided."}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--color-neutral-100)", color: "var(--color-text-secondary)" }}>
                              {item.courses?.title ?? "General"}
                            </span>
                            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--color-danger-light)", color: "var(--color-danger-main)" }}>
                              {item.deadline ? `Due: ${new Date(item.deadline).toLocaleDateString()}` : "No deadline"}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={isUrgent
                          ? { background: "var(--color-danger-light)", color: "var(--color-danger-main)" }
                          : { background: "var(--color-primary-50)", color: "var(--color-student-accent)" }}>
                          {isUrgent ? "Urgent" : "Update"}
                        </span>
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
          </div>

          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <h3 className="text-xl font-bold">Deadline Timeline</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Upcoming academic dates.</p>
            <div className="mt-6 space-y-4">
              {upcoming.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No upcoming deadlines.</p>
              ) : (
                upcoming.map((item: any) => (
                  <div key={item.id} className="rounded-xl p-4" style={{ background: "var(--color-neutral-50)" }}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{item.content || "No details"}</p>
                    <p className="mt-2 text-sm font-bold" style={{ color: "var(--color-student-accent)" }}>
                      {new Date(item.deadline).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  )
}
