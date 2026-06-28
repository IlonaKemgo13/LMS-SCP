"use client"

import { useState } from "react"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentMaterials } from "@/lib/hooks/useStudentData"

export default function StudentMaterialsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStudentMaterials(page)

  const materials: any[] = data?.materials ?? []
  const total: number    = data?.total ?? 0
  const totalPages       = Math.ceil(total / 20)

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Resource Center</p>
          <h1 className="mt-3 text-4xl font-bold">Access your course materials instantly.</h1>
          <p className="mt-3 max-w-3xl opacity-80">Download lecture notes, slides, PDFs, and additional study resources uploaded by your instructors.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Available Materials</p>
            <h3 className="mt-2 text-3xl font-bold">{isLoading ? "..." : total}</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Uploaded resources</p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Access</p>
            <h3 className="mt-2 text-3xl font-bold">Anytime</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Download when needed</p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Format</p>
            <h3 className="mt-2 text-3xl font-bold">PDF / Docs</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Multiple formats supported</p>
          </div>
        </section>

        <section className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h3 className="text-xl font-bold">All Materials</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Sorted by most recent uploads.</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {isLoading ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading materials...</p>
            ) : materials.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center lg:col-span-2">
                <p className="font-semibold">No materials found.</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Your course materials will appear here once uploaded.</p>
              </div>
            ) : (
              materials.map((material: any) => (
                <div key={material.id} className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-student-accent)" }}>
                      {material.courses?.title || "Unknown Course"}
                    </p>
                    <h4 className="mt-2 text-xl font-bold">{material.title}</h4>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {material.created_at ? new Date(material.created_at).toLocaleDateString() : "No date"}
                    </p>
                  </div>
                  {material.file_url ? (
                    <a href={material.file_url} target="_blank" className="inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--color-neutral-900)" }}>
                      Download / View File
                    </a>
                  ) : (
                    <div className="rounded-xl border border-dashed p-6 text-center" style={{ background: "var(--color-neutral-50)" }}>
                      <p className="font-semibold">No file attached</p>
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
