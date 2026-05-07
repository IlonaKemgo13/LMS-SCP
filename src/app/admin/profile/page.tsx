"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, Mail, ShieldCheck, Camera, KeyRound, Eye, EyeOff, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

const AVATAR_GRADIENTS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#10b981", to: "#0891b2" },
]

function getGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

const PERMISSIONS = [
  "User management & role assignment",
  "Course creation & lecturer assignment",
  "Enrollment management",
  "Global announcements",
  "Reports & analytics access",
  "Platform configuration",
]

export default function AdminProfilePage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile]       = useState<Profile | null>(null)
  const [loading, setLoading]       = useState(true)
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)

  /* password modal */
  const [showPwModal, setShowPwModal]   = useState(false)
  const [currentPw, setCurrentPw]       = useState("")
  const [newPw, setNewPw]               = useState("")
  const [confirmPw, setConfirmPw]       = useState("")
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [pwSaving, setPwSaving]         = useState(false)
  const [pwSuccess, setPwSuccess]       = useState(false)
  const [pwError, setPwError]           = useState("")

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data, error } = await supabase.from("profiles").select("id, full_name, email, role, created_at").eq("id", user.id).single()
    if (!error && data) setProfile(data)
    setLoading(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `avatars/${profile.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (uploadError) { alert(uploadError.message); setUploading(false); return }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    setAvatarUrl(data.publicUrl + "?t=" + Date.now())
    setUploading(false)
  }

  async function handleChangePassword() {
    setPwError("")
    if (!newPw || !confirmPw) { setPwError("Please fill in all fields."); return }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) { setPwError(error.message); setPwSaving(false); return }
    setPwSuccess(true)
    setPwSaving(false)
    setTimeout(() => { setPwSuccess(false); setShowPwModal(false); setCurrentPw(""); setNewPw(""); setConfirmPw("") }, 2000)
  }

  function closePwModal() {
    setShowPwModal(false); setCurrentPw(""); setNewPw(""); setConfirmPw("")
    setPwError(""); setPwSuccess(false)
  }

  const initials = useMemo(() => profile?.full_name ? getInitials(profile.full_name) : "AD", [profile])
  const gradient = useMemo(() => profile?.full_name ? getGradient(profile.full_name) : AVATAR_GRADIENTS[0], [profile])

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
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>Profile Settings</h1>
        <p style={{ fontSize: 14, color: "rgba(196,181,253,0.7)", marginTop: 8, marginBottom: 0 }}>
          View your administrator account information and platform identity.
        </p>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: "60px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #ede9fe", borderTopColor: "#7c3aed", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Loading profile…</p>
        </div>
      ) : profile ? (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── Left card ── */}
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)" }} />

            <div style={{ padding: "32px 24px" }}>
              {/* avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28 }}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: 24,
                    background: avatarUrl ? "transparent" : `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 900, color: "#fff",
                    boxShadow: `0 4px 20px ${gradient.from}55`,
                    overflow: "hidden",
                  }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials
                    }
                  </div>

                  {/* upload overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Change profile picture"
                    style={{
                      position: "absolute", bottom: -6, right: -6,
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: uploading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
                    }}
                  >
                    {uploading
                      ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite" }} />
                      : <Camera style={{ width: 14, height: 14, color: "#fff" }} />
                    }
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{profile.full_name}</h2>

                <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, background: "#f5f3ff", padding: "5px 14px", boxShadow: "0 0 0 1px #ddd6fe" }}>
                  <ShieldCheck style={{ width: 14, height: 14, color: "#7c3aed" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", textTransform: "capitalize" }}>{profile.role}</span>
                </div>
              </div>

              {/* info items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <InfoItem icon={<Mail style={{ width: 16, height: 16 }} />} label="Email Address" value={profile.email} />
                <InfoItem icon={<CalendarDays style={{ width: 16, height: 16 }} />} label="Account Created"
                  value={new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
              </div>

              {/* change password button */}
              <button
                type="button"
                onClick={() => setShowPwModal(true)}
                style={{
                  width: "100%", marginTop: 20, height: 42, borderRadius: 12,
                  border: "1.5px solid #e2e8f0", background: "#f8fafc",
                  color: "#374151", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#ddd6fe"; e.currentTarget.style.color = "#6d28d9" }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#374151" }}
              >
                <KeyRound style={{ width: 15, height: 15 }} />
                Change Password
              </button>
            </div>
          </div>

          {/* ── Right card ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* account overview */}
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)" }} />
              <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Account Overview</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>Administrator information registered on the LMS platform.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Full Name",     value: profile.full_name },
                    { label: "Email Address", value: profile.email },
                    { label: "Role",          value: profile.role },
                    { label: "Joined Date",   value: new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  ].map(field => (
                    <div key={field.label} style={{ borderRadius: 14, border: "1.5px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 6px" }}>{field.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0, textTransform: field.label === "Role" ? "capitalize" : "none" }}>{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* permissions card */}
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ height: 5, background: "linear-gradient(90deg, #f43f5e, #7c3aed, #0891b2)" }} />
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldCheck style={{ width: 18, height: 18, color: "#7c3aed" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Administrator Permissions</h3>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Full platform access granted</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PERMISSIONS.map(perm => (
                    <div key={perm} style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, background: "#f5f3ff", border: "1px solid #ede9fe", padding: "9px 12px" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check style={{ width: 10, height: 10, color: "#fff" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#4c1d95" }}>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 20, padding: "40px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <p style={{ color: "#f43f5e", fontSize: 13, margin: 0 }}>Unable to load administrator profile.</p>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPwModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

            <div style={{ height: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)" }} />

            <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Change Password</h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Update your account password securely.</p>
              </div>
              <button onClick={closePwModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#94a3b8" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
              <PasswordField label="New Password"     value={newPw}     onChange={setNewPw}     show={showNew}     onToggle={() => setShowNew(v => !v)} />
              <PasswordField label="Confirm Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />

              {/* strength indicator */}
              {newPw.length > 0 && (
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: newPw.length >= i * 3 ? (newPw.length >= 12 ? "#10b981" : newPw.length >= 8 ? "#f59e0b" : "#f43f5e") : "#e2e8f0" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: newPw.length >= 12 ? "#10b981" : newPw.length >= 8 ? "#f59e0b" : "#f43f5e", margin: 0, fontWeight: 600 }}>
                    {newPw.length >= 12 ? "Strong password" : newPw.length >= 8 ? "Moderate password" : "Weak password"}
                  </p>
                </div>
              )}

              {/* error */}
              {pwError && (
                <div style={{ borderRadius: 10, background: "#fff1f2", border: "1px solid #fecdd3", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <X style={{ width: 14, height: 14, color: "#f43f5e", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#be123c" }}>{pwError}</span>
                </div>
              )}

              {/* success */}
              {pwSuccess && (
                <div style={{ borderRadius: 10, background: "#f0fdf4", border: "1px solid #a7f3d0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Check style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#065f46", fontWeight: 600 }}>Password updated successfully!</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px 20px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={closePwModal} style={{ height: 40, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: 13, padding: "0 18px", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || pwSuccess}
                style={{ height: 40, borderRadius: 12, border: "none", background: pwSuccess ? "#10b981" : pwSaving ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontWeight: 600, fontSize: 13, padding: "0 20px", cursor: (pwSaving || pwSuccess) ? "not-allowed" : "pointer", boxShadow: "0 2px 10px rgba(124,58,237,0.35)", display: "flex", alignItems: "center", gap: 6, opacity: (pwSaving || pwSuccess) ? 0.85 : 1 }}
              >
                {pwSuccess ? <><Check style={{ width: 14, height: 14 }} /> Updated!</> : pwSaving ? "Updating…" : "Update Password"}
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, border: "1.5px solid #f1f5f9", background: "#f8fafc", padding: "12px 14px" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 2px" }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "0 44px 0 14px", fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box" }}
        />
        <button type="button" onClick={onToggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 2 }}>
          {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
        </button>
      </div>
    </div>
  )
}