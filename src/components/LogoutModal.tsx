"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { LogOut, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LogoutModal() {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    setLoading(true)

    await supabase.auth.signOut()

    router.push("/")
    router.refresh()
  }

  const modal =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

              <div className="p-6 sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Confirm Logout
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Are you sure you want to logout from your account?
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {loading ? "Logging out..." : "Yes, Logout"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span>Logout</span>
      </button>

      {modal}
    </>
  )
}