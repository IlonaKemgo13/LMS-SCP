"use client"

import { useState } from "react"
import { useParentAnnouncements } from "@/lib/hooks/useParentData"

export default function ParentAnnouncementsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useParentAnnouncements(page)

  const announcements: any[] = data?.announcements ?? []
  const total: number        = data?.total ?? 0
  const totalPages           = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Updates for your students' courses</p>
        </div>
        <span className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "var(--color-primary-50)", color: "var(--color-parent-accent)" }}>
          {isLoading ? "..." : `${total} Update(s)`}
        </span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center" style={{ background: "var(--color-bg-card)" }}>
            <p className="font-semibold">No announcements found.</p>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>Updates will appear here when teachers or admins post them.</p>
          </div>
        ) : (
          announcements.map((ann: any) => (
            <div key={ann.id} className="rounded-2xl border p-5 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-parent-accent)" }}>
                    {ann.courses?.title ?? "General"}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{ann.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{ann.content || "No content provided."}</p>
                  {ann.deadline && (
                    <p className="mt-2 text-sm font-semibold" style={{ color: "var(--color-danger-main)" }}>
                      Due: {new Date(ann.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <p className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(ann.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
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
