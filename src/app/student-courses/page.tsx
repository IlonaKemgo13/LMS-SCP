"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  domain: string | null;
  course_code?: string | null;
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

  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoursesPageData() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("courses(id, name, domain, course_code)")
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
          .or(`is_global.eq.true,course_id.in.(${courseIds.join(",")})`);

        setAnnouncements((announcementData as Announcement[]) || []);
      }

      setLoading(false);
    }

    fetchCoursesPageData();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      `${course.name} ${course.domain || ""} ${course.course_code || ""}`
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
    return announcements.filter(
      (announcement) =>
        announcement.course_id === courseId || announcement.course_id === null
    ).length;
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
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-8 py-5">
            <div>
              <p className="text-sm text-slate-500">Student Workspace</p>
              <h2 className="text-2xl font-bold">My Courses</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              {loading ? "Loading..." : `${courses.length} Course(s)`}
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Academic Course Center
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Your learning hub in one place.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                Review enrolled courses, monitor academic performance, open
                course materials, and access recordings or announcements.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Enrolled Courses</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : courses.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">Active courses</p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Grades</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : grades.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">Recorded scores</p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Recordings</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : recordings.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Available lectures
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Course Updates</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : announcements.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">Notices received</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
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
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 md:w-96"
                />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading courses...</p>
                ) : filteredCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center lg:col-span-2">
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
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                              {course.course_code || "Course"}
                            </p>
                            <h4 className="mt-2 text-xl font-bold">
                              {course.name}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              {course.domain || "No domain specified"}
                            </p>
                          </div>

                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Enrolled
                          </span>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Average</p>
                            <p className="mt-1 text-xl font-bold text-blue-600">
                              {average !== null ? `${average}%` : "N/A"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Recordings</p>
                            <p className="mt-1 text-xl font-bold">
                              {recordingCount}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Updates</p>
                            <p className="mt-1 text-xl font-bold">
                              {announcementCount}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href="/student-grades"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                          >
                            View Grades
                          </Link>

                          <Link
                            href="/student-recordings"
                            className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
                          >
                            Recordings
                          </Link>

                          <Link
                            href="/student-announcements"
                            className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
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