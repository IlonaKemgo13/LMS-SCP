"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
=======
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
>>>>>>> 5d9b10b0c581edc6bf1ced73c01c3cb443494892

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

<<<<<<< HEAD
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
=======
    const { error } = await supabase.auth.signInWithPassword({ email, password });
>>>>>>> 5d9b10b0c581edc6bf1ced73c01c3cb443494892

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setLoading(false);
      setErrorMessage("Unable to get user information.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      setErrorMessage("No role found for this user.");
      return;
    }

<<<<<<< HEAD
    if (profile.role === "teacher") {
      router.push("/teacher");
    } else if (profile.role === "student") {
      router.push("/student-dashboard");
    } else if (profile.role === "admin") {
      router.push("/admin");
    } else if (profile.role === "parent") {
      router.push("/dashboard/parent");
    } else {
      router.push("/");
=======
    if (profile.role === "teacher") router.push("/teacher");
    else if (profile.role === "student") router.push("/student-dashboard");
    else if (profile.role === "admin") router.push("/admin");
    else if (profile.role === "parent") router.push("/dashboard/parent");
    else router.push("/");
  }

  async function handleForgotPassword() {
    setResetMessage("");
    setResetError("");

    if (!resetEmail) {
      setResetError("Please enter your email address.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetLoading(false);

    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage("Password reset link sent. Please check your inbox.");
>>>>>>> 5d9b10b0c581edc6bf1ced73c01c3cb443494892
    }
  }

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-200">
              School Communication & LMS
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              A smarter way to manage
              <span className="block text-blue-400">school communication</span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Connect administrators, teachers, students, and parents in one
              modern platform for announcements, learning materials, and school
              updates.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl">
                  🎓
                </div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your school portal
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                Secure access for admins, teachers, students, and parents
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
=======
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <main className="font-body min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white">

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl mx-4 text-slate-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">Reset Password</h2>
                  <p className="text-sm text-slate-500 mt-1">Enter your email to receive a secure reset link.</p>
                </div>
                <button
                  onClick={() => { setShowForgotModal(false); setResetEmail(""); setResetMessage(""); setResetError(""); }}
                  className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@institution.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {resetError && <p className="text-sm text-red-600">{resetError}</p>}
                {resetMessage && <p className="text-sm text-green-600">{resetMessage}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowForgotModal(false); setResetEmail(""); setResetMessage(""); setResetError(""); }}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={resetLoading || !!resetMessage}
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="flex min-h-screen w-full items-center px-6 py-12">
          <div className="grid w-full gap-16 lg:grid-cols-2 lg:items-center max-w-7xl mx-auto">

            {/* Left side */}
            <div className="space-y-10">

              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                  <span className="text-xs font-bold tracking-widest text-white">SCP</span>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold tracking-wide">SCP Portal</p>
                  <p className="text-xs text-blue-300 tracking-wider uppercase mt-0.5">School Communication Platform</p>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-6">
                <span className="inline-block text-xs font-semibold text-blue-300 uppercase tracking-widest border-b border-blue-400/40 pb-2">
                  Academic Management System
                </span>

                <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight">
                  A smarter way<br />
                  to manage<br />
                  <span className="text-blue-400">school communication</span>
                </h1>

                <p className="text-base leading-8 text-slate-300 max-w-lg">
                  Connect administrators, teachers, students, and parents in one modern platform for announcements, learning materials, and school updates.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "4", label: "Roles", desc: "User types" },
                  { value: "24/7", label: "Access", desc: "Availability" },
                  { value: "SSL", label: "Secure", desc: "Encrypted" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="rounded-3xl border border-white/10 bg-white p-10 text-slate-900 shadow-2xl">

                  <div className="mb-8">
                    <h2 className="font-display text-3xl font-bold text-slate-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Sign in to access your school portal
                    </p>
                    <div className="mt-4 h-px bg-gradient-to-r from-blue-600/40 via-blue-400/20 to-transparent" />
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 pr-16 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 tracking-wider uppercase"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 tracking-wide"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  <div className="mt-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5" />
                    <p className="text-center text-xs text-slate-400 tracking-wider uppercase">
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
>>>>>>> 5d9b10b0c581edc6bf1ced73c01c3cb443494892
  );
}
