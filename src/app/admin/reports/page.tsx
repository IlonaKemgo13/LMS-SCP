"use client"

import { useEffect, useState } from "react"
import { BookOpen, GraduationCap, Shield, Users, UserSquare2, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Profile = { id: string; full_name: string; email: string; role: string; created_at: string }
type Course  = { id: string; title: string; code: string | null; created_at: string }

/* ─── helpers ────────────────────────────────────────────── */
const ROLE_META: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  admin:   { bg: "#fff1f2", text: "#be123c", ring: "#fecdd3", dot: "#f43f5e" },
  teacher: { bg: "#f5f3ff", text: "#6d28d9", ring: "#ddd6fe", dot: "#7c3aed" },
  student: { bg: "#f0fdfa", text: "#0f766e", ring: "#99f6e4", dot: "#0891b2" },
  parent:  { bg: "#fffbeb", text: "#b45309", ring: "#fde68a", dot: "#f59e0b" },
}

const AVATAR_COLORS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#3b82f6", to: "#6366f1" },
  { from: "#10b981", to: "#0891b2" },
]
const COURSE_COLORS = [
  { from: "#7c3aed", to: "#4f46e5", light: "#f5f3ff", text: "#6d28d9", ring: "#ddd6fe" },
  { from: "#0891b2", to: "#0d9488", light: "#f0fdfa", text: "#0f766e", ring: "#99f6e4" },
  { from: "#f43f5e", to: "#db2777", light: "#fff1f2", text: "#be123c", ring: "#fecdd3" },
  { from: "#f59e0b", to: "#ea580c", light: "#fffbeb", text: "#b45309", ring: "#fde68a" },
  { from: "#3b82f6", to: "#6366f1", light: "#eff6ff", text: "#1d4ed8", ring: "#bfdbfe" },
]

function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }
function courseColor(title: string) { return COURSE_COLORS[title.charCodeAt(0) % COURSE_COLORS.length] }
function initials(name: string) { return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() }

const STAT_CONFIG = [
  { key: "total",       title: "Total Users",     barFrom: "#7c3aed", barTo: "#a78bfa", iconFrom: "#7c3aed", iconTo: "#4f46e5" },
  { key: "students",    title: "Students",         barFrom: "#0891b2", barTo: "#22d3ee", iconFrom: "#0891b2", iconTo: "#0d9488" },
  { key: "teachers",    title: "Teachers",         barFrom: "#10b981", barTo: "#6ee7b7", iconFrom: "#10b981", iconTo: "#0891b2" },
  { key: "parents",     title: "Parents",          barFrom: "#f59e0b", barTo: "#fcd34d", iconFrom: "#f59e0b", iconTo: "#ea580c" },
  { key: "admins",      title: "Administrators",   barFrom: "#f43f5e", barTo: "#fb7185", iconFrom: "#f43f5e", iconTo: "#db2777" },
  { key: "courses",     title: "Courses",          barFrom: "#6366f1", barTo: "#818cf8", iconFrom: "#6366f1", iconTo: "#4f46e5" },
  { key: "enrollments", title: "Enrollments",      barFrom: "#14b8a6", barTo: "#2dd4bf", iconFrom: "#14b8a6", iconTo: "#0891b2" },
]

const STAT_ICONS: Record<string, React.ReactNode> = {
  total:       <Users style={{ width: 22, height: 22, color: "#fff" }} />,
  students:    <GraduationCap style={{ width: 22, height: 22, color: "#fff" }} />,
  teachers:    <UserSquare2 style={{ width: 22, height: 22, color: "#fff" }} />,
  parents:     <Users style={{ width: 22, height: 22, color: "#fff" }} />,
  admins:      <Shield style={{ width: 22, height: 22, color: "#fff" }} />,
  courses:     <BookOpen style={{ width: 22, height: 22, color: "#fff" }} />,
  enrollments: <TrendingUp style={{ width: 22, height: 22, color: "#fff" }} />,
}

