"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-context"
import StudentLayout from "@/components/student/StudentLayout"

export default function StudentSettingsPage() {
  const { profile, signOut } = useAuth()

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword,   setCurrentPassword]   = useState("")
  const [newPassword,       setNewPassword]        = useState("")
  const [confirmPassword,   setConfirmPassword]    = useState("")
  const [passwordLoading,   setPasswordLoading]    = useState(false)

  function closePasswordModal() {
    setShowPasswordModal(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Failed to update password.")
      } else {
        toast.success("Password updated successfully!")
        closePasswordModal()
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST"

  return (
    <StudentLayout>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "var(--color-bg-overlay)" }}>
          <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl mx-4" style={{ background: "var(--color-bg-card)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button onClick={closePasswordModal} className="rounded-full p-2 hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-4">
              {[
                ["Current Password", currentPassword, setCurrentPassword, "Enter current password"],
                ["New Password",     newPassword,     setNewPassword,     "Enter new password"],
                ["Confirm Password", confirmPassword, setConfirmPassword, "Confirm new password"],
              ].map(([label, value, setter, placeholder]) => (
                <div key={label as string}>
                  <label className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{label as string}</label>
                  <input
                    type="password"
                    placeholder={placeholder as string}
                    value={value as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ background: "var(--color-bg-input)" }}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={closePasswordModal} className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "var(--color-student-accent)" }}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-3xl p-8 text-white shadow-xl" style={{ background: "linear-gradient(to right, var(--color-student-hero-from), var(--color-student-hero-to))" }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Account Settings</p>
          <h1 className="mt-3 text-4xl font-bold">Manage your account.</h1>
          <p className="mt-3 max-w-3xl opacity-80">View your profile details and manage your account security.</p>
        </section>

        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h2 className="text-xl font-bold">Profile Information</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Your account details from the school portal.</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 rounded-xl p-4" style={{ background: "var(--color-neutral-50)" }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: "var(--color-student-accent)" }}>
                {initials}
              </div>
              <div>
                <p className="font-semibold">{profile?.full_name ?? "Student"}</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{profile?.email ?? ""}</p>
                <p className="text-sm capitalize" style={{ color: "var(--color-text-muted)" }}>{profile?.role ?? "student"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Manage Password</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Change your account password anytime.</p>
            </div>
            <button onClick={() => setShowPasswordModal(true)} className="rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "var(--color-student-accent)" }}>
              Change Password
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-danger-light)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--color-danger-main)" }}>Sign Out</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Sign out of your student portal session.</p>
          <button onClick={signOut} className="mt-4 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--color-danger-main)" }}>
            Sign Out
          </button>
        </div>
      </div>
    </StudentLayout>
  )
}
