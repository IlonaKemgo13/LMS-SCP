"use client"

import Link from "next/link"
import { useParentChildren } from "@/lib/hooks/useParentData"

export default function ParentChildrenPage() {
  const { data, isLoading } = useParentChildren()
  const children: any[] = data?.children ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Students</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>View and monitor your students' academic progress</p>
        </div>
        <span className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "var(--color-primary-50)", color: "var(--color-parent-accent)" }}>
          {isLoading ? "..." : `${children.length} Student(s)`}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading students...</p>
      ) : children.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--color-bg-card)" }}>
          <p className="font-semibold">No students linked to your account.</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>Contact the administrator to link students to your account.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {children.map((child: any) => {
            const profile = child.profiles ?? child
            return (
              <div key={profile.id} className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: "var(--color-bg-card)" }}>
                <div className="p-4 text-white" style={{ background: "linear-gradient(to right, var(--color-parent-hero-from), var(--color-parent-hero-to))" }}>
                  <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                  <p className="text-sm mt-1 opacity-80">{profile.email}</p>
                </div>
                <div className="p-5">
                  <div className="flex gap-3">
                    <Link
                      href={`/dashboard/parent/grades?student_id=${profile.id}`}
                      className="flex-1 rounded-xl py-2 text-center text-sm font-semibold text-white"
                      style={{ background: "var(--color-parent-accent)" }}
                    >
                      View Grades
                    </Link>
                    <Link
                      href="/dashboard/parent/announcements"
                      className="flex-1 rounded-xl border py-2 text-center text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Announcements
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
