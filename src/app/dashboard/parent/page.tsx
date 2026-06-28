// src/app/dashboard/parent/page.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Bell, BookOpen, 
  Users, Calendar, TrendingUp, AlertCircle,
  ChevronRight, GraduationCap, MessageSquare
} from "lucide-react";

export default function ParentDashboard() {
  const supabase = createClient();
  const router = useRouter();
  
  // State management - NO LOADING STATE!
  const [parent, setParent] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Dashboard data states - start with default values
  const [studentsCount, setStudentsCount] = useState(0);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [avgGrade, setAvgGrade] = useState<string>("N/A");
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [deadlinesCount, setDeadlinesCount] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  
  // Track if data has been fetched at least once
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    async function fetchParentData() {
      try {
        // 1. Get user (fast)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/');
          return;
        }
        
        // 2. Get profile (fast)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();
        
        if (profileError || !profile) {
          router.push('/');
          return;
        }
        
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
        
        setParent({ full_name: profile.full_name });
        
        // 3. Get links (fast)
        const { data: links, error: linksError } = await supabase
          .from("parent_student_links")
          .select("student_id")
          .eq("parent_id", user.id);
        
        if (linksError) {
          console.error("Links error:", linksError);
        }
        
        const studentIds = links?.map((link) => link.student_id) || [];
        setStudentsCount(studentIds.length);
        
        if (studentIds.length > 0) {
          // 4. Fetch all data in parallel (fast)
          const [studentsResult, gradesResult, announcementsResult] = await Promise.all([
            supabase.from("profiles").select("*").in("id", studentIds),
            supabase.from("grades").select("score, max_score, student_id").in("student_id", studentIds),
            supabase.from("announcements")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(5)
          ]);
          
          // Process students
          if (studentsResult.error) {
            console.error("Students error:", studentsResult.error);
          } else {
            setStudentsList(studentsResult.data || []);
          }
          
          // Process grades
          if (gradesResult.error) {
            console.error("Grades error:", gradesResult.error);
          } else if (gradesResult.data && gradesResult.data.length > 0) {
            const average = gradesResult.data.reduce(
              (sum, g) => sum + (g.max_score > 0 ? (g.score / g.max_score) * 100 : 0),
              0
            ) / gradesResult.data.length;
            setAvgGrade(average.toFixed(1));
          }
          
          // Process announcements
          if (announcementsResult.error) {
            console.error("Announcements error:", announcementsResult.error);
          } else {
            setAnnouncementsCount(announcementsResult.data?.length || 0);
            setRecentAnnouncements(announcementsResult.data || []);
          }
        }
        
        setDeadlinesCount(3);
        setHasFetched(true);
        
      } catch (error) {
        console.error("Fetch error:", error);
        setHasFetched(true);
      }
    }
    
    fetchParentData();
  }, [supabase, router]);

  // Redirect if access denied
  if (accessDenied) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl max-w-md text-center mx-auto">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-yellow-800 font-medium">Redirecting to your dashboard...</p>
        <p className="text-yellow-600 text-sm mt-2">You do not have parent access.</p>
      </div>
    );
  }

  // Show error ONLY if data fetch failed
  if (hasFetched && !parent) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl max-w-md text-center mx-auto">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 text-center">Profile not found. Please login again.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ DASHBOARD SHOWS IMMEDIATELY - NO SPINNER!
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Smart Communication Portal</span>
        </div>
        <h1 className="text-3xl font-bold">Parent Workspace</h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Welcome back, {parent?.full_name || "Parent"}! Monitor your students' academic
          progress, stay updated with announcements, and track grades.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-indigo-50 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{studentsCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">Total Students</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-50 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Average</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{avgGrade}%</p>
          <p className="text-sm text-slate-500 mt-0.5">Average Grade</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-purple-50 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-purple-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Updates</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{announcementsCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">Announcements</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-50 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-orange-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Due</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{deadlinesCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">Deadlines</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* My Students */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">My Students</h2>
            </div>
            <Link href="/dashboard/parent/children" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {studentsList.length > 0 ? (
            <div className="space-y-3">
              {studentsList.slice(0, 3).map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {student.full_name?.charAt(0) || "S"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{student.full_name || "Student"}</h3>
                    <p className="text-xs text-slate-500">{student.email || "No email"}</p>
                  </div>
                </div>
              ))}
              {studentsList.length > 3 && (
                <p className="text-xs text-slate-400 text-center mt-2">+{studentsList.length - 3} more students</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No students linked yet</p>
            </div>
          )}
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Announcements</h2>
            </div>
            <Link href="/dashboard/parent/announcements" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {recentAnnouncements.slice(0, 3).map((announcement, index) => (
                <div key={index} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="flex items-start gap-2">
                    <Bell className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{announcement.title || "New Announcement"}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{announcement.content || "No content available"}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : "Recent"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No announcements yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-1">Quick Actions</h3>
        <p className="text-sm text-white/70 mb-4">Access your most used features</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/dashboard/parent/children" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition group">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              View Students
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link href="/dashboard/parent/grades" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition group">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Check Grades
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link href="/dashboard/parent/announcements" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition group">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              View Announcements
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}