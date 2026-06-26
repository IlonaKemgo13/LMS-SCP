"use client"

import { useState } from "react"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentRecordings } from "@/lib/hooks/useStudentData"

export default function StudentRecordingsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStudentRecordings(page)

  const recordings: any[] = data?.recordings ?? []
  const total: number     = data?.total ?? 0
  const totalPages        = Math.ceil(total / 20)

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Lecture Replay Center</p>
          <h1 className="mt-3 text-4xl font-bold">Rewatch your course lectures anytime.</h1>
          <p className="mt-3 max-w-3xl opacity-80">Access recorded lectures uploaded by teachers for your enrolled courses.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Available Recordings</p>
            <h3 className="mt-2 text-3xl font-bold">{isLoading ? "..." : total}</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Uploaded lectures</p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Access</p>
            <h3 className="mt-2 text-3xl font-bold">24/7</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Replay anytime</p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Mode</p>
            <h3 className="mt-2 text-3xl font-bold">Online</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Browser playback</p>
          </div>
        </section>

        <section className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h3 className="text-xl font-bold">All Recordings</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Videos are listed from newest to oldest.</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {isLoading ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading recordings...</p>
            ) : recordings.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center lg:col-span-2">
                <p className="font-semibold">No recordings found.</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Uploaded course lectures will appear here.</p>
              </div>
            ) : (
              recordings.map((recording: any) => (
                <div key={recording.id} className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-student-accent)" }}>
                      {recording.courses?.title || "Unknown Course"}
                    </p>
                    <h4 className="mt-2 text-xl font-bold">{recording.title}</h4>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {recording.created_at ? new Date(recording.created_at).toLocaleDateString() : "No date"}
                    </p>
                  </div>
                  {recording.file_url ? (
                    <>
                      <video controls className="w-full rounded-xl border bg-black">
                        <source src={recording.file_url} />
                        Your browser does not support video playback.
                      </video>
                      <a href={recording.file_url} target="_blank" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--color-neutral-900)" }}>
                        Open Recording
                      </a>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed p-6 text-center" style={{ background: "var(--color-neutral-50)" }}>
                      <p className="font-semibold">No video URL attached</p>
                    </div>
                  )}
                </div>
              ))
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
