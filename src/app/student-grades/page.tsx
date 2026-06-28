"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Grade = {
  id: string;
  assessment_name: string;
  assessment_type: string;
  score: number;
  max_score: number;
  course_id: string;
  courses?: {
    title: string;
    description: string | null;
    code?: string | null;
  } | null;
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

export default function StudentGradesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchGrades() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from("grades")
        .select(
          "id, assessment_name, assessment_type, score, max_score, course_id, courses(title, description, code)"
        )
        .eq("student_id", userId);

      setGrades((data as unknown as Grade[]) || []);
      setLoading(false);
    }

    fetchGrades();
  }, []);

  // Close sidebar on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const sidebarContent = (
    <>
      <div className="p-5 lg:p-6">
        <h1 className="text-xl font-bold lg:text-2xl">SCP Portal</h1>
        <p className="text-xs text-slate-400 lg:text-sm">Student Workspace</p>
      </div>

      <nav className="mt-2 space-y-1.5 px-3 lg:mt-6 lg:space-y-2 lg:px-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`block rounded-xl px-4 py-2.5 text-sm font-medium lg:py-3 ${
              item.name === "Grades"
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
        className="mx-3 mt-4 block w-[calc(100%-1.5rem)] rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-slate-800 lg:mx-4 lg:mt-6 lg:w-[calc(100%-2rem)] lg:py-3"
      >
        Sign Out
      </button>
    </>
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 bg-slate-950 text-white lg:block">
          {sidebarContent}
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 text-white transition-transform duration-200 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end p-3">
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <section className="flex-1 min-w-0">
          <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Student Workspace
                </p>
                <h2 className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Grade Summary
                </h2>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:px-5 sm:py-2 sm:text-sm">
              {loading ? "..." : `${average}% Average`}
            </div>
          </header>

          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8">
            {/* Hero banner */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 text-white shadow-xl sm:p-6 lg:rounded-3xl lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 sm:text-sm">
                Academic Performance Center
              </p>
              <h1 className="mt-2 text-xl font-bold sm:mt-3 sm:text-2xl lg:text-4xl">
                Track your academic progress clearly.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:mt-3 sm:text-base">
                View grades by course, assessment type, score, percentage, and
                performance status.
              </p>
            </section>

            {/* Stats cards */}
            <section className="grid gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6">
              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Overall Average
                </p>
                <h3 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : `${average}%`}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Based on all recorded grades
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs text-slate-500 sm:text-sm">Assessments</p>
                <h3 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : grades.length}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Total graded items
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:col-span-2 sm:p-6 md:col-span-1">
                <p className="text-xs text-slate-500 sm:text-sm">Standing</p>
                <h3 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : getStatus(average)}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Current performance level
                </p>
              </div>
            </section>

            {/* Detailed grades */}
            <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold sm:text-xl">Detailed Grades</h3>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                All grades recorded for your enrolled courses.
              </p>

              <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading grades...</p>
                ) : grades.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center sm:p-8">
                    <p className="font-semibold">No grades found.</p>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
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
                        className="rounded-2xl border p-4 sm:p-5 md:grid md:grid-cols-5 md:items-center md:gap-4"
                      >
                        {/* Course info */}
                        <div className="md:col-span-2">
                          <p className="font-bold text-sm sm:text-base">
                            {grade.courses?.title || "Unknown Course"}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-blue-600 sm:text-sm">
                            {grade.assessment_name || "Untitled Assessment"}
                          </p>
                          <p className="text-xs text-slate-500 sm:text-sm">
                            {grade.courses?.description || "No description"}
                          </p>
                        </div>

                        {/* Mobile: row of type, score, percent */}
                        <div className="mt-3 flex items-center justify-between gap-3 md:col-span-3 md:mt-0 md:grid md:grid-cols-3">
                          <div>
                            <p className="text-xs text-slate-500">Type</p>
                            <p className="text-sm font-semibold capitalize sm:text-base">
                              {grade.assessment_type}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Score</p>
                            <p className="text-sm font-semibold sm:text-base">
                              {grade.score}/{grade.max_score}
                            </p>
                          </div>

                          <div className="text-right md:text-right">
                            <p className="text-xl font-bold text-blue-600 sm:text-2xl">
                              {percent}%
                            </p>
                            <p className="text-xs text-slate-500">
                              {getStatus(percent)}
                            </p>
                          </div>
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
