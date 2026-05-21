"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Material = {
  id: string;
  title: string;
  file_url: string | null;
  course_id: string;
  created_at: string | null;
  courses?: {
    title: string;
    description: string | null;
  } | null;
};

export default function StudentMaterialsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchMaterials() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        router.push("/");
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
        .from("materials")
        .select(
          "id, title, file_url, course_id, created_at, courses(title, description)"
        )
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      setMaterials((data as unknown as Material[]) || []);
      setLoading(false);
    }

    fetchMaterials();
  }, []);

  // Close sidebar when navigating on mobile
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
            {/* Close button for mobile */}
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
                  item.name === "Materials"
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
            className="mx-4 mt-6 block w-[calc(100%-2rem)] rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800"
          >
            Sign Out
          </button>
        </aside>

        {/* Main content */}
        <section className="flex-1 min-w-0">
          <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-3">
              {/* Hamburger button */}
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
                  Learning Materials
                </h2>
              </div>
            </div>

            <div className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-700 sm:px-5 sm:py-2 sm:text-base">
              {loading ? "..." : `${materials.length} File(s)`}
            </div>
          </header>

          <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">
            {/* Hero banner */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 sm:text-sm">
                Resource Center
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                Access your course materials instantly.
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:mt-3 sm:text-base">
                Download lecture notes, slides, PDFs, and additional study
                resources uploaded by your instructors.
              </p>
            </section>

            {/* Stats cards */}
            <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Available Materials</p>
                <h3 className="mt-2 text-3xl font-bold">
                  {loading ? "..." : materials.length}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Uploaded resources
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Access</p>
                <h3 className="mt-2 text-3xl font-bold">Anytime</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Download when needed
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                <p className="text-sm text-slate-500">Format</p>
                <h3 className="mt-2 text-3xl font-bold">PDF / Docs</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Multiple formats supported
                </p>
              </div>
            </section>

            {/* Materials list */}
            <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold">All Materials</h3>
              <p className="mt-1 text-sm text-slate-500">
                Sorted by most recent uploads.
              </p>

              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 grid-cols-1 lg:grid-cols-2">
                {loading ? (
                  <p className="text-sm text-slate-500">
                    Loading materials...
                  </p>
                ) : materials.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center sm:p-8 lg:col-span-2">
                    <p className="font-semibold">No materials found.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Your course materials will appear here once uploaded.
                    </p>
                  </div>
                ) : (
                  materials.map((material) => (
                    <div
                      key={material.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                          {material.courses?.title || "Unknown Course"}
                        </p>
                        <h4 className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-xl">
                          {material.title}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {material.courses?.description || "No description"} •{" "}
                          {material.created_at
                            ? new Date(
                                material.created_at
                              ).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>

                      {material.file_url ? (
                        <a
                          href={material.file_url}
                          target="_blank"
                          className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white active:scale-95 transition-transform"
                        >
                          Download / View File
                        </a>
                      ) : (
                        <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-center sm:p-6">
                          <p className="font-semibold">No file attached</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Ask the teacher to upload the material.
                          </p>
                        </div>
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
