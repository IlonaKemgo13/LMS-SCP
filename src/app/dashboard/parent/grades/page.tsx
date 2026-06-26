"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useParentGrades, useParentChildren } from "@/lib/hooks/useParentData"

function GradesContent() {
  const searchParams  = useSearchParams()
  const studentId     = searchParams.get("student_id") ?? undefined
  const [page, setPage] = useState(1)

  const { data: childrenData } = useParentChildren()
  const { data, isLoading }    = useParentGrades(page, studentId)

  const grades: any[]   = data?.grades ?? []
  const total: number   = data?.total ?? 0
  const totalPages      = Math.ceil(total / 20)
  const children: any[] = childrenData?.children ?? []

  const studentName = studentId
    ? (children.find((c: any) => (c.profiles?.id ?? c.id) === studentId)?.profiles?.full_name ?? children.find((c: any) => (c.profiles?.id ?? c.id) === studentId)?.full_name ?? "Selected Student")
    : null

  const totalScore = grades.reduce((s: number, g: any) => s + Number(g.score ?? 0), 0)
  const totalMax   = grades.reduce((s: number, g: any) => s + Number(g.max_score ?? 0), 0)
  const average    = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grades</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {studentName ? `Academic performance for ${studentName}` : "All students' grades"}
          </p>
        </div>
        {!studentId && (
          <Link href="/dashboard/parent/children" className="text-sm font-semibold" style={{ color: "var(--color-parent-accent)" }}>
            Select a student →
          </Link>
        )}
      </div>

      {studentId && (
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Average",    `${average}%`,          "Overall score"],
            ["Grades",     String(total),           "Total recorded"],
          ].map(([label, value, desc]) => (
            <div key={label} className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
              <h3 className="mt-1 text-2xl font-bold" style={{ color: "var(--color-parent-accent)" }}>{value}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </section>
      )}

      <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: "var(--color-bg-card)" }}>
        <table className="w-full min-w-[500px]">
          <thead style={{ background: "var(--color-neutral-50)" }}>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Course</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>Loading grades...</td></tr>
            ) : grades.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                {studentId ? "No grades available." : "Select a student to view grades."}
              </td></tr>
            ) : (
              grades.map((grade: any) => {
                const percent = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0
                return (
                  <tr key={grade.id} className="border-t">
                    <td className="px-6 py-3 text-sm">{grade.profiles?.full_name ?? "—"}</td>
                    <td className="px-6 py-3 text-sm">{grade.courses?.title ?? "—"}</td>
                    <td className="px-6 py-3 text-sm capitalize">{grade.assessment_type}</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{
                        background: percent >= 70 ? "var(--color-success-light)" : "var(--color-danger-light)",
                        color:      percent >= 70 ? "var(--color-success-main)"  : "var(--color-danger-main)",
                      }}>
                        {grade.score}/{grade.max_score} ({percent}%)
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {new Date(grade.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}

export default function ParentGradesPage() {
  return (
    <Suspense fallback={<p className="text-sm p-6">Loading...</p>}>
      <GradesContent />
    </Suspense>
  )
}
