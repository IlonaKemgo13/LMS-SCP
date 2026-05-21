"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
};

type Course = {
  id: string;
  title: string;
  description: string | null;
};

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  deadline: string | null;
};

type Grade = {
  id: string;
  assessment_type: string;
  score: number;
  max_score: number;
  course_id: string;
  courses?: {
    title: string;
  } | null;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [recordingsCount, setRecordingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        router.push("/");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      setProfile(profileData ?? null);

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

      const { data: gradesData } = await supabase
        .from("grades")
        .select("id, assessment_type, score, max_score, course_id, courses(title)")
        .eq("student_id", userId);
      setGrades((gradesData as unknown as Grade[]) || []);

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

  const totalScore = grades.reduce((sum, g) => sum + Number(g.score || 0), 0);
  const totalMaxScore = grades.reduce((sum, g) => sum + Number(g.max_score || 0), 0);
  const average = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  const notificationCount = announcements.length;

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

      {/* ===== SIGN OUT MODAL ===== */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">Sign Out</h2>
            <p className="mt-2 text-sm text-slate-500">Are you sure you want to sign out?</p>
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

      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">

        {/* ===== SIDEBAR — slides in on mobile, fixed on desktop ===== */}
        <aside
          className={`
            fixed top-0 left-0 h-screen w-64 bg-slate-950 text-white flex flex-col z-50 overflow-y-auto
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-2xl font-bold">SCP Portal</h1>
              <p className="text-sm text-slate-400">Student Workspace</p>
            </div>
            {/* Close X — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded-lg p-1.5 hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="mt-2 space-y-2 px-4 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
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

          <div className="mx-4 rounded-2xl bg-slate-900 p-4">
            <p className="text-sm font-semibold">Welcome back</p>
            <p className="mt-1 text-xs text-slate-400">
              Track your courses, grades, announcements, and recordings.
            </p>
          </div>

          <div className="p-4">
            <button
              onClick={() => setShowSignOutModal(true)}
              className="flex items-center gap-2 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT — offset on desktop ===== */}
        <section className="flex-1 lg:ml-64 min-w-0">

          {/* HEADER */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 sm:px-8 py-4 sm:py-5 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex-shrink-0 rounded-lg p-2 hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Student Dashboard</p>
                <h2 className="text-lg sm:text-2xl font-bold truncate">Academic Overview</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* NOTIFICATION BELL */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-full p-2 hover:bg-slate-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white ring-2 ring-white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                {showNotifications && (
                  <div className="absolute right-0 sm:right-0 top-12 w-[calc(100vw-2rem)] sm:w-96 max-w-[24rem] rounded-2xl border border-slate-200 bg-white shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b px-4 sm:px-5 py-4">
                      <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                        {notificationCount} new
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loading ? (
                        <p className="px-5 py-6 text-center text-sm text-slate-500">Loading notifications...</p>
                      ) : announcements.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                          <p className="mt-2 text-sm text-slate-500">No notifications yet</p>
                        </div>
                      ) : (
                        announcements.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex gap-3 px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                              index < announcements.length - 1 ? "border-b border-slate-100" : ""
                            }`}
                          >
                            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{item.content || "No details available"}</p>
                              {item.deadline && (
                                <p className="mt-1 text-xs font-medium text-red-500">Due: {item.deadline}</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {announcements.length > 0 && (
                      <div className="border-t px-5 py-3">
                        <Link
                          href="/student-announcements"
                          onClick={() => setShowNotifications(false)}
                          className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View all announcements
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User — name hidden on xs */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  {loading ? "..." : (profile?.full_name ?? "Student")}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          {/* PAGE BODY */}
          <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">

            {/* Hero */}
            <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 sm:p-8 text-white shadow-xl">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-100">
                Smart Communication Portal
              </p>
              <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-bold leading-tight">
                Stay updated. Stay prepared.
              </h1>
              <p className="mt-2 sm:mt-3 max-w-3xl text-sm sm:text-base text-blue-100">
                View your recent announcements, deadlines, enrolled courses,
                grades, materials, and lecture recordings from one clean dashboard.
              </p>
            </section>

            {/* Stats — 2 cols on mobile, 4 on md+ */}
            <section className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
              {[
                ["Courses", loading ? "..." : String(courses.length), "Active enrolled courses"],
                ["Average", loading ? "..." : `${average}%`, "Current performance"],
                ["Deadlines", loading ? "..." : String(upcomingDeadlines.length), "Upcoming deadlines"],
                ["Recordings", loading ? "..." : String(recordingsCount), "Available lectures"],
              ].map(([title, value, desc]) => (
                <div key={title} className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
                  <p className="text-xs sm:text-sm text-slate-500">{title}</p>
                  <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold">{value}</h3>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-400 hidden sm:block">{desc}</p>
                </div>
              ))}
            </section>

            {/* Announcements + Deadlines */}
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6 shadow-sm lg:col-span-2">
                <div className="mb-4 sm:mb-5 flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold">Recent Announcements</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs sm:text-sm text-blue-700">Latest</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading announcements...</p>
                  ) : announcements.length === 0 ? (
                    <p className="text-sm text-slate-500">No announcements found.</p>
                  ) : (
                    announcements.map((item) => (
                      <div key={item.id} className="rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm sm:text-base truncate">{item.title}</h4>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">{item.content || "No content"}</p>
                            <p className="mt-2 text-xs sm:text-sm font-medium text-red-500">
                              {item.deadline ? `Due: ${item.deadline}` : "No deadline"}
                            </p>
                          </div>
                          <span className="flex-shrink-0 rounded-full bg-red-50 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-red-600">Course</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold">Upcoming Deadlines</h3>
                <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading deadlines...</p>
                  ) : upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-slate-500">No upcoming deadlines.</p>
                  ) : (
                    upcomingDeadlines.map((item) => (
                      <div key={item.id} className="rounded-xl bg-slate-50 p-3 sm:p-4">
                        <p className="font-semibold text-sm sm:text-base">{item.title}</p>
                        <p className="text-xs sm:text-sm text-slate-500">{item.content || "No details"}</p>
                        <p className="mt-1 text-xs sm:text-sm font-bold text-blue-600">{item.deadline}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Courses + Grades */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold">Enrolled Courses</h3>
                <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading courses...</p>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-slate-500">No enrolled courses found.</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 sm:p-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{course.title}</p>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">{course.description || "No description"}</p>
                        </div>
                        <Link href="/student-courses" className="flex-shrink-0 rounded-lg bg-slate-900 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white">
                          View
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold">Grade Summary</h3>
                <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading grades...</p>
                  ) : grades.length === 0 ? (
                    <p className="text-sm text-slate-500">No grades found.</p>
                  ) : (
                    grades.map((grade) => {
                      const percent = grade.max_score > 0 ? Math.round((grade.score / grade.max_score) * 100) : 0;
                      return (
                        <div key={grade.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 sm:p-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{grade.courses?.title || "Unknown Course"}</p>
                            <p className="text-xs sm:text-sm text-slate-500">{grade.assessment_type}: {grade.score}/{grade.max_score}</p>
                          </div>
                          <p className="text-lg sm:text-xl font-bold text-blue-600 flex-shrink-0">{percent}%</p>
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
