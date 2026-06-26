"use client"

import { useMemo, useRef, useState } from "react"
import {
  CalendarDays,
  Camera,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-context"

const AVATAR_GRADIENTS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#10b981", to: "#0891b2" },
]

const PERMISSIONS = [
  "User management & role assignment",
  "Course creation & lecturer assignment",
  "Enrollment management",
  "Global announcements",
  "Reports & analytics access",
  "Platform configuration",
]

function getGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
}

export default function AdminProfilePage() {
  const { profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(profile?.avatar_url ?? null)
  const [uploading,  setUploading]  = useState(false)

  const [showPwModal, setShowPwModal] = useState(false)
  const [currentPw,   setCurrentPw]   = useState("")
  const [newPw,       setNewPw]       = useState("")
  const [confirmPw,   setConfirmPw]   = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwSaving,    setPwSaving]    = useState(false)
  const [pwSuccess,   setPwSuccess]   = useState(false)
  const [pwError,     setPwError]     = useState("")

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res  = await fetch("/api/user/avatar", { method: "POST", body: formData })
    const json = await res.json()
    setUploading(false)

    if (!res.ok) {
      toast.error(json.error || "Failed to upload avatar.")
      return
    }

    setAvatarUrl(json.url + "?t=" + Date.now())
    window.dispatchEvent(new Event("profile-avatar-updated"))
  }

  async function handleChangePassword() {
    setPwError("")

    if (!currentPw || !newPw || !confirmPw) {
      setPwError("Please fill in all fields.")
      return
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.")
      return
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.")
      return
    }

    setPwSaving(true)
    const res  = await fetch("/api/auth/change-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ current_password: currentPw, new_password: newPw }),
    })
    const json = await res.json()
    setPwSaving(false)

    if (!res.ok) {
      setPwError(json.error || "Failed to update password.")
      return
    }

    setPwSuccess(true)
    setTimeout(() => {
      setPwSuccess(false)
      setShowPwModal(false)
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
    }, 2000)
  }

  function closePwModal() {
    setShowPwModal(false)
    setCurrentPw("")
    setNewPw("")
    setConfirmPw("")
    setPwError("")
    setPwSuccess(false)
  }

  const initials = useMemo(() => profile?.full_name ? getInitials(profile.full_name) : "AD", [profile])
  const gradient = useMemo(() => profile?.full_name ? getGradient(profile.full_name) : AVATAR_GRADIENTS[0], [profile])

  if (!profile) {
    return (
      <section className="space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-700" />
          <p className="mt-4 text-sm text-slate-400">Loading profile...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">Admin Workspace</p>
        <h1 className="relative mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">Profile Settings</h1>
        <p className="relative mt-3 max-w-3xl text-sm text-white/80 sm:text-base">View your administrator account information and platform identity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-violet-600 via-violet-400 to-indigo-500" />
          <div className="p-6">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div
                  className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl text-3xl font-black text-white shadow-lg"
                  style={{ background: avatarUrl ? "transparent" : `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                >
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : initials}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-violet-700 text-white shadow-lg transition hover:bg-violet-800 disabled:cursor-not-allowed"
                >
                  {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <h2 className="text-2xl font-black text-slate-900">{profile.full_name}</h2>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 ring-1 ring-violet-200">
                <ShieldCheck className="h-4 w-4 text-violet-700" />
                <span className="text-xs font-bold uppercase tracking-wide text-violet-700">{profile.role}</span>
              </div>
            </div>

            <div className="space-y-3">
              <InfoItem icon={<Mail className="h-4 w-4" />} label="Email Address" value={profile.email ?? "—"} />
              <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Account Created" value={new Date(profile.created_at ?? "").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
            </div>

            <button
              type="button"
              onClick={() => setShowPwModal(true)}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 via-violet-400 to-indigo-500" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900">Account Overview</h2>
              <p className="mt-1 text-sm text-slate-400">Administrator information registered on the LMS platform.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { label: "Full Name", value: profile.full_name ?? "—" },
                  { label: "Email Address", value: profile.email ?? "—" },
                  { label: "Role", value: profile.role ?? "—" },
                  { label: "Joined Date", value: new Date(profile.created_at ?? "").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                ].map((field) => (
                  <div key={field.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{field.label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-violet-600 to-cyan-500" />
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                  <ShieldCheck className="h-5 w-5 text-violet-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Administrator Permissions</h3>
                  <p className="text-sm text-slate-400">Full platform access granted</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {PERMISSIONS.map((permission) => (
                  <div key={permission} className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 p-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-700">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-violet-900">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPwModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 via-violet-400 to-indigo-500" />
            <div className="flex items-start justify-between p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                <p className="mt-1 text-sm text-slate-400">Update your account password securely.</p>
              </div>
              <button onClick={closePwModal} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4 px-6 pb-6">
              <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
              <PasswordField label="New Password"     value={newPw}     onChange={setNewPw}     show={showNew}     onToggle={() => setShowNew((v) => !v)}     />
              <PasswordField label="Confirm Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />

              {newPw.length > 0 && (
                <div>
                  <div className="mb-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${newPw.length >= i * 3 ? (newPw.length >= 12 ? "bg-emerald-500" : newPw.length >= 8 ? "bg-amber-500" : "bg-rose-500") : "bg-slate-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${newPw.length >= 12 ? "text-emerald-600" : newPw.length >= 8 ? "text-amber-600" : "text-rose-600"}`}>
                    {newPw.length >= 12 ? "Strong password" : newPw.length >= 8 ? "Moderate password" : "Weak password"}
                  </p>
                </div>
              )}

              {pwError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <X className="h-4 w-4 text-rose-500" />
                  <span className="text-sm text-rose-700">{pwError}</span>
                </div>
              )}

              {pwSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">Password updated successfully!</span>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button onClick={closePwModal} className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleChangePassword} disabled={pwSaving || pwSuccess}
                  className={`h-11 flex-1 rounded-xl text-sm font-semibold text-white transition ${pwSuccess ? "bg-emerald-500" : "bg-violet-700 hover:bg-violet-800"} disabled:opacity-70`}
                >
                  {pwSuccess ? "Updated!" : pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm outline-none transition focus:border-violet-500"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
