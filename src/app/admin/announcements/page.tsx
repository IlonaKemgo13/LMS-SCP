"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Megaphone, Plus, Search, X, Bell, Clock, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Announcement = {
  id: string
  title: string
  content: string
  deadline: string | null
  created_at: string
  is_global: boolean
  target_role: string | null
}

/* ─── Target meta ────────────────────────────────────────── */
const TARGET_META: Record<string, { label: string; bg: string; text: string; ring: string; dot: string; bar: string }> = {
  all:     { label: "Everyone", bg: "#f1f5f9", text: "#475569", ring: "#e2e8f0", dot: "#94a3b8", bar: "linear-gradient(90deg, #7c3aed, #a78bfa)" },
  teacher: { label: "Teachers", bg: "#f5f3ff", text: "#6d28d9", ring: "#ddd6fe", dot: "#7c3aed", bar: "linear-gradient(90deg, #7c3aed, #a78bfa)" },
  student: { label: "Students", bg: "#f0fdfa", text: "#0f766e", ring: "#99f6e4", dot: "#0891b2", bar: "linear-gradient(90deg, #0891b2, #22d3ee)" },
  parent:  { label: "Parents",  bg: "#fffbeb", text: "#b45309", ring: "#fde68a", dot: "#f59e0b", bar: "linear-gradient(90deg, #f59e0b, #fcd34d)" },
}

const ANNOUNCEMENT_COLORS = [
  { from: "#7c3aed", to: "#4f46e5", light: "#f5f3ff" },
  { from: "#0891b2", to: "#0d9488", light: "#f0fdfa" },
  { from: "#f43f5e", to: "#db2777", light: "#fff1f2" },
  { from: "#f59e0b", to: "#ea580c", light: "#fffbeb" },
  { from: "#3b82f6", to: "#6366f1", light: "#eff6ff" },
  { from: "#10b981", to: "#0891b2", light: "#f0fdf4" },
]
function annColor(title: string) {
  return ANNOUNCEMENT_COLORS[title.charCodeAt(0) % ANNOUNCEMENT_COLORS.length]
}

