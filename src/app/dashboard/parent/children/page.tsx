// src/app/dashboard/parent/children/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, Bell, BookOpen, User, Users, AlertCircle } from "lucide-react";

export default function ChildrenPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [parentName, setParentName] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function fetchChildrenData() {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/');
          return;
        }
        
        // ✅ Get user role first for security check
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();
        
        if (profileError || !profile) {
          router.push('/');
          return;
        }
        
        // ✅ Role verification - if not parent, redirect
        if (profile.role !== 'parent') {
          setAccessDenied(true);
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
        
        setParentName(profile.full_name);
        
        // ✅ Get linked students using the parent's profile ID
        const { data: links, error: linksError } = await supabase
          .from("parent_student_links")
          .select("student_id")
          .eq("parent_id", user.id);  // Use user.id since it matches profiles.id
        
        if (linksError) {
          console.error("Links error:", linksError);
          setChildren([]);
          setLoading(false);
          return;
        }
        
        if (links && links.length > 0) {
          const studentIds = links.map((link) => link.student_id);
          
          // ✅ Fetch student profiles
          const { data: studentsData, error: studentsError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", studentIds);
          
          if (studentsError) {
            console.error("Students error:", studentsError);
            setChildren([]);
          } else {
            setChildren(studentsData || []);
          }
        } else {
          setChildren([]);
        }
        
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChildrenData();
  }, [supabase, router]);

  const initials = parentName
    ? parentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  // ✅ Show redirecting message while access is denied
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your students...</p>
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
          aria-label="Toggle menu"
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
                  item.name === "My Students"
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

        {/* Main Content Area */}
        <main className="p-6 lg:p-8">
          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <Users className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No students linked to your account.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please contact your school administrator to link students to your account.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
                  <p className="text-gray-500">View and monitor your students' academic progress</p>
                </div>
                <div className="bg-blue-100 rounded-full px-4 py-2">
                  <span className="text-blue-700 font-medium">{children.length} Student(s)</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {children.map((child) => (
                  <div key={child.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold">{child.full_name}</h2>
                          <p className="text-blue-100 text-sm mt-1">{child.email}</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-3 py-1 text-center">
                          <p className="text-xs text-blue-100">Student</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex gap-3">
                        <Link 
                          href={`/dashboard/parent/grades?studentId=${child.id}`} 
                          className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          📝 View Grades
                        </Link>
                        <Link 
                          href={`/dashboard/parent/announcements?studentId=${child.id}`} 
                          className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                        >
                          📢 Announcements
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}