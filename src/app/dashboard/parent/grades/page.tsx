// src/app/dashboard/parent/grades/page.tsx
"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, Bell, BookOpen, User, Settings, Users, ArrowLeft } from "lucide-react";

interface Grade {
  id: string;
  grade: number;
  created_at: string;
  assessment_type?: string;
  course: { name: string };
}

export default function ParentGradesPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, highest: 0, lowest: 0, total: 0 });
  
  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("studentId");
    setStudentId(id);
    if (id) {
      fetchGrades(id);
      fetchParentName();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchParentName() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) setParentName(profile.full_name);
    }
  }

  async function fetchGrades(studentId: string) {
    setLoading(true);
    const { data: student } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", studentId)
      .single();
    if (student) setStudentName(student.full_name);

    const { data: gradesData } = await supabase
      .from("grades")
      .select("*, course:courses(*)")
      .eq("student_id", studentId);

    if (gradesData) {
      setGrades(gradesData);
      const gradeValues = gradesData.map((g) => g.grade);
      setStats({
        avg: gradeValues.length ? Math.round((gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length) * 10) / 10 : 0,
        highest: gradeValues.length ? Math.max(...gradeValues) : 0,
        lowest: gradeValues.length ? Math.min(...gradeValues) : 0,
        total: gradeValues.length,
      });
    }
    setLoading(false);
  }

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

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-blue-600 bg-blue-50";
    if (grade >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const initials = parentName
    ? parentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading grades...</p>
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
                    item.name === "Grades"
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
            <div className="text-center py-12">
              <div className="bg-yellow-100 p-6 rounded-xl inline-block">
                <p className="text-yellow-800">Please select a student to view grades.</p>
                <Link href="/dashboard/parent/children" className="text-blue-600 underline mt-3 inline-block">
                  Go to My Students →
                </Link>
              </div>
            </div>
          </main>
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
              { name: "Settings", href: "/dashboard/parent/settings", icon: Settings },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  item.name === "Grades"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard/parent/children"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">Back to Students</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="relative rounded-full p-2 hover:bg-slate-100 transition"
                  title="Change Password"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </button>
                
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
          </div>
        </header>

        {/* Main Content Area - YOUR ORIGINAL GRADES CODE */}
        <main className="p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
                <p className="text-gray-500">Academic performance for {studentName}</p>
              </div>
              <div className="bg-blue-100 rounded-full px-4 py-2">
                <span className="text-blue-700 font-medium">{stats.total} Grades</span>
              </div>
            </div>

            {/* Student Banner - Blue Theme */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2"><span className="text-xl">👧</span></div>
                <div><p className="text-blue-100 text-sm">Viewing grades for</p><p className="font-medium">{studentName}</p></div>
              </div>
            </div>

            {/* Stats Cards - Blue Theme */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avg}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Highest</p>
                <p className="text-2xl font-bold text-green-600">{stats.highest}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Lowest</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowest}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
              </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white rounded-xl border overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Course</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Grade</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        No grades available for {studentName}
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade) => (
                      <tr key={grade.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{grade.course?.name || "N/A"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade.grade)}`}>
                            {grade.grade}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-sm">
                          {new Date(grade.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}