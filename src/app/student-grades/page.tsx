"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Grade = {
  id: string;
  type: string;
  score: number;
  max_score: number;
  course_id: string;
  courses?: {
    name: string;
    domain: string | null;
    course_code?: string | null;
  } | null;
};

export default function StudentGradesPage() {
  const supabase = createClient();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("grades")
        .select("id, type, score, max_score, course_id, courses(name, domain, course_code)")
        .eq("student_id", userId);

      setGrades((data as Grade[]) || []);
      setLoading(false);
    }

    fetchGrades();
  }, []);

  const totalScore = grades.reduce(
    (sum, grade) => sum + Number(grade.score || 0),
    0
  );

  const totalMax = grades.reduce(
    (sum, grade) => sum + Number(grade.max_score || 0),
    0
  );

  const average = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  function getStatus(percent: number) {
    if (percent >= 85) return "Excellent";
    if (percent >= 70) return "Good";
    if (percent >= 50) return "Needs Improvement";
    return "At Risk";
  }

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
                  item.name === "Grades"
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
              <h2 className="text-2xl font-bold">Grade Summary</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              {loading ? "Loading..." : `${average}% Average`}
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Academic Performance Center
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Track your academic progress clearly.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                View grades by course, assessment type, score, percentage, and
                performance status.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Overall Average</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : `${average}%`}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Based on all recorded grades
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Assessments</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : grades.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">Total graded items</p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Standing</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : getStatus(average)}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Current performance level
                </p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">Detailed Grades</h3>
              <p className="mt-1 text-sm text-slate-500">
                All grades recorded for your enrolled courses.
              </p>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading grades...</p>
                ) : grades.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center">
                    <p className="font-semibold">No grades found.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your grades will appear here once teachers publish them.
                    </p>
                  </div>
                ) : (
                  grades.map((grade) => {
                    const percent =
                      grade.max_score > 0
                        ? Math.round((grade.score / grade.max_score) * 100)
                        : 0;

                    return (
                      <div
                        key={grade.id}
                        className="grid gap-4 rounded-2xl border p-5 md:grid-cols-5 md:items-center"
                      >
                        <div className="md:col-span-2">
                          <p className="font-bold">
                            {grade.courses?.name || "Unknown Course"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {grade.courses?.domain || "No domain"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">Type</p>
                          <p className="font-semibold capitalize">
                            {grade.type}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">Score</p>
                          <p className="font-semibold">
                            {grade.score}/{grade.max_score}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {percent}%
                          </p>
                          <p className="text-sm text-slate-500">
                            {getStatus(percent)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}