"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-context"
import { useParentChildren } from "@/lib/hooks/useParentData"

export default function ParentProfilePage() {
  const { profile, signOut } = useAuth()
  const { data } = useParentChildren()
  const children: any[] = data?.children ?? []

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

  return (
    <div className="space-y-6">
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
                  <label className="mb-1 block text-sm font-medium">{label as string}</label>
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
                <button onClick={closePasswordModal} className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold">Cancel</button>
                <button onClick={handlePasswordChange} disabled={passwordLoading} className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-parent-accent)" }}>
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            {[
              ["Full Name", profile?.full_name ?? "—"],
              ["Email",     profile?.email ?? "—"],
              ["Role",      "Parent"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                <p className="font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
          <h2 className="text-lg font-semibold mb-4">Linked Students</h2>
          {children.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No students linked to your account. Contact the administrator.</p>
          ) : (
            <div className="space-y-3">
              {children.map((item: any) => {
                const child = item.profiles ?? item
                return (
                  <div key={child.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "var(--color-neutral-50)" }}>
                    <div>
                      <p className="font-semibold">{child.full_name}</p>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{child.email}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--color-primary-50)", color: "var(--color-parent-accent)" }}>
                      Student
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold">Security</h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Manage your password and account security</p>
          </div>
          <button onClick={() => setShowPasswordModal(true)} className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--color-parent-accent)" }}>
            Change Password
          </button>
        </div>
      </div>

      <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--color-bg-card)", borderColor: "var(--color-danger-light)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-danger-main)" }}>Sign Out</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>Sign out of your parent portal session.</p>
        <button onClick={signOut} className="mt-4 rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--color-danger-main)" }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
