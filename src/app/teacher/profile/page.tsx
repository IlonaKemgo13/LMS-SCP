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
  Check,
  X,
  BookOpen,
} from "lucide-react"
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

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
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
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("id", user.id)
      .single()

    const { count } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", user.id)

    setProfile(data)
    setCoursesCount(count || 0)
    setLoading(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)

    const ext = file.name.split(".").pop()
    const path = `avatars/${profile.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      alert(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    setAvatarUrl(data.publicUrl + "?t=" + Date.now())
    setUploading(false)
  }

  async function handleChangePassword() {
    setPwError("")

    if (!newPw || !confirmPw) {
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

    const { error } = await supabase.auth.updateUser({ password: newPw })

    if (error) {
      setPwError(error.message)
      setPwSaving(false)
      return
    }

    setPwSuccess(true)
    setPwSaving(false)

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

  const initials = useMemo(
    () => (profile?.full_name ? getInitials(profile.full_name) : "LT"),
    [profile]
  )

  const gradient = useMemo(
    () =>
      profile?.full_name ? getGradient(profile.full_name) : AVATAR_GRADIENTS[0],
    [profile]
  )

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Hero Banner */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:rounded-3xl sm:p-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-200/80 sm:text-[11px]">
          Teacher Workspace
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-white sm:mt-2 sm:text-4xl">
          Lecturer Profile
        </h1>
        <p className="mt-2 text-sm text-purple-200/70 sm:text-sm">
          View your lecturer account information and teaching identity.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
          <p className="text-sm text-gray-400">Loading profile…</p>
        </div>
      ) : profile ? (
        /* Main Content Grid: sidebar + right panels */
        /* On mobile: single column. On lg+: sidebar (fixed width) + right panels */
        <div className="grid gap-5 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">

          {/* ── Sidebar Card ── */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* Top accent stripe */}
            <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />

            <div className="p-6 sm:p-8">
              {/* Avatar + Name */}
              <div className="mb-7 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Avatar circle */}
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
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Camera button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Change profile picture"
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

                <h2 className="text-xl font-extrabold text-slate-900">
                  {profile.full_name}
                </h2>

                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-bold capitalize text-indigo-700">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Info items */}
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
                  value={new Date(profile.created_at).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                />
              </div>

              {/* Change Password button */}
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

          {/* ── Right Panels ── */}
          <div className="flex flex-col gap-5">
            {/* Account Overview */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />
              <div className="p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Account Overview
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Lecturer information registered on the LMS platform.
                </p>

                {/* 1 col on mobile, 2 cols on sm+ */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: "Full Name", value: profile.full_name },
                    { label: "Email Address", value: profile.email },
                    { label: "Role", value: profile.role },
                    {
                      label: "Assigned Courses",
                      value: String(coursesCount),
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        {field.label}
                      </p>
                      <p
                        className={`text-sm font-semibold text-slate-900 ${
                          field.label === "Role" ? "capitalize" : ""
                        }`}
                      >
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-1.5 bg-linear-to-r from-rose-500 via-violet-600 to-cyan-500" />
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                    <ShieldCheck className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Lecturer Permissions
                    </h3>
                    <p className="text-xs text-gray-400">
                      Teaching workspace access
                    </p>
                  </div>
                </div>

                {/* 1 col on mobile, 2 cols on sm+ */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TEACHER_PERMISSIONS.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center gap-2.5 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-indigo-700">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-violet-900">
                        {perm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-rose-500">
            Unable to load lecturer profile.
          </p>
        </div>
      )}

      {/* ── Password Modal ── */}
      {showPwModal && (
        <div className="fixed inset-0 z-99999 flex items-end justify-center bg-slate-900/55 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="h-1.5 bg-linear-to-r from-violet-600 via-purple-400 to-indigo-500" />

            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Change Password
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Update your account password securely.
                </p>
              </div>
              <button
                onClick={closePwModal}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3.5 px-5 pb-4 sm:px-6">
              <PasswordField
                label="Current Password"
                value={currentPw}
                onChange={setCurrentPw}
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
              />
              <PasswordField
                label="New Password"
                value={newPw}
                onChange={setNewPw}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPw}
                onChange={setConfirmPw}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />

              {pwError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
                  <X className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span className="text-sm text-rose-700">{pwError}</span>
                </div>
              )}

              {pwSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Password updated successfully!
                  </span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse gap-2.5 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                onClick={closePwModal}
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || pwSuccess}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed sm:w-auto ${
                  pwSuccess
                    ? "bg-emerald-500"
                    : "bg-linear-to-br from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 disabled:opacity-70"
                }`}
              >
                {pwSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Updated!
                  </>
                ) : pwSaving ? (
                  "Updating…"
                ) : (
                  "Update Password"
                )}
              </button>
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

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-11 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}