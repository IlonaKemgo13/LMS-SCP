// src/app/dashboard/parent/announcements/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("studentId");
    setStudentId(id);
    if (id) fetchAllAnnouncements(id);
    else setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-100 p-4 rounded-lg inline-block">
          <p>Please select a student from the Children page to view announcements.</p>
          <a href="/dashboard/parent/children" className="text-blue-600 underline mt-2 block">
            Go to Children →
          </a>
        </div>
      </div>
    );
  }

  return (
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
  );
}