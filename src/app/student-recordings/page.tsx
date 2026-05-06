"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Recording = {
  id: string;
  title: string;
  file_url: string | null;
  course_id: string;
  created_at: string | null;
  courses?: {
    name: string;
    domain: string | null;
  } | null;
};

export default function StudentRecordingsPage() {
  const supabase = createClient();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecordings() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("courses(id)")
        .eq("student_id", userId);

      const courseIds =
        enrollmentData?.map((item: any) => item.courses?.id).filter(Boolean) ||
        [];

      if (courseIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("recordings")
        .select("id, title, file_url, course_id, created_at, courses(name, domain)")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      setRecordings((data as Recording[]) || []);
      setLoading(false);
    }

    fetchRecordings();
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
                  item.name === "Recordings"
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
              <h2 className="text-2xl font-bold">Lecture Recordings</h2>
            </div>

            <div className="rounded-full bg-blue-100 px-5 py-2 font-semibold text-blue-700">
              {loading ? "Loading..." : `${recordings.length} Recording(s)`}
            </div>
          </header>

          <div className="space-y-8 p-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
                Lecture Replay Center
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                Rewatch your course lectures anytime.
              </h1>
              <p className="mt-3 max-w-3xl text-blue-100">
                Access recorded lectures uploaded by teachers for your enrolled
                courses.
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Available Recordings</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : recordings.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Uploaded lectures
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Access</p>
                <h3 className="mt-2 text-3xl font-bold">24/7</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Replay anytime
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Mode</p>
                <h3 className="mt-2 text-3xl font-bold">Online</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Browser playback
                </p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">All Recordings</h3>
              <p className="mt-1 text-sm text-slate-500">
                Videos are listed from newest to oldest.
              </p>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {loading ? (
                  <p className="text-sm text-slate-500">
                    Loading recordings...
                  </p>
                ) : recordings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center lg:col-span-2">
                    <p className="font-semibold">No recordings found.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Uploaded course lectures will appear here.
                    </p>
                  </div>
                ) : (
                  recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                          {recording.courses?.name || "Unknown Course"}
                        </p>
                        <h4 className="mt-2 text-xl font-bold">
                          {recording.title}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {recording.courses?.domain || "No domain"} •{" "}
                          {recording.created_at
                            ? new Date(recording.created_at).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>

                      {recording.file_url ? (
                        <video
                          controls
                          className="w-full rounded-xl border bg-black"
                        >
                          <source src={recording.file_url} />
                          Your browser does not support video playback.
                        </video>
                      ) : (
                        <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center">
                          <p className="font-semibold">No video URL attached</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Ask the teacher to upload or link the recording file.
                          </p>
                        </div>
                      )}

                      {recording.file_url && (
                        <a
                          href={recording.file_url}
                          target="_blank"
                          className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Open Recording
                        </a>
                      )}
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