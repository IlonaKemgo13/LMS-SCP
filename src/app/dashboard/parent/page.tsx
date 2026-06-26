"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LogOut, User, Home, Bell, BookOpen, 
  Users, Calendar, TrendingUp, AlertCircle, Clock, Menu, X
} from "lucide-react";

export default function ParentDashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  // State management
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);  // ✅ ADDED
  
  // Dashboard data states
  const [studentsCount, setStudentsCount] = useState(0);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [avgGrade, setAvgGrade] = useState<string>("N/A");
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [deadlinesCount, setDeadlinesCount] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    async function fetchParentData() {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/');
          return;
        }
        
        // ✅ ADDED: Get user role first for security check
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();
        
        if (profileError || !profile) {
          router.push('/');
          return;
        }
        
        // ✅ ADDED: Role verification - if not parent, redirect
        if (profile.role !== 'parent') {
          setAccessDenied(true);
          // Redirect to appropriate dashboard based on role
          if (profile.role === 'student') {
            router.push('/dashboard/student');
          } else if (profile.role === 'admin') {
            router.push('/dashboard/admin');
          } else if (profile.role === 'teacher') {
            router.push('/dashboard/teacher');
          } else {
            router.push('/unauthorized');
          }
          return;
        }
        
        // ✅ MODIFIED: Use profile data instead of fetching again
        setParent({ full_name: profile.full_name });
        
        // Get linked students for this parent ONLY
        const { data: links, error: linksError } = await supabase
          .from("parent_student_links")
          .select("student_id")
          .eq("parent_id", user.id);
        
        if (linksError) {
          console.error("Links error:", linksError);
        }
        
        const studentIds = links?.map((link) => link.student_id) || [];
        setStudentsCount(studentIds.length);
        
        // Get full student profiles
        if (studentIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", studentIds);
          
          if (studentsError) {
            console.error("Students error:", studentsError);
          } else {
            setStudentsList(studentsData || []);
          }
          
          // Get grades to calculate average
          try {
            const { data: allGrades } = await supabase
              .from("grades")
              .select("grade, student_id")
              .in("student_id", studentIds);
            
            if (allGrades && allGrades.length > 0) {
              const average = allGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / allGrades.length;
              setAvgGrade(average.toFixed(1));
            } else {
              setAvgGrade("N/A");
            }
          } catch {
            setAvgGrade("N/A");
          }
          
          // Get announcements ONLY for linked students
          try {
            const { data: announcementsData } = await supabase
              .from("announcements")
              .select("*")
              .in("student_id", studentIds)
              .order("created_at", { ascending: false })
              .limit(3);
            
            setAnnouncementsCount(announcementsData?.length || 0);
            setRecentAnnouncements(announcementsData || []);
          } catch {
            setAnnouncementsCount(0);
            setRecentAnnouncements([]);
          }
        } else {
          setStudentsList([]);
          setAvgGrade("N/A");
          setAnnouncementsCount(0);
          setRecentAnnouncements([]);
        }
        
        setDeadlinesCount(3);
        
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchParentData();
  }, [supabase, router]);

  const initials = parent?.full_name
    ? parent.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  // ✅ ADDED: Show redirecting message while access is denied
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-medium">Redirecting to your dashboard...</p>
          <p className="text-yellow-600 text-sm mt-2">You do not have parent access.</p>
        </div>
      </div>
    );
  }

  if (!loading && !parent) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 text-center">Parent not found. Please login as a parent.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
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
                  router.push('/');
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
          title="Menu"
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
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  item.name === "Dashboard"
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
                  <p className="text-sm font-medium text-slate-700">
                    {parent?.full_name || "Parent"}
                  </p>
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
          {/* Hero Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Smart Communication Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Parent Workspace</h1>
            {loading ? (
              <div className="mt-2 text-white/80 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Loading your data...</span>
              </div>
            ) : (
              <p className="mt-2 text-white/80">
                Welcome back, {parent?.full_name || "Parent"}! Monitor your students' academic
                progress, stay updated with announcements, and track grades.
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded"></span> : studentsCount}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Students</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <span className="inline-block w-12 h-8 bg-slate-200 animate-pulse rounded"></span> : `${avgGrade}%`}
              </p>
              <p className="text-sm text-slate-600 mt-1">Average Grade</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded"></span> : announcementsCount}
              </p>
              <p className="text-sm text-slate-600 mt-1">Announcements</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{deadlinesCount}</p>
              <p className="text-sm text-slate-600 mt-1">Deadlines</p>
            </div>
          </div>

          {/* My Students List */}
          {studentsList.length > 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">My Students</h2>
                  <p className="text-sm text-slate-500 mt-1">Students linked to your account</p>
                </div>
                <Link href="/dashboard/parent/children" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {studentsList.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      {student.full_name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{student.full_name || "Student"}</h3>
                      <p className="text-xs text-slate-500">{student.email || "No email"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Announcements */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Announcements</h2>
                <p className="text-sm text-slate-500 mt-1">Updates for your students</p>
              </div>
              <Link href="/dashboard/parent/announcements" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded animate-pulse w-48 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              ) : recentAnnouncements.length > 0 ? (
                recentAnnouncements.map((announcement, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{announcement.title || "New Announcement"}</h3>
                      <p className="text-sm text-slate-600 mt-1">{announcement.content || "No content available"}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : "Recent"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No announcements for your students yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
            <p className="text-sm text-white/80 mb-4">Access your most used features</p>
            <div className="space-y-2">
              <Link href="/dashboard/parent/children" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <span>View Students</span><span>→</span>
              </Link>
              <Link href="/dashboard/parent/grades" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <span>Check Grades</span><span>→</span>
              </Link>
              <Link href="/dashboard/parent/announcements" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <span>View Announcements</span><span>→</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}