"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  title: string;
  description: string | null;
  code?: string | null;
};

type Grade = {
  id: string;
  course_id: string;
  score: number;
  max_score: number;
};

type Recording = {
  id: string;
  course_id: string;
};

type Announcement = {
  id: string;
  course_id: string | null;
};

export default function StudentCoursesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchCoursesPageData() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        router.push("/");
        return;
      }

      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("courses(id, title, description, code)")
        .eq("student_id", userId);

      const enrolledCourses =
        enrollmentData?.map((item: any) => item.courses).filter(Boolean) || [];

      setCourses(enrolledCourses);

      const courseIds = enrolledCourses.map((course: Course) => course.id);

      const { data: gradesData } = await supabase
        .from("grades")
        .select("id, course_id, score, max_score")
        .eq("student_id", userId);

      setGrades((gradesData as Grade[]) || []);

      if (courseIds.length > 0) {
        const { data: recordingsData } = await supabase
          .from("recordings")
          .select("id, course_id")
          .in("course_id", courseIds);

        setRecordings((recordingsData as Recording[]) || []);

        const { data: announcementData } = await supabase
          .from("announcements")
          .select("id, course_id")
          .in("course_id", courseIds);

        setAnnouncements((announcementData as Announcement[]) || []);
      }

      setLoading(false);
    }

    fetchCoursesPageData();
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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      `${course.title} ${course.description || ""} ${course.code || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [courses, search]);

  function getCourseAverage(courseId: string) {
    const courseGrades = grades.filter((grade) => grade.course_id === courseId);
    const totalScore = courseGrades.reduce(
      (sum, grade) => sum + Number(grade.score || 0),
      0
    );
    const totalMax = courseGrades.reduce(
      (sum, grade) => sum + Number(grade.max_score || 0),
      0
    );
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
  }

  function getCourseRecordingCount(courseId: string) {
    return recordings.filter((recording) => recording.course_id === courseId)
      .length;
  }

  function getCourseAnnouncementCount(courseId: string) {
    return announcements.filter((a) => a.course_id === courseId).length;
  }

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
                  item.name === "Courses"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mx-4 mt-20 rounded-2xl bg-slate-900 p-4">
            <p className="text-sm font-semibold">Course Center 📚</p>
            <p className="mt-1 text-xs text-slate-400">
              Access courses, grades, recordings, and updates.
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
                <h2 className="text-lg font-bold sm:text-2xl">My Courses</h2>
              </div>
            </div>

            <div className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:px-5 sm:py-2 sm:text-base">
              {loading ? "..." : `${courses.length} Course(s)`}
            </div>
          </header>

          <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">
            {/* Hero */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 sm:text-sm">
                Academic Course Center
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                Your learning hub in one place.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:mt-3 sm:text-base">
                Review enrolled courses, monitor academic performance, open
                course materials, and access recordings or announcements.
              </p>
            </section>

            {/* Stats */}
            <section className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-4">
              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Enrolled Courses
                </p>
                <h3 className="mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : courses.length}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Active courses
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Total Grades
                </p>
                <h3 className="mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : grades.length}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Recorded scores
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs text-slate-500 sm:text-sm">Recordings</p>
                <h3 className="mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : recordings.length}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Available lectures
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Course Updates
                </p>
                <h3 className="mt-1.5 text-2xl font-bold sm:mt-2 sm:text-3xl">
                  {loading ? "..." : announcements.length}
                </h3>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Notices received
                </p>
              </div>
            </section>

            {/* Course list */}
            <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">Enrolled Courses</h3>
                  <p className="text-sm text-slate-500">
                    Search and access your registered courses.
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by course, code, or domain..."
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 md:w-96"
                />
              </div>

              <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2 sm:mt-6 sm:gap-5">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading courses...</p>
                ) : filteredCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center sm:p-8 lg:col-span-2">
                    <p className="font-semibold">No courses found.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your enrolled courses will appear here.
                    </p>
                  </div>
                ) : (
                  filteredCourses.map((course) => {
                    const average = getCourseAverage(course.id);
                    const recordingCount = getCourseRecordingCount(course.id);
                    const announcementCount = getCourseAnnouncementCount(
                      course.id
                    );

                    return (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                              {course.code || "Course"}
                            </p>
                            <h4 className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-xl">
                              {course.title}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              {course.description || "No description"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Enrolled
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 grid-cols-3 sm:mt-6 sm:gap-3">
                          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                            <p className="text-xs text-slate-500">Average</p>
                            <p className="mt-1 text-lg font-bold text-blue-600 sm:text-xl">
                              {average !== null ? `${average}%` : "N/A"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                            <p className="text-xs text-slate-500">
                              Recordings
                            </p>
                            <p className="mt-1 text-lg font-bold sm:text-xl">
                              {recordingCount}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                            <p className="text-xs text-slate-500">Updates</p>
                            <p className="mt-1 text-lg font-bold sm:text-xl">
                              {announcementCount}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                          <Link
                            href="/student-grades"
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white active:scale-95 transition-transform sm:px-4 sm:text-sm"
                          >
                            View Grades
                          </Link>

                          <Link
                            href="/student-recordings"
                            className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 active:scale-95 transition-transform sm:px-4 sm:text-sm"
                          >
                            Recordings
                          </Link>

                          <Link
                            href="/student-announcements"
                            className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 active:scale-95 transition-transform sm:px-4 sm:text-sm"
                          >
                            Announcements
                          </Link>
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
