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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/");
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

  async function handlePasswordChange() {
    setPasswordMessage("");
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 2000);
    }
  }

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  const navItems = [
    { name: "Dashboard", href: "/student-dashboard" },
    { name: "Announcements", href: "/student-announcements" },
    { name: "Courses", href: "/student-courses" },
    { name: "Grades", href: "/student-grades" },
    { name: "Recordings", href: "/student-recordings" },
    { name: "Materials", href: "/student-materials" },
    { name: "Results", href: "/student-results" },
    { name: "Settings", href: "/student-settings" },
  ];

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Sign Out</h2>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to sign out?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                No, Stay
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <h2 className="text-xl font-bold">Manage Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordMessage("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mb-5 text-sm text-slate-500 sm:mb-6">
              Update your account password below.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="text-sm text-green-600">{passwordMessage}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordMessage("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-slate-950 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-bold">SCP Portal</h1>
              <p className="text-sm text-slate-400">Student Workspace</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
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

          <div className="p-4">
            <button
              onClick={() => setShowSignOutModal(true)}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 min-w-0">
          <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-3">
              {/* Hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <p className="text-sm text-slate-500">Student Workspace</p>
                <h2 className="text-lg font-bold sm:text-2xl">Settings</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button className="relative rounded-full p-2 hover:bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-600"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                  {loading ? "..." : (profile?.full_name ?? "Student")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-5 p-4 sm:space-y-6 sm:p-8">
            {/* Hero */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 sm:text-sm">
                Account Settings
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                Manage your account.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:mt-3 sm:text-base">
                View your profile details and manage your account security.
              </p>
            </section>

            {/* Profile info */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your account details from the school portal.
              </p>
              <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                <div className="rounded-xl bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="mt-0.5 font-semibold break-all">
                    {loading
                      ? "Loading..."
                      : (profile?.full_name ?? "Not set")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-sm text-slate-500">Email Address</p>
                  <p className="mt-0.5 font-semibold break-all">
                    {loading ? "Loading..." : (email ?? "Not available")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="mt-0.5 font-semibold capitalize">
                    {loading ? "Loading..." : (profile?.role ?? "Student")}
                  </p>
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Manage Password</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Change your account password anytime.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-transform"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Sign out section */}
            <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-red-600">Sign Out</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign out of your student portal session.
              </p>
              <button
                onClick={() => setShowSignOutModal(true)}
                className="mt-4 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 transition-transform"
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
