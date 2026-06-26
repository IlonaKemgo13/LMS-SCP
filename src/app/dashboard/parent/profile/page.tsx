"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, Bell, BookOpen, User, Users, Key, ArrowLeft, Save } from "lucide-react";

export default function ParentProfilePage() {
  const supabase = createClient();
  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");
  
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
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setLoading(false);
          return;
        }
        
        const { data: parentData, error: parentError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (parentError) {
          setLoading(false);
          return;
        }

        if (parentData) {
          setParent(parentData);
          setParentName(parentData.full_name);
          setEditFullName(parentData.full_name || "");
          setEditEmail(parentData.email || "");
          
          const { data: links } = await supabase
            .from("parent_student_links")
            .select("student_id")
            .eq("parent_id", user.id);
          
          if (links?.length) {
            const studentIds = links.map((l) => l.student_id);
            const { data: studentsData } = await supabase
              .from("profiles")
              .select("*")
              .in("id", studentIds);
            setChildren(studentsData || []);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  // Update profile handler
  async function handleUpdateProfile() {
    setUpdateMessage("");
    setUpdateError("");
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUpdateError("User not found");
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: editFullName,
          email: editEmail,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setParent({ ...parent, full_name: editFullName, email: editEmail });
      setParentName(editFullName);
      setUpdateMessage("Profile updated successfully!");
      setIsEditing(false);
      
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error: any) {
      setUpdateError(error.message);
      setTimeout(() => setUpdateError(""), 3000);
    } finally {
      setSaving(false);
    }
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

  const initials = parentName
    ? parentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white rounded-xl shadow-lg">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${item.name === "Profile" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={() => setShowSignOutModal(true)} className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800 transition">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>
        <div className="lg:ml-64">
          <header className="bg-white border-b sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">{initials}</div>
                </div>
              </div>
            </div>
          </header>
          <main className="p-6 lg:p-8">
            <div className="bg-yellow-100 p-6 rounded-xl text-center">
              <p className="text-yellow-800">Parent not found. Please login with a parent account.</p>
              <Link href="/dashboard/parent" className="text-blue-600 underline mt-3 inline-block">Back to Dashboard</Link>
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
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center"><LogOut className="h-6 w-6 text-red-600" /></div>
              <h2 className="text-xl font-bold text-slate-900">Sign Out</h2>
              <p className="mt-2 text-sm text-slate-500">Are you sure you want to sign out?</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowSignOutModal(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700">Sign Out</button>
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
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordMessage(""); setNewPassword(""); setConfirmPassword(""); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Update your account password below.</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
                <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              </div>
              {passwordError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{passwordError}</p>}
              {passwordMessage && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{passwordMessage}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordMessage(""); setNewPassword(""); setConfirmPassword(""); }} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handlePasswordChange} disabled={passwordLoading} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{passwordLoading ? "Updating..." : "Update Password"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white rounded-xl shadow-lg">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6"><h1 className="text-2xl font-bold">SCP Portal</h1><p className="text-sm text-slate-400">Parent Workspace</p></div>
          <nav className="mt-6 space-y-2 px-4 flex-1">
            {[
              { name: "Dashboard", href: "/dashboard/parent", icon: Home },
              { name: "My Students", href: "/dashboard/parent/children", icon: Users },
              { name: "Announcements", href: "/dashboard/parent/announcements", icon: Bell },
              { name: "Grades", href: "/dashboard/parent/grades", icon: BookOpen },
              { name: "Profile", href: "/dashboard/parent/profile", icon: User },
            ].map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${item.name === "Profile" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
                <item.icon className="h-5 w-5" />{item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={() => setShowSignOutModal(true)} className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-800 transition">
              <LogOut className="h-5 w-5" />Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard/parent" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
                <ArrowLeft className="h-5 w-5" /><span className="text-sm hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="flex items-center gap-4">
                <button onClick={() => setShowPasswordModal(true)} className="relative rounded-full p-2 hover:bg-slate-100 transition" title="Change Password">
                  <Key className="h-5 w-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{parentName || "Parent"}</p>
                    <p className="text-xs text-slate-500">Parent</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">{initials}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-500">View and manage your account information</p>
            </div>

            {/* Update Messages */}
            {updateMessage && <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">{updateMessage}</div>}
            {updateError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{updateError}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Card - EDITABLE */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-xl">👤</span></div>
                    <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                  </div>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                      <input type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 block mb-1">Email</label>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                      <button onClick={handleUpdateProfile} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                        {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div><label className="text-sm text-gray-500">Full Name</label><p className="font-medium text-gray-800">{parent.full_name}</p></div>
                    <div><label className="text-sm text-gray-500">Email</label><p className="font-medium text-gray-800">{parent.email}</p></div>
                    <div><label className="text-sm text-gray-500">Role</label><p className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Parent</p></div>
                  </div>
                )}
              </div>

              {/* Linked Children Card */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-xl">👧👦</span></div>
                  <h2 className="text-lg font-semibold text-gray-800">Linked Students</h2>
                </div>
                {children.length === 0 ? (
                  <div className="text-center py-6"><p className="text-gray-500">No students linked to your account.</p><p className="text-sm text-gray-400 mt-2">Please contact the administrator to link students.</p></div>
                ) : (
                  <div className="space-y-3">
                    {children.map((child) => (
                      <div key={child.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div><p className="font-medium text-gray-800">{child.full_name}</p><p className="text-sm text-gray-500">{child.email}</p></div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Student</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div><h2 className="text-lg font-semibold text-gray-800">Security</h2><p className="text-sm text-gray-500 mt-1">Manage your password and account security</p></div>
                <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">Change Password</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}