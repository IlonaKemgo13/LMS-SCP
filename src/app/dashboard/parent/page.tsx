// src/app/dashboard/parent/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LogOut, Key, User, Home, Bell, BookOpen, 
  Settings, Users, Calendar, 
  TrendingUp, AlertCircle, Star, Clock, Menu, X
} from "lucide-react";

export default function ParentDashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  // State management
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Dashboard data states
  const [studentsCount, setStudentsCount] = useState(0);
  const [avgGrade, setAvgGrade] = useState<string>("N/A");
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [deadlinesCount, setDeadlinesCount] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    async function fetchParentData() {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }
      
      // Get parent profile
      const { data: parentData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (!parentData) {
        setLoading(false);
        return;
      }
      
      setParent(parentData);
      
      // Get linked students
      const { data: links } = await supabase
        .from("parent_student_links")
        .select("student_id")
        .eq("parent_id", parentData.id);
      
      const studentIds = links?.map((link) => link.student_id) || [];
      setStudentsCount(studentIds.length);
      
      // Get grades to calculate average
      if (studentIds.length > 0) {
        const { data: allGrades } = await supabase
          .from("grades")
          .select("grade")
          .in("student_id", studentIds);
        
        if (allGrades && allGrades.length > 0) {
          const average = allGrades.reduce((sum, g) => sum + g.grade, 0) / allGrades.length;
          setAvgGrade(average.toFixed(1));
        }
      }
      
      // Get announcements
      const { data: announcements } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      setAnnouncementsCount(announcements?.length || 0);
      setRecentAnnouncements(announcements || []);
      
      // Get deadlines count
      setDeadlinesCount(3);
      
      setLoading(false);
    }
    
    fetchParentData();
  }, [supabase, router]);

  // Password change handler
  async function handlePasswordChange() {
    setPasswordMessage("");
    setPasswordError("");
    
    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    
    setPasswordLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    setPasswordLoading(false);
    
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 2000);
    }
  }

  const initials = parent?.full_name
    ? parent.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!parent) {
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

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordMessage("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Update your account password below.</p>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              
              {passwordError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{passwordMessage}</p>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordMessage("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-xl shadow-lg"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar - Fixed on left */}
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

      {/* Main Content - With left margin for sidebar */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="relative rounded-full p-2 hover:bg-slate-100 transition"
                  title="Change Password"
                >
                  <Key className="h-5 w-5 text-slate-600" />
                </button>
                
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
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-8">
          {/* Hero Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Smart Communication Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Parent Workspace</h1>
            <p className="mt-2 text-white/80">
              Welcome back, {parent.full_name}! Monitor your students' academic
              progress, stay updated with announcements, and track grades.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{studentsCount}</p>
              <p className="text-sm text-slate-600 mt-1">Total Students</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{avgGrade}%</p>
              <p className="text-sm text-slate-600 mt-1">Average Grade</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{announcementsCount}</p>
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

          {/* Recent Announcements Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Announcements</h2>
                <p className="text-sm text-slate-500 mt-1">Stay updated with latest news</p>
              </div>
              <Link 
                href="/dashboard/parent/announcements"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-4">
              {recentAnnouncements.length > 0 ? (
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
                  <p>No announcements yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upcoming Deadlines</h2>
                <p className="text-sm text-slate-500 mt-1">Tasks to complete</p>
              </div>
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Mathematics Assignment</p>
                  <p className="text-xs text-slate-600">Math</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-orange-600">Dec 10, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Science Project</p>
                  <p className="text-xs text-slate-600">Science</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-orange-600">Dec 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">English Essay</p>
                  <p className="text-xs text-slate-600">English</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-orange-600">Dec 20, 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
              <p className="text-sm text-white/80 mb-4">Access your most used features</p>
              <div className="space-y-2">
                <Link 
                  href="/dashboard/parent/children"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <span>View Students</span>
                  <span>→</span>
                </Link>
                <Link 
                  href="/dashboard/parent/grades"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <span>Check Grades</span>
                  <span>→</span>
                </Link>
                <Link 
                  href="/dashboard/parent/announcements"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  <span>View Announcements</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Password Management</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Keep your account secure by updating your password regularly.
              </p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Change Password
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}