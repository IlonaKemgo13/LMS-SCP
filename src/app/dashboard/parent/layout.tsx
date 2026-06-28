// src/app/dashboard/parent/layout.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ParentSidebar from "@/components/parent/ParentSidebar";
import ParentTopbar from "@/components/parent/ParentTopbar";
import { LogOut } from "lucide-react";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
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
                onClick={handleSignOut}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f8f4ff]">
        <ParentSidebar />

        <div className="flex min-h-screen flex-col lg:ml-64">
          {/* Topbar with Logout */}
          <header className="bg-white border-b sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Parent Dashboard
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">
                      {profile?.full_name || "Parent"}
                    </p>
                    <p className="text-xs text-slate-500">Parent</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <button
                    onClick={() => setShowSignOutModal(true)}
                    className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 hover:text-red-600"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}