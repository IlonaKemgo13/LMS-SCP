"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  deadline: string | null;
  is_global: boolean | null;
};

type Course = {
  id: string;
  name: string;
  domain: string | null;
};

export default function StudentAnnouncementsPage() {
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
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
      setLoading(false);
    }

    fetchAnnouncements();
  }, []);

  const upcoming = announcements.filter(
    (item) => item.deadline && new Date(item.deadline) >= new Date()
  );

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
                  item.name === "Announcements"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mx-4 mt-20 rounded-2xl bg-slate-900 p-4">
            <p className="text-sm font-semibold">Announcement Center 📢</p>
            <p className="mt-1 text-xs text-slate-400">
              View course updates, deadlines, and school notices.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-8 py-5">
            <div>
              <p className="text-sm text-slate-500">Student Workspace</p>
              <h2 className="text-2xl font-bold">Announcements</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              {loading ? "Loading..." : `${announcements.length} Notice(s)`}
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Smart Communication Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Never miss an academic update.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                See course-specific announcements, assignment reminders,
                project deadlines, and general school updates in one place.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Announcements</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : announcements.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Available to you
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Upcoming Deadlines</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : upcoming.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Still pending
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Enrolled Courses</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : courses.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Receiving updates
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">All Announcements</h3>
                    <p className="text-sm text-slate-500">
                      Sorted by nearest deadline.
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    Student View
                  </span>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">
                      Loading announcements...
                    </p>
                  ) : announcements.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-8 text-center">
                      <p className="font-semibold">No announcements found.</p>
                      <p className="mt-1 text-sm text-slate-500">
                        New updates will appear here when teachers post them.
                      </p>
                    </div>
                  ) : (
                    announcements.map((item) => {
                      const isUrgent =
                        item.deadline &&
                        new Date(item.deadline) <
                          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-bold">
                                {item.title}
                              </h4>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {item.content || "No content provided."}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-3">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {item.is_global
                                    ? "Global announcement"
                                    : "Course-specific"}
                                </span>

                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                  {item.deadline
                                    ? `Due: ${new Date(
                                        item.deadline
                                      ).toLocaleDateString()}`
                                    : "No deadline"}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isUrgent
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {isUrgent ? "Urgent" : "Update"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Deadline Timeline</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upcoming academic dates.
                </p>

                <div className="mt-6 space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">
                      Loading timeline...
                    </p>
                  ) : upcoming.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No upcoming deadlines.
                    </p>
                  ) : (
                    upcoming.map((item) => (
                      <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.content || "No details"}
                        </p>
                        <p className="mt-2 text-sm font-bold text-blue-600">
                          {item.deadline
                            ? new Date(item.deadline).toLocaleDateString()
                            : "No deadline"}
                        </p>
                      </div>
                    ))
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