/* ─── Page ───────────────────────────────────────────────── */
export default function AdminReportsPage() {
  const supabase = createClient()

  const [loading, setLoading]               = useState(true)
  const [profiles, setProfiles]             = useState<Profile[]>([])
  const [courses, setCourses]               = useState<Course[]>([])
  const [enrollmentsCount, setEnrollmentsCount] = useState(0)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [pr, cr, er] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false }),
      supabase.from("courses").select("id, title, code, created_at").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*", { count: "exact", head: true }),
    ])
    if (pr.data)  setProfiles(pr.data)
    if (cr.data)  setCourses(cr.data)
    setEnrollmentsCount(er.count || 0)
    setLoading(false)
  }

  const totalStudents = profiles.filter(p => p.role === "student").length
  const totalTeachers = profiles.filter(p => p.role === "teacher").length
  const totalParents  = profiles.filter(p => p.role === "parent").length
  const totalAdmins   = profiles.filter(p => p.role === "admin").length

  const statValues: Record<string, number> = {
    total: profiles.length, students: totalStudents, teachers: totalTeachers,
    parents: totalParents, admins: totalAdmins, courses: courses.length, enrollments: enrollmentsCount,
  }

  const recentUsers   = profiles.slice(0, 10)
  const recentCourses = courses.slice(0, 5)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f2f6", padding: "28px 32px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{
        borderRadius: 20, background: "linear-gradient(135deg, #1a1145 0%, #2d1b6e 50%, #3b2391 100%)",
        padding: "36px 40px", marginBottom: 24, position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(55,20,180,0.25)",
      }}>
        <div style={{ position: "absolute", right: 60, top: -20, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 180, bottom: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,181,253,0.8)", marginBottom: 8 }}>Admin Workspace</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>Reports & Analytics</h1>
        <p style={{ fontSize: 14, color: "rgba(196,181,253,0.7)", marginTop: 8, marginBottom: 0 }}>
          Monitor LMS activity, users, enrollments, and academic resources across the platform.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {STAT_CONFIG.map(cfg => (
          <div key={cfg.key} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`, borderRadius: "16px 16px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 18px 18px" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 10px" }}>{cfg.title}</p>
                <p style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>
                  {loading ? "—" : statValues[cfg.key]}
                </p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${cfg.iconFrom}, ${cfg.iconTo})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${cfg.iconFrom}44`, flexShrink: 0 }}>
                {STAT_ICONS[cfg.key]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent lists ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent Users — top 10 */}
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)" }} />
          <div style={{ padding: "20px 20px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent Users</h2>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Top 10 latest platform registrations</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", borderRadius: 999, padding: "3px 10px", boxShadow: "0 0 0 1px #ddd6fe" }}>
                {loading ? "—" : `${recentUsers.length} shown`}
              </span>
            </div>
          </div>

          <div style={{ padding: "0 12px 16px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 8px" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2.5px solid #ede9fe", borderTopColor: "#7c3aed", animation: "spin 0.7s linear infinite" }} />
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading users…</span>
              </div>
            ) : recentUsers.length > 0 ? (
              recentUsers.map((profile, idx) => {
                const av = avatarColor(profile.full_name)
                const rm = ROLE_META[profile.role] || ROLE_META.student
                return (
                  <div
                    key={profile.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: "9px 10px", borderBottom: idx < recentUsers.length - 1 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      {/* rank */}
                      <span style={{ width: 20, fontSize: 11, fontWeight: 700, color: idx < 3 ? "#7c3aed" : "#cbd5e1", flexShrink: 0, textAlign: "center" }}>
                        {idx + 1}
                      </span>
                      {/* avatar */}
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${av.from}, ${av.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", boxShadow: `0 2px 6px ${av.from}44` }}>
                        {initials(profile.full_name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: "#0f172a", margin: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.full_name}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.email}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600, background: rm.bg, color: rm.text, boxShadow: `0 0 0 1px ${rm.ring}` }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: rm.dot }} />
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      </span>
                      <span style={{ fontSize: 10, color: "#cbd5e1" }}>
                        {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13, padding: "20px 8px", margin: 0 }}>No users found.</p>
            )}
          </div>
        </div>

        {/* Recent Courses — top 5 */}
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden", alignSelf: "start" }}>
          <div style={{ height: 5, background: "linear-gradient(90deg, #6366f1, #818cf8, #0891b2)" }} />
          <div style={{ padding: "20px 20px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent Courses</h2>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Top 5 latest courses added to the LMS</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#eff6ff", borderRadius: 999, padding: "3px 10px", boxShadow: "0 0 0 1px #bfdbfe" }}>
                {loading ? "—" : `${recentCourses.length} shown`}
              </span>
            </div>
          </div>

          <div style={{ padding: "0 12px 16px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 8px" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2.5px solid #e0e7ff", borderTopColor: "#6366f1", animation: "spin 0.7s linear infinite" }} />
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading courses…</span>
              </div>
            ) : recentCourses.length > 0 ? (
              recentCourses.map((course, idx) => {
                const cc = courseColor(course.title)
                return (
                  <div
                    key={course.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: "11px 10px", borderBottom: idx < recentCourses.length - 1 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* rank */}
                      <span style={{ width: 20, fontSize: 11, fontWeight: 700, color: idx < 3 ? "#6366f1" : "#cbd5e1", flexShrink: 0, textAlign: "center" }}>
                        {idx + 1}
                      </span>
                      {/* icon */}
                      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${cc.from}, ${cc.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", boxShadow: `0 2px 8px ${cc.from}44` }}>
                        {initials(course.title)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: "#0f172a", margin: 0, fontSize: 13 }}>{course.title}</p>
                        {course.code ? (
                          <span style={{ display: "inline-block", marginTop: 3, borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 700, background: cc.light, color: cc.text, boxShadow: `0 0 0 1px ${cc.ring}` }}>
                            {course.code}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#cbd5e1" }}>No code</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "#cbd5e1", flexShrink: 0, marginLeft: 8 }}>
                      {new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )
              })
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13, padding: "20px 8px", margin: 0 }}>No courses found.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}