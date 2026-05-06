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

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

    if (profile.role === "teacher") {
      router.push("/teacher");
    } else if (profile.role === "student") {
      router.push("/student dashboard");
    } else if (profile.role === "admin") {
      router.push("/admin");
    } else if (profile.role === "parent") {
      router.push("/dashboard/parent");
    } else {
      router.push("/");
    }
  }

  return (
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
  );
}