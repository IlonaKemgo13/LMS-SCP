"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { createClient } from "@/lib/supabase/client"

const MAX_ATTEMPTS  = 3
const LOCKOUT_SECS  = 30

export default function Home() {
  const router  = useRouter()
  const supabase = createClient()

  const [email,        setEmail]        = useState("")
  const [password,     setPassword]     = useState("")
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [attempts,    setAttempts]    = useState(0)
  const [lockout,     setLockout]     = useState(false)
  const [countdown,   setCountdown]   = useState(0)
  const countdownRef  = useRef<NodeJS.Timeout | null>(null)

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetEmail,      setResetEmail]      = useState("")
  const [resetLoading,    setResetLoading]    = useState(false)

  function startLockout() {
    setLockout(true)
    setCountdown(LOCKOUT_SECS)
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!)
          setLockout(false)
          setAttempts(0)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (lockout) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) {
        toast.error(`Too many failed attempts. Please wait ${LOCKOUT_SECS} seconds.`)
        startLockout()
      } else {
        toast.error(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`)
      }
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setLoading(false)
      toast.error("Unable to get user information.")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single()

    setLoading(false)

    if (!profile) {
      toast.error("No role found for this user.")
      return
    }

    if (profile.role === "teacher")       router.push("/teacher")
    else if (profile.role === "student")  router.push("/student-dashboard")
    else if (profile.role === "admin")    router.push("/admin")
    else if (profile.role === "parent")   router.push("/dashboard/parent")
    else router.push("/")
  }

  async function handleForgotPassword() {
    if (!resetEmail) {
      toast.error("Please enter your email address.")
      return
    }

    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password reset link sent! Check your inbox.")
      setShowForgotModal(false)
      setResetEmail("")
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <main className="font-body min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white">

        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Reset Password</h2>
                  <p className="text-sm text-slate-500 mt-1">Enter your email to receive a secure reset link.</p>
                </div>
                <button onClick={() => { setShowForgotModal(false); setResetEmail("") }} className="text-slate-400 hover:text-slate-600 text-xl p-1">×</button>
              </div>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="your.email@institution.edu"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setShowForgotModal(false); setResetEmail("") }} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button onClick={handleForgotPassword} disabled={resetLoading} className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="flex min-h-screen w-full items-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">

            <div className="space-y-8 sm:space-y-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 sm:h-12 sm:w-12">
                  <span className="text-[10px] font-bold tracking-widest text-white sm:text-xs">SCP</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-wide sm:text-xl">SCP Portal</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-blue-300 sm:text-xs">School Communication Platform</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <span className="inline-block border-b border-blue-400/40 pb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-300 sm:text-xs">Academic Management System</span>
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl xl:text-6xl">
                  A smarter way<br className="hidden sm:block" /> to manage<br className="hidden sm:block" />
                  {" "}<span className="text-blue-400">school communication</span>
                </h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                  Connect administrators, teachers, students, and parents in one modern platform.
                </p>
              </div>

              <div className="hidden grid-cols-3 gap-3 sm:grid sm:gap-4">
                {[
                  { value: "4", label: "Roles", desc: "User types" },
                  { value: "24/7", label: "Access", desc: "Availability" },
                  { value: "SSL", label: "Secure", desc: "Encrypted" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:p-4">
                    <p className="text-lg font-bold text-white sm:text-xl">{item.value}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">{item.label}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl sm:rounded-3xl sm:p-10">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-500">Sign in to access your school portal</p>
                    <div className="mt-3 h-px bg-gradient-to-r from-blue-600/40 via-blue-400/20 to-transparent sm:mt-4" />
                  </div>

                  {lockout && (
                    <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                      <p className="text-sm font-semibold text-orange-700">
                        Account locked. Try again in {countdown}s.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        required
                        disabled={lockout}
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Password</label>
                        <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          required
                          disabled={lockout}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600">
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || lockout}
                      className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold tracking-wide text-white shadow-lg transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
                    >
                      {loading ? "Signing in..." : lockout ? `Locked (${countdown}s)` : "Sign In"}
                    </button>
                  </form>

                  <div className="mt-6 sm:mt-8">
                    <div className="mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:mb-5" />
                    <p className="text-center text-[10px] uppercase tracking-wider text-slate-400 sm:text-xs">
                      Administrators · Teachers · Students · Parents
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </>
  )
}
