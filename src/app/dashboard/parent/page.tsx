"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useParentDashboard } from "@/lib/hooks/useParentData"

export default function ParentDashboardPage() {
  const { profile } = useAuth()
  const { data, isLoading } = useParentDashboard()

  const children: any[]      = data?.children ?? []
  const recentGrades: any[]  = data?.recentGrades ?? []
  const announcements: any[] = data?.announcements ?? []

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-parent-hero-from), var(--color-parent-hero-to))" }}>
        <p className="text-sm font-semibold uppercase tracking-widest opacity-70">Smart Communication Portal</p>
        <h1 className="mt-2 text-3xl font-bold">Parent Workspace</h1>
        <p className="mt-2 opacity-80">
          Welcome back, {profile?.full_name ?? "Parent"}! Monitor your students' academic progress and stay updated.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Linked Students", isLoading ? "..." : String(children.length), "Under your account"],
          ["Announcements",   isLoading ? "..." : String(announcements.length), "Recent updates"],
          ["Grade Records",   isLoading ? "..." : String(recentGrades.length),  "Recent activity"],
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
            <h3 className="mt-2 text-3xl font-bold">{value}</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Recent Announcements</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Stay updated with latest news</p>
          </div>
          <Link href="/dashboard/parent/announcements" className="text-sm font-semibold" style={{ color: "var(--color-parent-accent)" }}>
            View all →
          </Link>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No announcements yet.</p>
          ) : (
            announcements.map((ann: any) => (
              <div key={ann.id} className="flex items-start gap-4 rounded-xl p-4" style={{ background: "var(--color-neutral-50)" }}>
                <div>
                  <h3 className="font-semibold">{ann.title}</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{ann.content || "No content available"}</p>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                    {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : "Recent"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl p-6 text-white shadow-sm" style={{ background: "linear-gradient(to right, var(--color-parent-hero-from), var(--color-parent-hero-to))" }}>
          <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
          <p className="text-sm opacity-80 mb-4">Access your most used features</p>
          <div className="space-y-2">
            {[
              ["View Students",      "/dashboard/parent/children"],
              ["Check Grades",       "/dashboard/parent/grades"],
              ["View Announcements", "/dashboard/parent/announcements"],
            ].map(([label, href]) => (
              <Link key={label} href={href as string} className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <span>{label}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h3 className="text-lg font-bold mb-4">Linked Students</h3>
          {isLoading ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading...</p>
          ) : children.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No students linked to your account.</p>
          ) : (
            <div className="space-y-3">
              {children.map((child: any) => (
                <div key={child.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "var(--color-neutral-50)" }}>
                  <div>
                    <p className="font-semibold">{child.full_name}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{child.email}</p>
                  </div>
                  <Link href={`/dashboard/parent/grades?student_id=${child.id}`} className="text-sm font-semibold" style={{ color: "var(--color-parent-accent)" }}>
                    Grades →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
