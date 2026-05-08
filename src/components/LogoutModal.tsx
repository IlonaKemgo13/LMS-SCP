"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutModal() {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    await supabase.auth.signOut()

    router.push("/")
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>

      {open && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="h-1 bg-linear-to-r from-red-500 via-rose-500 to-pink-500" />

            <div className="flex items-start justify-between p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Confirm Logout
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Are you sure you want to logout from your account?
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                {loading ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}