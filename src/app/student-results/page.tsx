"use client"

import { useState } from "react"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentResults } from "@/lib/hooks/useStudentData"

export default function StudentResultsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStudentResults(page)

  const results: any[] = data?.results ?? []
  const total: number  = data?.total ?? 0
  const totalPages     = Math.ceil(total / 20)

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Final Results Center</p>
          <h1 className="mt-3 text-4xl font-bold">Access official semester results.</h1>
          <p className="mt-3 max-w-3xl opacity-80">View and download official results uploaded by the administration, organized by semester and academic domain.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Uploaded Results</p>
            <h3 className="mt-2 text-3xl font-bold">{isLoading ? "..." : total}</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Official PDF documents</p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Public Status</p>
            <h3 className="mt-2 text-3xl font-bold">Official</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Verified by administration</p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Format</p>
            <h3 className="mt-2 text-3xl font-bold">PDF</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>View or download securely</p>
          </div>
        </section>

        <section className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold">Final Result Documents</h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Latest official results published by the administration.</p>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading results...</p>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <p className="font-semibold">No official results found.</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Uploaded final results will appear here once published.</p>
              </div>
            ) : (
              results.map((result: any) => (
                <div key={result.id} className="rounded-2xl border p-5 shadow-sm">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-student-accent)" }}>
                        {result.semester || "Semester not specified"}
                      </p>
                      <h4 className="mt-2 text-xl font-bold">{result.title}</h4>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Domain: {result.domain || "Not specified"}</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Uploaded: {result.created_at ? new Date(result.created_at).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    {result.file_url ? (
                      <a href={result.file_url} target="_blank" className="rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "var(--color-neutral-900)" }}>
                        View / Download PDF
                      </a>
                    ) : (
                      <span className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: "var(--color-danger-light)", color: "var(--color-danger-main)" }}>
                        No PDF attached
                      </span>
                    )}
                  </div>
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
