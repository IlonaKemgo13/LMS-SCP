"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { createClient } from "@/lib/supabase/client"

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  const [password,  setPassword]  = useState("")
  const [confirm,   setConfirm]   = useState("")
  const [loading,   setLoading]   = useState(false)
  const [showPass,  setShowPass]  = useState(false)

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error("Failed to reset password. The link may have expired.")
    } else {
      toast.success("Password updated successfully! Redirecting to login…")
      setTimeout(() => router.push("/"), 2000)
    }
  }

  return (
    <form onSubmit={handleReset} className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
          Confirm Password
        </label>
        <input
          type={showPass ? "text" : "password"}
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          required
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold tracking-wide text-white shadow-lg transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
      >
        {loading ? "Updating…" : "Set New Password"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Remember your password?{" "}
        <a href="/" className="font-semibold text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl sm:rounded-3xl sm:p-10">
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold tracking-widest text-slate-600">SCP</span>
              </div>
              <p className="text-sm font-semibold text-slate-600">SCP Portal</p>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Set New Password</h1>
            <p className="mt-2 text-sm text-slate-500">Enter a new password for your account.</p>
            <div className="mt-3 h-px bg-gradient-to-r from-blue-600/40 via-blue-400/20 to-transparent sm:mt-4" />
          </div>

          <Suspense fallback={<div className="py-8 text-center text-sm text-slate-400">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
