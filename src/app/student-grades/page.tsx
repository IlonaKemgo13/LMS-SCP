"use client"

import { useState } from "react"
import StudentLayout from "@/components/student/StudentLayout"
import { useStudentGrades } from "@/lib/hooks/useStudentData"

function getStatus(percent: number) {
  if (percent >= 85) return "Excellent"
  if (percent >= 70) return "Good"
  if (percent >= 50) return "Needs Improvement"
  return "At Risk"
}

export default function StudentGradesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useStudentGrades(page)

  const grades: any[]   = data?.grades ?? []
  const total: number   = data?.total ?? 0
  const totalPages      = Math.ceil(total / 20)

  const totalScore = grades.reduce((sum: number, g: any) => sum + Number(g.score ?? 0), 0)
  const totalMax   = grades.reduce((sum: number, g: any) => sum + Number(g.max_score ?? 0), 0)
  const average    = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  return (
    <StudentLayout>
      <div className="space-y-8">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Academic Performance Center</p>
          <h1 className="mt-3 text-4xl font-bold">Track your academic progress clearly.</h1>
          <p className="mt-3 max-w-3xl opacity-80">View grades by course, assessment type, score, percentage, and performance status.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            ["Overall Average", isLoading ? "..." : `${average}%`,         "Based on all recorded grades"],
            ["Assessments",     isLoading ? "..." : String(grades.length), "Total graded items"],
            ["Standing",        isLoading ? "..." : getStatus(average),    "Current performance level"],
          ].map(([label, value, desc]) => (
            <div key={label} className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
              <h3 className="mt-2 text-3xl font-bold">{value}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h3 className="text-xl font-bold">Detailed Grades</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>All grades recorded for your enrolled courses.</p>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading grades...</p>
            ) : grades.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <p className="font-semibold">No grades found.</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Your grades will appear here once teachers publish them.</p>
              </div>
            ) : (
              grades.map((grade: any) => {
                const percent = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0
                return (
                  <div key={grade.id} className="grid gap-4 rounded-2xl border p-5 md:grid-cols-5 md:items-center">
                    <div className="md:col-span-2">
                      <p className="font-bold">{grade.courses?.title || "Unknown Course"}</p>
                      <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-student-accent)" }}>
                        {grade.assessment_name || "Untitled Assessment"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Type</p>
                      <p className="font-semibold capitalize">{grade.assessment_type}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Score</p>
                      <p className="font-semibold">{grade.score}/{grade.max_score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: "var(--color-student-accent)" }}>{percent}%</p>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{getStatus(percent)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </StudentLayout>
  )
}
