"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  role: string | null;
  full_name: string | null;
};

export default function StudentSettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push('/');
        return;
      }

      setEmail(user.email ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      setProfile(data ?? null);
      setLoading(false);
    }

    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-slate-950 text-white">
          <div className="p-6">
            <h1 className="text-2xl font-bold">SCP Portal</h1>
            <p className="text-sm text-slate-400">Student Workspace</p>
          </div>

          <nav className="mt-6 space-y-2 px-4">
            {[
              { name: "Dashboard", href: "/student-dashboard" },
              { name: "Announcements", href: "/student-announcements" },
              { name: "Courses", href: "/student-courses" },
              { name: "Grades", href: "/student-grades" },
              { name: "Recordings", href: "/student-recordings" },
              { name: "Materials", href: "/student-materials" },
              { name: "Results", href: "/student-results" },
              { name: "Settings", href: "/student-settings" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                  item.name === "Settings"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="mx-4 mt-6 block w-[calc(100%-2rem)] rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
          >
            Sign Out
          </button>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-8 py-5">
            <div>
              <p className="text-sm text-slate-500">Student Workspace</p>
              <h2 className="text-2xl font-bold">Settings</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              {loading ? "Loading..." : (profile?.role ?? "Student")}
            </div>
          </header>

          <div className="space-y-6 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Account Settings
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Manage your account.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                View your profile details, notification preferences, and account security settings.
              </p>
            </section>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Profile Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account details from the school portal.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="mt-0.5 font-semibold">
                      {loading ? "Loading..." : (profile?.full_name ?? "Not set")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="mt-0.5 font-semibold">
                      {loading ? "Loading..." : (email ?? "Not available")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="mt-0.5 font-semibold capitalize">
                      {loading ? "Loading..." : (profile?.role ?? "Student")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Notification Preferences</h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose how you receive announcements and updates.
              </p>
              <p className="mt-4 text-sm text-slate-400 italic">
                Notification settings coming soon.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Account Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage password and account protection.
              </p>
              <p className="mt-4 text-sm text-slate-400 italic">
                Password change coming soon.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Support</h2>
              <p className="mt-1 text-sm text-slate-500">
                Contact support or get help with the portal.
              </p>
              <p className="mt-4 text-sm text-slate-400 italic">
                Support portal coming soon.
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-red-600">Sign Out</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign out of your student portal session.
              </p>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="mt-4 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
