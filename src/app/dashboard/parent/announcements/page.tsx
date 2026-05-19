// src/app/dashboard/parent/announcements/page.tsx
"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, Bell, BookOpen, User, Settings, Users } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  course: { name: string } | null;
}

export default function ParentAnnouncementsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalAnnouncements, setGlobalAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    async function getParentAndStudent() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get parent profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) setParentName(profile.full_name);
      }

      const params = new URLSearchParams(window.location.search);
      const id = params.get("studentId");
      setStudentId(id);
      if (id) fetchAllAnnouncements(id);
      else setLoading(false);
    }
    
    getParentAndStudent();
  }, []);

  async function fetchAllAnnouncements(studentId: string) {
    setLoading(true);
    const { data: student } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", studentId)
      .single();
    if (student) setStudentName(student.full_name);

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course:courses(*)")
      .eq("student_id", studentId);

    const courseNames: string[] = [];
    const courseIds: string[] = [];
    if (enrollments) {
      enrollments.forEach((item: any) => {
        if (item.course?.name) courseNames.push(item.course.name);
        if (item.course?.id) courseIds.push(item.course.id);
      });
    }
    setCourses(courseNames);

    if (courseIds.length > 0) {
      const { data: courseAnnouncements } = await supabase
        .from("announcements")
        .select("*, course:courses(*)")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });
      if (courseAnnouncements) setAnnouncements(courseAnnouncements as Announcement[]);
    }

    const { data: global } = await supabase
      .from("announcements")
      .select("*, course:courses(*)")
      .is("course_id", null)
      .order("created_at", { ascending: false });
    if (global) setGlobalAnnouncements(global as Announcement[]);

    setLoading(false);
  }

  const filteredAnnouncements = filterCourse
    ? announcements.filter((a) => a.course?.name === filterCourse)
    : announcements;

  const initials = parentName
    ? parentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-slate-100">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white rounded-xl shadow-lg"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:fixed
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6">
              <h1 className="text-2xl font-bold">SCP Portal</h1>
              <p className="text-sm text-slate-400">Parent Workspace</p>
            </div>

            <nav className="mt-6 space-y-2 px-4 flex-1">
              {[
                { name: "Dashboard", href: "/dashboard/parent", icon: Home },
                { name: "My Students", href: "/dashboard/parent/children", icon: Users },
                { name: "Announcements", href: "/dashboard/parent/announcements", icon: Bell },
                { name: "Grades", href: "/dashboard/parent/grades", icon: BookOpen },
                { name: "Profile", href: "/dashboard/parent/profile", icon: User },
                // { name: "Settings", href: "/dashboard/parent/settings", icon: Settings },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.name === "Announcements"
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => setShowSignOutModal(true)}
                className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800 transition"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64">
          <header className="bg-white border-b sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{parentName || "Parent"}</p>
                    <p className="text-xs text-slate-500">Parent</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6 lg:p-8">
            <div className="bg-yellow-100 p-6 rounded-xl text-center">
              <p className="text-yellow-800">Please select a student from the My Students page to view announcements.</p>
              <Link href="/dashboard/parent/children" className="text-blue-600 underline mt-3 inline-block">
                Go to My Students →
              </Link>
            </div>
          </main>
        </div>

        {/* Sign Out Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sign Out</h2>
                <p className="mt-2 text-sm text-slate-500">Are you sure you want to sign out?</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Sign Out</h2>
              <p className="mt-2 text-sm text-slate-500">Are you sure you want to sign out?</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-xl shadow-lg"
           aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
           title={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:fixed
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold">SCP Portal</h1>
            <p className="text-sm text-slate-400">Parent Workspace</p>
          </div>

          <nav className="mt-6 space-y-2 px-4 flex-1">
            {[
              { name: "Dashboard", href: "/dashboard/parent", icon: Home },
              { name: "My Students", href: "/dashboard/parent/children", icon: Users },
              { name: "Announcements", href: "/dashboard/parent/announcements", icon: Bell },
              { name: "Grades", href: "/dashboard/parent/grades", icon: BookOpen },
              { name: "Profile", href: "/dashboard/parent/profile", icon: User },
              // { name: "Settings", href: "/dashboard/parent/settings", icon: Settings },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  item.name === "Announcements"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => setShowSignOutModal(true)}
              className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800 transition"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{parentName || "Parent"}</p>
                  <p className="text-xs text-slate-500">Parent</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - YOUR ORIGINAL CODE STARTS HERE */}
        <main className="p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                <p className="text-gray-500">Updates for {studentName}</p>
              </div>
              <div className="bg-blue-100 rounded-full px-4 py-2">
                <span className="text-blue-700 font-medium">📢 Updates</span>
              </div>
            </div>

            {/* Student Banner - Blue Theme */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <span className="text-xl">👧</span>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Viewing announcements for</p>
                  <p className="font-medium">{studentName}</p>
                </div>
              </div>
            </div>

            {/* Filter */}
            {courses.length > 0 && (
              <div className="bg-white rounded-xl border p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="font-medium text-gray-700">Filter by Course:</label>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                     title="Filter announcements by course"
                     aria-label="Filter announcements by course"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                  {filterCourse && (
                    <button onClick={() => setFilterCourse("")} className="text-red-500 text-sm">
                      Clear ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Global Announcements */}
            {globalAnnouncements.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">🌐 Global Announcements</h2>
                <div className="space-y-3">
                  {globalAnnouncements.map((ann) => (
                    <div key={ann.id} className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                      <p className="text-gray-600 mt-2">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-3">
                        📅 {new Date(ann.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Announcements */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">📖 Course Announcements</h2>
              {filteredAnnouncements.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
                  No announcements available
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAnnouncements.map((ann) => (
                    <div key={ann.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                          {ann.course && <p className="text-sm text-blue-600 mt-1">{ann.course.name}</p>}
                          <p className="text-gray-600 mt-3">{ann.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 ml-4">
                          📅 {new Date(ann.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}