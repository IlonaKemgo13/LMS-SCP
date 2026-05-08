"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, X, BookOpen, ChevronDown, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Teacher = {
  id: string
  full_name: string
}

type Course = {
  id: string
  title: string
  code: string | null
  description: string | null
  teacher_id: string | null
  created_at: string
  profiles?: { full_name: string } | null
}

const COURSE_COLORS = [
  { from: "#7c3aed", to: "#4f46e5", light: "#f5f3ff" },
  { from: "#0891b2", to: "#0d9488", light: "#f0fdfa" },
  { from: "#f43f5e", to: "#db2777", light: "#fff1f2" },
  { from: "#f59e0b", to: "#ea580c", light: "#fffbeb" },
  { from: "#3b82f6", to: "#6366f1", light: "#eff6ff" },
  { from: "#10b981", to: "#0891b2", light: "#f0fdf4" },
]

function getCourseColor(title: string) {
  return COURSE_COLORS[title.charCodeAt(0) % COURSE_COLORS.length]
}

function getInitials(title: string) {
  return title.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

export default function AdminCoursesPage() {
  const supabase = createClient()

  const [courses, setCourses]             = useState<Course[]>([])
  const [teachers, setTeachers]           = useState<Teacher[]>([])
  const [loading, setLoading]             = useState(true)
  const [showModal, setShowModal]         = useState(false)
  const [saving, setSaving]               = useState(false)
  const [searchTerm, setSearchTerm]       = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("all")

  const [title, setTitle]           = useState("")
  const [code, setCode]             = useState("")
  const [description, setDescription] = useState("")
  const [teacherId, setTeacherId]   = useState("")

  useEffect(() => { fetchTeachers(); fetchCourses() }, [])

  async function fetchTeachers() {
    const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "teacher").order("full_name")
    setTeachers(data || [])
  }

  async function fetchCourses() {
    setLoading(true)
    const { data, error } = await supabase
      .from("courses")
      .select(`id, title, code, description, teacher_id, created_at, profiles!courses_teacher_id_fkey (full_name)`)
      .order("created_at", { ascending: false })
    if (!error && data) setCourses(data as unknown as Course[])
    setLoading(false)
  }

  function closeModal() {
    setTitle(""); setCode(""); setDescription(""); setTeacherId("")
    setShowModal(false)
  }

  async function addCourse() {
    if (!title) { alert("Please enter course title."); return }
    setSaving(true)
    const { error } = await supabase.from("courses").insert({
      title, code: code || null, description: description || null, teacher_id: teacherId || null,
    })
    if (error) { alert(error.message); setSaving(false); return }
    await fetchCourses()
    setSaving(false)
    closeModal()
  }

  const filteredCourses = useMemo(() =>
    courses.filter(c => {
      const s = searchTerm.toLowerCase()
      return (c.title.toLowerCase().includes(s) || (c.code || "").toLowerCase().includes(s))
        && (selectedTeacher === "all" || c.teacher_id === selectedTeacher)
    }),
    [courses, searchTerm, selectedTeacher]
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
        <div style={{
          position: "absolute", right: 60, top: -20,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
          filter: "blur(30px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 180, bottom: -30,
          width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          filter: "blur(24px)", pointerEvents: "none",
        }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,181,253,0.8)", marginBottom: 8 }}>
          Admin Workspace
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
          Course Management
        </h1>
        <p style={{ fontSize: 14, color: "rgba(196,181,253,0.7)", marginTop: 8, marginBottom: 0 }}>
          Create courses, assign lecturers, and manage course information.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Courses", value: courses.length, bar: "linear-gradient(90deg, #7c3aed, #a78bfa)" },
          { label: "With Teacher",  value: courses.filter(c => c.teacher_id).length, bar: "linear-gradient(90deg, #0891b2, #22d3ee)" },
          { label: "Unassigned",    value: courses.filter(c => !c.teacher_id).length, bar: "linear-gradient(90deg, #f59e0b, #fcd34d)" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#fff", borderRadius: 16, padding: "20px 20px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: stat.bar, borderRadius: "16px 16px 0 0" }} />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8, marginTop: 4 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 40, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Courses</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>
              {loading ? "Loading…" : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* search */}
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search title or code…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  height: 40, width: 220, borderRadius: 12,
                  border: "1.5px solid #e2e8f0", background: "#f8fafc",
                  paddingLeft: 36, paddingRight: 12, fontSize: 13, color: "#334155", outline: "none",
                }}
              />
            </div>

            {/* teacher filter */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedTeacher}
                onChange={e => setSelectedTeacher(e.target.value)}
                style={{
                  height: 40, borderRadius: 12,
                  border: "1.5px solid #e2e8f0", background: "#f8fafc",
                  padding: "0 32px 0 12px", fontSize: 13, color: "#334155",
                  appearance: "none", outline: "none", cursor: "pointer",
                }}
              >
                <option value="all">All Teachers</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
            </div>

            {/* add course button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{
                height: 40, borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff", fontWeight: 600, fontSize: 13,
                padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
              }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add Course
            </button>
          </div>
        </div>

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["COURSE", "CODE", "ASSIGNED TEACHER", "CREATED"].map((h, i) => (
                  <th key={h} style={{
                    padding: "12px 20px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        border: "3px solid #ede9fe", borderTopColor: "#7c3aed",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading courses…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, idx) => {
                  const color = getCourseColor(course.title)
                  return (
                    <tr
                      key={course.id}
                      style={{ borderBottom: idx < filteredCourses.length - 1 ? "1px solid #f8fafc" : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* course title + description */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                            background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 800, color: "#fff",
                            boxShadow: `0 2px 8px ${color.from}55`,
                          }}>
                            {getInitials(course.title)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "#0f172a", margin: 0 }}>{course.title}</p>
                            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", maxWidth: 340 }}>
                              {course.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* code */}
                      <td style={{ padding: "14px 20px" }}>
                        {course.code ? (
                          <span style={{
                            display: "inline-block", borderRadius: 8, padding: "3px 10px",
                            background: "#f5f3ff", color: "#6d28d9",
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                            boxShadow: "0 0 0 1px #ddd6fe",
                          }}>
                            {course.code}
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: "#cbd5e1" }}>—</span>
                        )}
                      </td>

                      {/* teacher */}
                      <td style={{ padding: "14px 20px" }}>
                        {course.profiles?.full_name ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 800, color: "#fff",
                            }}>
                              {getInitials(course.profiles.full_name)}
                            </div>
                            <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
                              {course.profiles.full_name}
                            </span>
                          </div>
                        ) : (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 12, color: "#94a3b8", fontWeight: 500,
                          }}>
                            <GraduationCap style={{ width: 13, height: 13 }} />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* created */}
                      <td style={{ padding: "14px 20px", color: "#94a3b8", fontSize: 13 }}>
                        {new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center" }}>
                    <BookOpen style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
                    <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No courses found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        {!loading && filteredCourses.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Showing <strong style={{ color: "#475569" }}>{filteredCourses.length}</strong> of{" "}
              <strong style={{ color: "#475569" }}>{courses.length}</strong> courses
            </p>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            width: "100%", maxWidth: 480, background: "#fff",
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}>
            {/* gradient top bar */}
            <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)" }} />

            <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Add Course</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Create a course and optionally assign it to a lecturer.</p>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#94a3b8" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <ModalField label="Course Title"  placeholder="e.g. Web Development" value={title}       onChange={setTitle} />
              <ModalField label="Course Code"   placeholder="e.g. CSC 401"         value={code}        onChange={setCode} />

              {/* description */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Course Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief course description..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{
                    width: "100%", borderRadius: 12,
                    border: "1.5px solid #e2e8f0", background: "#f8fafc",
                    padding: "10px 14px", fontSize: 13, color: "#334155",
                    outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>

              {/* assign teacher */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Assign Teacher</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={teacherId}
                    onChange={e => setTeacherId(e.target.value)}
                    style={{
                      width: "100%", height: 44, borderRadius: 12,
                      border: "1.5px solid #e2e8f0", background: "#f8fafc",
                      padding: "0 36px 0 14px", fontSize: 13, color: "#334155",
                      appearance: "none", outline: "none", boxSizing: "border-box",
                    }}
                  >
                    <option value="">Unassigned</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px 20px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={closeModal} style={{
                height: 40, borderRadius: 12, border: "1.5px solid #e2e8f0",
                background: "#fff", color: "#475569", fontWeight: 600, fontSize: 13,
                padding: "0 18px", cursor: "pointer",
              }}>
                Cancel
              </button>
              <button
                onClick={addCourse}
                disabled={saving}
                style={{
                  height: 40, borderRadius: 12, border: "none",
                  background: saving ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#fff", fontWeight: 600, fontSize: 13,
                  padding: "0 20px", cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "0 2px 10px rgba(124,58,237,0.35)",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : "Save Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ModalField({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", height: 44, borderRadius: 12,
          border: "1.5px solid #e2e8f0", background: "#f8fafc",
          padding: "0 14px", fontSize: 13, color: "#334155",
          outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  )
}