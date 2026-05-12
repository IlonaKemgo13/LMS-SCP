"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Get user role to redirect correctly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (profile?.role === "parent") {
          router.push("/dashboard/parent");
        } else if (profile?.role === "teacher") {
          router.push("/teacher");
        } else if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/student-dashboard");
        }
      } else {
        router.push("/dashboard/parent");
      }
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = (role: string) => {
    const demos: Record<string, { email: string; password: string }> = {
      parent: { email: "parent@school.com", password: "parent123" },
      teacher: { email: "teacher@school.com", password: "teacher123" },
      student: { email: "student@school.com", password: "student123" },
      admin: { email: "admin@school.com", password: "admin123" },
    };
    if (demos[role]) {
      setEmail(demos[role].email);
      setPassword(demos[role].password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SCP Portal</h1>
          <p className="text-gray-500 mt-1">Smart Communication Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-6">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@school.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-gray-400 text-center mb-3">Demo Credentials (click to auto-fill)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemoCredentials("parent")}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition"
              >
                👪 Parent
              </button>
              <button
                onClick={() => fillDemoCredentials("teacher")}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 transition"
              >
                👩‍🏫 Teacher
              </button>
              <button
                onClick={() => fillDemoCredentials("student")}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition"
              >
                🎓 Student
              </button>
              <button
                onClick={() => fillDemoCredentials("admin")}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100 transition"
              >
                👑 Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
