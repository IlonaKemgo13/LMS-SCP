"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  domain: string | null;
};

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  deadline: string | null;
  is_global: boolean | null;
};

type Grade = {
  id: string;
  type: string;
  score: number;
  max_score: number;
  course_id: string;
  courses?: {
    name: string;
  } | null;
};

export default function DashboardPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [recordingsCount, setRecordingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("courses(id, name, domain)")
        .eq("student_id", userId);

      const enrolledCourses =
        enrollmentData?.map((item: any) => item.courses).filter(Boolean) || [];

      setCourses(enrolledCourses);

      const courseIds = enrolledCourses.map((course: Course) => course.id);

      const { data: announcementData } = await supabase
        .from("announcements")
        .select("id, title, content, deadline, is_global, course_id")
        .or(
          courseIds.length > 0
            ? `is_global.eq.true,course_id.in.(${courseIds.join(",")})`
            : "is_global.eq.true"
        )
        .order("deadline", { ascending: true });

      setAnnouncements(announcementData || []);

      const { data: gradesData } = await supabase
        .from("grades")
        .select("id, type, score, max_score, course_id, courses(name)")
        .eq("student_id", userId);

      setGrades((gradesData as Grade[]) || []);

      const { data: recordingsData } = await supabase
        .from("recordings")
        .select("id, course_id")
        .in("course_id", courseIds.length > 0 ? courseIds : [""]);

      setRecordingsCount(recordingsData?.length || 0);

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const upcomingDeadlines = announcements.filter(
    (item) => item.deadline && new Date(item.deadline) >= new Date()
  );

  const totalScore = grades.reduce(
    (sum, grade) => sum + Number(grade.score || 0),
    0
  );

  const totalMaxScore = grades.reduce(
    (sum, grade) => sum + Number(grade.max_score || 0),
    0
  );

  const average =
    totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

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
                  item.name === "Dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mx-4 mt-20 rounded-2xl bg-slate-900 p-4">
            <p className="text-sm font-semibold">Welcome back 👋</p>
            <p className="mt-1 text-xs text-slate-400">
              Track your courses, grades, announcements, and recordings.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-8 py-5">
            <div>
              <p className="text-sm text-slate-500">Student Dashboard</p>
              <h2 className="text-2xl font-bold">Academic Overview</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              Student
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Smart Communication Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Stay updated. Stay prepared.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                View your recent announcements, deadlines, enrolled courses,
                grades, materials, and lecture recordings from one clean dashboard.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-4">
              {[
                ["Courses", loading ? "..." : String(courses.length), "Active enrolled courses"],
                ["Average", loading ? "..." : `${average}%`, "Current performance"],
                ["Deadlines", loading ? "..." : String(upcomingDeadlines.length), "Upcoming deadlines"],
                ["Recordings", loading ? "..." : String(recordingsCount), "Available lectures"],
              ].map(([title, value, desc]) => (
                <div key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">{title}</p>
                  <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                  <p className="mt-1 text-sm text-slate-400">{desc}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Recent Announcements</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    Latest
                  </span>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading announcements...</p>
                  ) : announcements.length === 0 ? (
                    <p className="text-sm text-slate-500">No announcements found.</p>
                  ) : (
                    announcements.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="mt-1 text-sm text-slate-600">
                              {item.content || "No content"}
                            </p>
                            <p className="mt-2 text-sm font-medium text-red-500">
                              {item.deadline ? `Due: ${item.deadline}` : "No deadline"}
                            </p>
                          </div>
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            {item.is_global ? "Global" : "Course"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Upcoming Deadlines</h3>

                <div className="mt-5 space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading deadlines...</p>
                  ) : upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-slate-500">No upcoming deadlines.</p>
                  ) : (
                    upcomingDeadlines.map((item) => (
                      <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-slate-500">
                          {item.content || "No details"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {item.deadline}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Enrolled Courses</h3>

                <div className="mt-5 space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading courses...</p>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-slate-500">No enrolled courses found.</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between rounded-xl border p-4">
                        <div>
                          <p className="font-semibold">{course.name}</p>
                          <p className="text-sm text-slate-500">
                            {course.domain || "No domain"}
                          </p>
                        </div>
                        <Link
href="/student-courses"
className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
>
View
</Link>

                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Grade Summary</h3>

                <div className="mt-5 space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading grades...</p>
                  ) : grades.length === 0 ? (
                    <p className="text-sm text-slate-500">No grades found.</p>
                  ) : (
                    grades.map((grade) => {
                      const percent =
                        grade.max_score > 0
                          ? Math.round((grade.score / grade.max_score) * 100)
                          : 0;

                      return (
                        <div key={grade.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                          <div>
                            <p className="font-semibold">
                              {grade.courses?.name || "Unknown Course"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {grade.type}: {grade.score}/{grade.max_score}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-blue-600">
                            {percent}%
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}