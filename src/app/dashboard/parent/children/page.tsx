// src/app/dashboard/parent/children/page.tsx
"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, Bell, BookOpen, User, Settings, Users } from "lucide-react";

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [parentName, setParentName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDebug("Starting fetch...");
      
      try {
        // Get current logged in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setDebug("❌ No user logged in");
          setLoading(false);
          return;
        }
        
        setCurrentUserEmail(user.email || "");
        setDebug(`✅ Logged in as: ${user.email} (ID: ${user.id})`);
        
        // FIRST: Get the parent profile from profiles table
        const { data: parentData, error: parentError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (parentError) {
          setDebug(`❌ Parent profile error: ${parentError.message}`);
          setLoading(false);
          return;
        }
        
        if (!parentData) {
          setDebug("❌ No parent profile found");
          setLoading(false);
          return;
        }
        
        setParentName(parentData.full_name);
        setDebug(prev => prev + `\n✅ Parent found: ${parentData.full_name} (Profile ID: ${parentData.id})`);
        
        // SECOND: Get linked students using the parent's profile ID
        const { data: links, error: linksError } = await supabase
          .from("parent_student_links")
          .select("student_id")
          .eq("parent_id", parentData.id);  // Use parentData.id, NOT user.id
        
        if (linksError) {
          setDebug(prev => prev + `\n❌ Links error: ${linksError.message}`);
          setLoading(false);
          return;
        }
        
        setDebug(prev => prev + `\n📊 Links found: ${links?.length || 0}`);
        
        if (links && links.length > 0) {
          const studentIds = links.map((link) => link.student_id);
          setDebug(prev => prev + `\n📚 Student IDs: ${studentIds.join(", ")}`);
          
          // THIRD: Fetch student profiles
          const { data: studentsData, error: studentsError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", studentIds);
          
          if (studentsError) {
            setDebug(prev => prev + `\n❌ Students error: ${studentsError.message}`);
          } else {
            setDebug(prev => prev + `\n👨‍🎓 Students found: ${studentsData?.length || 0}`);
            setChildren(studentsData || []);
          }
        } else {
          setDebug(prev => prev + `\n⚠️ No links found in parent_student_links table`);
        }
        
      } catch (error: any) {
        setDebug(prev => prev + `\n❌ Error: ${error.message}`);
        console.error("Error fetching children:", error);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const initials = parentName
    ? parentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading children...</p>
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
              // { name: "Settings", href: "/dashboard/parent/settings", icon: Settings },
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
          {/* Debug Info - Remove after fixing */}
          {debug && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs font-mono whitespace-pre-wrap">
              <strong>Debug:</strong>
              <pre className="mt-1">{debug}</pre>
            </div>
          )}

          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-gray-600">No students linked to your account.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Logged in as: {currentUserEmail}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Debug: {debug}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
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