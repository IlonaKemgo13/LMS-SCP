"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarDays,
  Mail,
  ShieldCheck,
  Camera,
  KeyRound,
  Eye,
  EyeOff,
  BookOpen,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { toast } from "react-hot-toast"

const AVATAR_GRADIENTS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#10b981", to: "#0891b2" },
]

const TEACHER_PERMISSIONS = [
  "View assigned courses",
  "Create course announcements",
  "Record audio lessons",
  "Manage student grades",
  "View enrolled students",
  "Update account password",
]

function getGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function TeacherProfilePage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()

  const [coursesCount, setCoursesCount] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [showPwModal, setShowPwModal] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState("")

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", profile.id)
        .then(({ count }) => setCoursesCount(count ?? 0))
    }
  }, [profile?.id])

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile?.avatar_url])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/user/avatar", { method: "POST", body: formData })
    const json = await res.json()
    setUploading(false)

    if (!res.ok) {
      toast.error(json.error || "Failed to upload avatar.")
      return
    }

    setAvatarUrl(json.url + "?t=" + Date.now())
    window.dispatchEvent(new Event("profile-avatar-updated"))
    toast.success("Avatar updated successfully.")
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

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
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
      closePwModal()
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

  const initials = useMemo(
    () => (profile?.full_name ? getInitials(profile.full_name) : "LT"),
    [profile]
  )

  const gradient = useMemo(
    () => (profile?.full_name ? getGradient(profile.full_name) : AVATAR_GRADIENTS[0]),
    [profile]
  )

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
          <p className="text-sm text-gray-400">Loading profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* HERO */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:rounded-3xl sm:p-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-200/80 sm:text-[11px]">
          Teacher Workspace
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-4xl">Lecturer Profile</h1>
        <p className="mt-2 text-sm text-purple-200/70">
          View your lecturer account information and teaching identity.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
        {/* SIDEBAR */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />

          <div className="p-6 sm:p-8">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="relative mb-4">
                {/* AVATAR */}
                <div
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl text-3xl font-black text-white"
                  style={{
                    background: avatarUrl
                      ? "transparent"
                      : `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                    boxShadow: `0 4px 20px ${gradient.from}55`,
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>

                {/* CAMERA BUTTON */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-violet-600 to-indigo-700 disabled:cursor-not-allowed"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">{profile.full_name}</h2>

              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-bold capitalize text-indigo-700">{profile.role}</span>
              </div>
            </div>

            {/* INFO ITEMS */}
            <div className="flex flex-col gap-2.5">
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email Address"
                value={profile.email}
              />
              <InfoItem
                icon={<BookOpen className="h-4 w-4" />}
                label="Assigned Courses"
                value={String(coursesCount)}
              />
              <InfoItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Account Created"
                value={new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </div>

            {/* CHANGE PASSWORD */}
            <button
              type="button"
              onClick={() => setShowPwModal(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />

            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Account Overview</h2>
              <p className="mt-1 text-sm text-gray-400">
                Lecturer information registered on the LMS platform.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: "Full Name", value: profile.full_name },
                  { label: "Email Address", value: profile.email },
                  { label: "Role", value: profile.role },
                  { label: "Assigned Courses", value: String(coursesCount) },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      {field.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PERMISSIONS */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />

            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Permissions</h2>
              <p className="mt-1 text-sm text-gray-400">
                What you can do with your lecturer account.
              </p>

              <ul className="mt-4 flex flex-col gap-2">
                {TEACHER_PERMISSIONS.map((perm) => (
                  <li key={perm} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      ✓
                    </span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                <button
                  type="button"
                  onClick={closePwModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {pwSuccess ? (
                <div className="rounded-xl bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
                  Password updated successfully!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* CURRENT PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        placeholder="Repeat new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {pwError && (
                    <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                      {pwError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={pwSaving}
                    className="mt-1 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                  >
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
