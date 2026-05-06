"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  const [results, setResults] = useState<FinalResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinalResults() {
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
                  item.name === "Results"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-8 py-5">
            <div>
              <p className="text-sm text-slate-500">Student Workspace</p>
              <h2 className="text-2xl font-bold">Official Results</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              {loading ? "Loading..." : `${results.length} File(s)`}
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Final Results Center
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Access official semester results.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                View and download official results uploaded by the administration,
                organized by semester and academic domain.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Uploaded Results</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : results.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Official PDF documents
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Public Status</p>
                <h3 className="mt-2 text-3xl font-bold">Official</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Verified by administration
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Format</p>
                <h3 className="mt-2 text-3xl font-bold">PDF</h3>
                <p className="mt-1 text-sm text-slate-400">
                  View or download securely
                </p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Final Result Documents</h3>
                <p className="text-sm text-slate-500">
                  Latest official results published by the administration.
                </p>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading results...</p>
                ) : results.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center">
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
                      className="rounded-2xl border border-slate-200 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                            {result.semester || "Semester not specified"}
                          </p>

                          <h4 className="mt-2 text-xl font-bold">
                            {result.title}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            Domain: {result.domain || "Not specified"}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Uploaded:{" "}
                            {result.created_at
                              ? new Date(result.created_at).toLocaleDateString()
                              : "No date"}
                          </p>
                        </div>

                        {result.file_url ? (
                          <a
                            href={result.file_url}
                            target="_blank"
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                          >
                            View / Download PDF
                          </a>
                        ) : (
                          <span className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600">
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