"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  deadline: string | null;
};

type Course = {
  id: string;
  title: string;
  description: string | null;
};

export default function StudentAnnouncementsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        router.push("/");
        return;
      }

      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("courses(id, title, description)")
        .eq("student_id", userId);

      const enrolledCourses =
        enrollmentData?.map((item: any) => item.courses).filter(Boolean) || [];

      setCourses(enrolledCourses);

      const courseIds = enrolledCourses.map((course: Course) => course.id);

      let announcementData = null;
      if (courseIds.length > 0) {
        const { data } = await supabase
          .from("announcements")
          .select("id, title, content, deadline, course_id")
          .in("course_id", courseIds)
          .order("deadline", { ascending: true });
        announcementData = data;
      }
      setAnnouncements(announcementData || []);
      setLoading(false);
    }

    fetchAnnouncements();
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

  const upcoming = announcements.filter(
    (item) => item.deadline && new Date(item.deadline) >= new Date()
  );

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

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="mx-4 mt-4 block w-[calc(100%-2rem)] rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
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
                  Announcements
                </h2>
              </div>
            </div>

            <div className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:px-5 sm:py-2 sm:text-base">
              {loading ? "..." : `${announcements.length} Notice(s)`}
            </div>
          </header>

          <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">
            {/* Hero */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 sm:text-sm">
                Smart Communication Portal
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                Never miss an academic update.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:mt-3 sm:text-base">
                See course-specific announcements, assignment reminders,
                project deadlines, and general school updates in one place.
              </p>
            </section>

            {/* Stats */}
            <section className="grid gap-4 grid-cols-1 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Total Announcements</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : announcements.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">Available to you</p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Upcoming Deadlines</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : upcoming.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">Still pending</p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Enrolled Courses</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : courses.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Receiving updates
                </p>
              </div>
            </section>

            {/* Announcements + Timeline */}
            <section className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* All Announcements */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">All Announcements</h3>
                    <p className="text-sm text-slate-500">
                      Sorted by nearest deadline.
                    </p>
                  </div>

                  <span className="self-start rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    Student View
                  </span>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">
                      Loading announcements...
                    </p>
                  ) : announcements.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center sm:p-8">
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
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base font-bold sm:text-lg">
                                {item.title}
                              </h4>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {item.content || "No content provided."}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  Course announcement
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
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:px-3 ${
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

              {/* Deadline Timeline */}
              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-xl font-bold">Deadline Timeline</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upcoming academic dates.
                </p>

                <div className="mt-5 space-y-4 sm:mt-6">
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
                      <div
                        key={item.id}
                        className="rounded-xl bg-slate-50 p-3 sm:p-4"
                      >
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
