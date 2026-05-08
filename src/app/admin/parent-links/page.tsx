"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Plus, Search, Users, X, Heart, GraduationCap, Link2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Parent  = { id: string; full_name: string; email: string }
type Student = { id: string; full_name: string; email: string }
type ParentStudentLink = {
  id: string
  created_at: string
  parent:  { full_name: string; email: string } | null
  student: { full_name: string; email: string } | null
}

/* ─── helpers ────────────────────────────────────────────── */
const PARENT_COLORS = [
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#8b5cf6", to: "#6d28d9" },
  { from: "#ec4899", to: "#be185d" },
  { from: "#ef4444", to: "#b91c1c" },
]
const STUDENT_COLORS = [
  { from: "#0891b2", to: "#0d9488" },
  { from: "#3b82f6", to: "#6366f1" },
  { from: "#10b981", to: "#0891b2" },
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#06b6d4", to: "#0284c7" },
]

function parentColor(name: string)  { return PARENT_COLORS[name.charCodeAt(0) % PARENT_COLORS.length] }
function studentColor(name: string) { return STUDENT_COLORS[name.charCodeAt(0) % STUDENT_COLORS.length] }
function initials(name: string) { return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() }

/* ─── Page ───────────────────────────────────────────────── */
export default function AdminParentLinksPage() {
  const supabase = createClient()

  const [parents, setParents]   = useState<Parent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [links, setLinks]       = useState<ParentStudentLink[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [parentId, setParentId] = useState("")
  const [studentId, setStudentId] = useState("")

  useEffect(() => { fetchParents(); fetchStudents(); fetchLinks() }, [])

  async function fetchParents() {
    const { data } = await supabase.from("profiles").select("id, full_name, email").eq("role", "parent").order("full_name")
    setParents(data || [])
  }
  async function fetchStudents() {
    const { data } = await supabase.from("profiles").select("id, full_name, email").eq("role", "student").order("full_name")
    setStudents(data || [])
  }
  async function fetchLinks() {
    setLoading(true)
    const { data, error } = await supabase
      .from("parent_student_links")
      .select(`id, created_at, parent:profiles!parent_student_links_parent_id_fkey (full_name, email), student:profiles!parent_student_links_student_id_fkey (full_name, email)`)
      .order("created_at", { ascending: false })
    if (!error && data) setLinks(data as unknown as ParentStudentLink[])
    setLoading(false)
  }

  function closeModal() { setParentId(""); setStudentId(""); setShowModal(false) }

  async function addLink() {
    if (!parentId || !studentId) { alert("Please select parent and student."); return }
    setSaving(true)
    const { error } = await supabase.from("parent_student_links").insert({ parent_id: parentId, student_id: studentId })
    if (error) { alert(error.message); setSaving(false); return }
    await fetchLinks()
    setSaving(false)
    closeModal()
  }

  const filteredLinks = useMemo(() =>
    links.filter(link => {
      const s = searchTerm.toLowerCase()
      return (
        link.parent?.full_name.toLowerCase().includes(s) ||
        link.parent?.email.toLowerCase().includes(s) ||
        link.student?.full_name.toLowerCase().includes(s) ||
        link.student?.email.toLowerCase().includes(s)
      )
    }),
    [links, searchTerm]
  )

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f2f6", padding: "28px 32px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero banner ── */}
      <div style={{
        borderRadius: 20,
        background: "linear-gradient(135deg, #1a1145 0%, #2d1b6e 50%, #3b2391 100%)",
        padding: "36px 40px", marginBottom: 24, position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(55,20,180,0.25)",
      }}>
        <div style={{ position: "absolute", right: 60, top: -20, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 180, bottom: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,181,253,0.8)", marginBottom: 8 }}>
          Admin Workspace
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
          Parent–Student Relationships
        </h1>
        <p style={{ fontSize: 14, color: "rgba(196,181,253,0.7)", marginTop: 8, marginBottom: 0 }}>
          Connect parents with their children to allow monitoring of grades, announcements, and academic activity.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Parents",       value: parents.length,  bar: "linear-gradient(90deg, #f43f5e, #fb7185)", icon: <Heart style={{ width: 20, height: 20, color: "#f43f5e" }} /> },
          { label: "Students",      value: students.length, bar: "linear-gradient(90deg, #0891b2, #22d3ee)", icon: <GraduationCap style={{ width: 20, height: 20, color: "#0891b2" }} /> },
          { label: "Relationships", value: links.length,    bar: "linear-gradient(90deg, #7c3aed, #a78bfa)", icon: <Link2 style={{ width: 20, height: 20, color: "#7c3aed" }} /> },
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
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Parent Links</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
              {loading ? "Loading…" : `${filteredLinks.length} relationship${filteredLinks.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* search */}
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search parent or student…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ height: 40, width: 240, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", paddingLeft: 36, paddingRight: 12, fontSize: 13, color: "#334155", outline: "none" }}
              />
            </div>

            {/* link parent button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{ height: 40, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontWeight: 600, fontSize: 13, padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(124,58,237,0.35)" }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Link Parent
            </button>
          </div>
        </div>

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["PARENT", "STUDENT", "LINKED DATE"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8" }}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #ede9fe", borderTopColor: "#7c3aed", animation: "spin 0.7s linear infinite" }} />
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading relationships…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLinks.length > 0 ? (
                filteredLinks.map((link, idx) => {
                  const pName = link.parent?.full_name || "Unknown"
                  const sName = link.student?.full_name || "Unknown"
                  const pc = parentColor(pName)
                  const sc = studentColor(sName)
                  return (
                    <tr
                      key={link.id}
                      style={{ borderBottom: idx < filteredLinks.length - 1 ? "1px solid #f8fafc" : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* parent */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${pc.from}, ${pc.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", boxShadow: `0 2px 8px ${pc.from}55` }}>
                            {initials(pName)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "#0f172a", margin: 0 }}>{pName}</p>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{link.parent?.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* link arrow + student */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {/* link connector pill */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 20, background: "#f5f3ff", padding: "3px 8px", flexShrink: 0 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: pc.from }} />
                            <div style={{ width: 18, height: 1.5, background: "linear-gradient(90deg, #c4b5fd, #818cf8)" }} />
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.from }} />
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${sc.from}, ${sc.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", boxShadow: `0 2px 8px ${sc.from}55` }}>
                              {initials(sName)}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, color: "#0f172a", margin: 0 }}>{sName}</p>
                              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{link.student?.email || "—"}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* date */}
                      <td style={{ padding: "14px 20px", color: "#94a3b8", fontSize: 13 }}>
                        {new Date(link.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <Users style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
                    <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No parent relationships found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        {!loading && filteredLinks.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Showing <strong style={{ color: "#475569" }}>{filteredLinks.length}</strong> of{" "}
              <strong style={{ color: "#475569" }}>{links.length}</strong> relationships
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

            {/* gradient top bar */}
            <div style={{ height: 5, background: "linear-gradient(90deg, #f43f5e, #7c3aed, #0891b2)" }} />

            <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Link Parent To Student</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Create a parent-child relationship in the LMS.</p>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#94a3b8" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <ModalSelect
                label="Parent"
                value={parentId}
                onChange={setParentId}
                placeholder="Select parent"
                options={parents.map(p => ({ value: p.id, label: `${p.full_name} (${p.email})` }))}
              />
              <ModalSelect
                label="Student"
                value={studentId}
                onChange={setStudentId}
                placeholder="Select student"
                options={students.map(s => ({ value: s.id, label: `${s.full_name} (${s.email})` }))}
              />

              {/* preview connector */}
              {parentId && studentId && (() => {
                const p = parents.find(x => x.id === parentId)
                const s = students.find(x => x.id === studentId)
                if (!p || !s) return null
                const pc = parentColor(p.full_name)
                const sc = studentColor(s.full_name)
                return (
                  <div style={{ borderRadius: 12, background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${pc.from}, ${pc.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{initials(p.full_name)}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{p.full_name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 24, height: 1.5, background: "#c4b5fd" }} />
                      <Link2 style={{ width: 14, height: 14, color: "#7c3aed" }} />
                      <div style={{ width: 24, height: 1.5, background: "#c4b5fd" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${sc.from}, ${sc.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{initials(s.full_name)}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{s.full_name}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px 20px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={closeModal} style={{ height: 40, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: 13, padding: "0 18px", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={addLink}
                disabled={saving}
                style={{ height: 40, borderRadius: 12, border: "none", background: saving ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontWeight: 600, fontSize: 13, padding: "0 20px", cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 10px rgba(124,58,237,0.35)", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving…" : "Save Relationship"}
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
function ModalSelect({ label, value, onChange, placeholder, options }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "0 36px 0 14px", fontSize: 13, color: value ? "#334155" : "#94a3b8", appearance: "none", outline: "none", boxSizing: "border-box" }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
      </div>
    </div>
  )
}