/* ─── Page ───────────────────────────────────────────────── */
export default function AdminAnnouncementsPage() {
  const supabase = createClient()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)

  const [searchTerm, setSearchTerm]   = useState("")
  const [targetFilter, setTargetFilter] = useState("all")

  const [title, setTitle]       = useState("")
  const [content, setContent]   = useState("")
  const [deadline, setDeadline] = useState("")
  const [targetRole, setTargetRole] = useState("all")

  useEffect(() => { fetchAnnouncements() }, [])

  async function fetchAnnouncements() {
    setLoading(true)
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, content, deadline, created_at, is_global, target_role")
      .eq("is_global", true)
      .order("created_at", { ascending: false })
    if (!error && data) setAnnouncements(data)
    setLoading(false)
  }

  function closeModal() {
    setTitle(""); setContent(""); setDeadline(""); setTargetRole("all")
    setShowModal(false)
  }

  async function addAnnouncement() {
    if (!title || !content) { alert("Please enter title and message."); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("announcements").insert({
      title, content, deadline: deadline || null,
      created_by: user?.id || null, is_global: true,
      target_role: targetRole, course_id: null, teacher_id: null,
    })
    if (error) { alert(error.message); setSaving(false); return }
    await fetchAnnouncements()
    setSaving(false)
    closeModal()
  }

  const filteredAnnouncements = useMemo(() =>
    announcements.filter(a => {
      const s = searchTerm.toLowerCase()
      return (a.title.toLowerCase().includes(s) || a.content.toLowerCase().includes(s))
        && (targetFilter === "all" || a.target_role === targetFilter)
    }),
    [announcements, searchTerm, targetFilter]
  )

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f2f6", padding: "28px 32px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero banner ── */}
      <div style={{
           borderRadius: 20,
        background: "linear-gradient(135deg, #1a1145 0%, #2d1b6e 50%, #3b2391 100%)",
        padding: "36px 40px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(55,20,180,0.25)",
      }}>
        <div style={{ position: "absolute", right: 60, top: -20, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 180, bottom: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,181,253,0.8)", marginBottom: 8 }}>
          Admin Workspace
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>Global Announcements</h1>
        <p style={{ fontSize: 14, color: "rgba(196,181,253,0.7)", marginTop: 8, marginBottom: 0 }}>
          Publish important school-wide announcements for students, teachers, parents, or everyone.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Global Notices", value: announcements.length,                               bar: "linear-gradient(90deg, #7c3aed, #a78bfa)", icon: <Bell style={{ width: 20, height: 20, color: "#7c3aed" }} /> },
          { label: "For Everyone",   value: announcements.filter(a => a.target_role === "all").length, bar: "linear-gradient(90deg, #3b82f6, #6366f1)", icon: <Users style={{ width: 20, height: 20, color: "#3b82f6" }} /> },
          { label: "With Deadlines", value: announcements.filter(a => a.deadline).length,        bar: "linear-gradient(90deg, #f59e0b, #fcd34d)", icon: <Clock style={{ width: 20, height: 20, color: "#f59e0b" }} /> },
        ].map(stat => (
          <div key={stat.label} style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: stat.bar, borderRadius: "16px 16px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, marginTop: 4 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", margin: 0 }}>{stat.label}</p>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>{stat.icon}</div>
            </div>
            <p style={{ fontSize: 40, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Announcements</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
              {loading ? "Loading…" : `${filteredAnnouncements.length} announcement${filteredAnnouncements.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* search */}
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search announcements…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ height: 40, width: 230, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", paddingLeft: 36, paddingRight: 12, fontSize: 13, color: "#334155", outline: "none" }}
              />
            </div>

            {/* target filter */}
            <div style={{ position: "relative" }}>
              <select
                value={targetFilter}
                onChange={e => setTargetFilter(e.target.value)}
                style={{ height: 40, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "0 32px 0 12px", fontSize: 13, color: "#334155", appearance: "none", outline: "none", cursor: "pointer" }}
              >
                <option value="all">All Targets</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>
              <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
            </div>

            {/* add button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{ height: 40, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontWeight: 600, fontSize: 13, padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(124,58,237,0.35)" }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add Announcement
            </button>
          </div>
        </div>

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["ANNOUNCEMENT", "TARGET", "DEADLINE", "CREATED"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8" }}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #ede9fe", borderTopColor: "#7c3aed", animation: "spin 0.7s linear infinite" }} />
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading announcements…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann, idx) => {
                  const col = annColor(ann.title)
                  const target = ann.target_role || "all"
                  const tm = TARGET_META[target] || TARGET_META.all
                  const hasDeadline = !!ann.deadline
                  const isPast = hasDeadline && new Date(ann.deadline!) < new Date()
                  return (
                    <tr
                      key={ann.id}
                      style={{ borderBottom: idx < filteredAnnouncements.length - 1 ? "1px solid #f8fafc" : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* announcement */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 2px 8px ${col.from}55`,
                          }}>
                            <Megaphone style={{ width: 18, height: 18, color: "#fff" }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "#0f172a", margin: 0 }}>{ann.title}</p>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0", maxWidth: 400, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {ann.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* target badge */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, background: tm.bg, color: tm.text, boxShadow: `0 0 0 1px ${tm.ring}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tm.dot, flexShrink: 0 }} />
                          {tm.label}
                        </span>
                      </td>

                      {/* deadline */}
                      <td style={{ padding: "14px 20px" }}>
                        {hasDeadline ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600,
                            background: isPast ? "#fff1f2" : "#f0fdf4",
                            color: isPast ? "#be123c" : "#065f46",
                            boxShadow: `0 0 0 1px ${isPast ? "#fecdd3" : "#a7f3d0"}`,
                          }}>
                            <Clock style={{ width: 11, height: 11 }} />
                            {new Date(ann.deadline!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: "#cbd5e1" }}>No deadline</span>
                        )}
                      </td>

                      {/* created */}
                      <td style={{ padding: "14px 20px", color: "#94a3b8", fontSize: 13 }}>
                        {new Date(ann.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <Megaphone style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
                    <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No announcements found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        {!loading && filteredAnnouncements.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Showing <strong style={{ color: "#475569" }}>{filteredAnnouncements.length}</strong> of{" "}
              <strong style={{ color: "#475569" }}>{announcements.length}</strong> announcements
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

            {/* gradient top bar */}
            <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)" }} />

            <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Add Global Announcement</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Publish an important notice to selected users.</p>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#94a3b8" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <ModalField label="Title" placeholder="e.g. School Fees Deadline" value={title} onChange={setTitle} />

              {/* message textarea */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Message</label>
                <textarea
                  rows={4}
                  placeholder="Write announcement message…"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  style={{ width: "100%", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "10px 14px", fontSize: 13, color: "#334155", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                />
              </div>

              <ModalField label="Deadline (optional)" placeholder="" value={deadline} onChange={setDeadline} type="date" />

              {/* target audience */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Target Audience</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "0 36px 0 14px", fontSize: 13, color: "#334155", appearance: "none", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="all">Everyone</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px 20px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={closeModal} style={{ height: 40, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: 13, padding: "0 18px", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={addAnnouncement}
                disabled={saving}
                style={{ height: 40, borderRadius: 12, border: "none", background: saving ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontWeight: 600, fontSize: 13, padding: "0 20px", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 10px rgba(124,58,237,0.35)", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────── */
function ModalField({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "0 14px", fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  )
}