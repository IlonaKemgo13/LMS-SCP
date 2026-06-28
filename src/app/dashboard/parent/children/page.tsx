"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Users } from "lucide-react";

export default function ParentChildrenPage() {
  const supabase = createClient();
  const router = useRouter();
  
  // Start with default values - no loading state
  const [children, setChildren] = useState<any[]>([]);
  const [isParent, setIsParent] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChildren() {
      try {
        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/');
          return;
        }
        
        // 2. Get user profile with role verification
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();
        
        if (profileError || !profile) {
          router.push('/');
          return;
        }
        
        // 3. Role verification
        if (profile.role !== 'parent') {
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
        
        setIsParent(true);
        
        // 4. Get linked students
        const { data: links, error: linksError } = await supabase
          .from("parent_student_links")
          .select("student_id")
          .eq("parent_id", user.id);
        
        if (linksError) {
          console.error("Links error:", linksError);
          setError("Failed to load students.");
          return;
        }
        
        const studentIds = links?.map((link) => link.student_id) || [];
        
        // 5. Get student profiles
        if (studentIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", studentIds);
          
          if (studentsError) {
            console.error("Students error:", studentsError);
            setError("Failed to load student details.");
          } else {
            setChildren(studentsData || []);
          }
        }
        
      } catch (error) {
        console.error("Fetch error:", error);
        setError("An unexpected error occurred.");
      }
    }
    
    fetchChildren();
  }, [supabase, router]);

  // If not parent, show nothing (will redirect)
  if (isParent === false) {
    return null;
  }

  // Show error if any
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl max-w-md text-center mx-auto">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Students</h1>
          <p className="text-sm text-slate-500">View and monitor your students' academic progress</p>
        </div>
        <span className="rounded-full px-4 py-2 text-sm font-semibold bg-indigo-50 text-indigo-600">
          {children.length} Student(s)
        </span>
      </div>

      {/* No Students */}
      {children.length === 0 && (
        <div className="rounded-2xl border p-12 text-center bg-white">
          <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-900">No students linked to your account.</p>
          <p className="mt-2 text-sm text-slate-500">Contact the administrator to link students to your account.</p>
        </div>
      )}

      {/* Students Grid */}
      {children.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {children.map((child) => (
            <div key={child.id} className="rounded-2xl border overflow-hidden shadow-sm bg-white">
              <div className="p-4 text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {child.full_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{child.full_name || "Student"}</h2>
                    <p className="text-sm mt-1 opacity-80">{child.email || "No email"}</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/parent/grades?student_id=${child.id}`}
                    className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    View Grades
                  </Link>
                  <Link
                    href="/dashboard/parent/announcements"
                    className="flex-1 rounded-xl border py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Announcements
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}