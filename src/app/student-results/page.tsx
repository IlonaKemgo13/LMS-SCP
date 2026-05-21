"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FinalResult = {
  id: string;
  title: string;
  domain: string | null;
  semester: string | null;
  file_url: string | null;
  created_at: string | null;
};

export default function StudentResultsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [results, setResults] = useState<FinalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchFinalResults() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("final_results")
        .select("id, title, domain, semester, file_url, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading final results:", error.message);
      }

      setResults(data || []);
      setLoading(false);
    }

    fetchFinalResults();
  }, []);

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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
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
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
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

          <nav className="mt-6 space-y-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                  item.name === "Results"
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
              router.push("/");
            }}
            className="mx-4 mt-6 block w-[calc(100%-2rem)] rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
          >
            Sign Out
          </button>
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
                <h2 className="text-lg font-bold sm:text-2xl">
                  Official Results
                </h2>
              </div>
            </div>

            <div className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:px-5 sm:py-2 sm:text-base">
              {loading ? "..." : `${results.length} File(s)`}
            </div>
          </header>

          <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">
            {/* Hero */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 sm:text-sm">
                Final Results Center
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                Access official semester results.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:mt-3 sm:text-base">
                View and download official results uploaded by the
                administration, organized by semester and academic domain.
              </p>
            </section>

            {/* Stats */}
            <section className="grid gap-4 grid-cols-1 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Uploaded Results</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : results.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Official PDF documents
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Public Status</p>
                <h3 className="mt-2 text-3xl font-bold">Official</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Verified by administration
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Format</p>
                <h3 className="mt-2 text-3xl font-bold">PDF</h3>
                <p className="mt-1 text-sm text-slate-400">
                  View or download securely
                </p>
              </div>
            </section>

            {/* Results list */}
            <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl font-bold">Final Result Documents</h3>
                <p className="text-sm text-slate-500">
                  Latest official results published by the administration.
                </p>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading results...</p>
                ) : results.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center sm:p-8">
                    <p className="font-semibold">No official results found.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Uploaded final results will appear here once published by
                      the administration.
                    </p>
                  </div>
                ) : (
                  results.map((result) => (
                    <div
                      key={result.id}
                      className="rounded-2xl border border-slate-200 p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                            {result.semester || "Semester not specified"}
                          </p>

                          <h4 className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-xl truncate">
                            {result.title}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            Domain: {result.domain || "Not specified"}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Uploaded:{" "}
                            {result.created_at
                              ? new Date(
                                  result.created_at
                                ).toLocaleDateString()
                              : "No date"}
                          </p>
                        </div>

                        {result.file_url ? (
                          <a
                            href={result.file_url}
                            target="_blank"
                            className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white active:scale-95 transition-transform"
                          >
                            View / Download PDF
                          </a>
                        ) : (
                          <span className="shrink-0 rounded-xl bg-red-50 px-5 py-3 text-center text-sm font-semibold text-red-600">
                            No PDF attached
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
