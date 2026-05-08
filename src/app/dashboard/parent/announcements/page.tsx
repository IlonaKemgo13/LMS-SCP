'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  course_id: string;
  course: { name: string } | null;
}

export default function ParentAnnouncementsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [globalAnnouncements, setGlobalAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('studentId');
    setStudentId(id);
    if (id) {
      fetchAllAnnouncements(id);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchAllAnnouncements(studentId: string) {
    setLoading(true);
    
    const { data: student } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single();
    
    if (student) setStudentName(student.full_name);
    
    // Get student's courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course:courses(*)')
      .eq('student_id', studentId);
    
    // Fix: Safely extract course names
    const courseNames: string[] = [];
    if (enrollments) {
      enrollments.forEach((item: any) => {
        if (item.course && item.course.name) {
          courseNames.push(item.course.name);
        }
      });
    }
    setCourses(courseNames);
    
    const courseIds: string[] = [];
    if (enrollments) {
      enrollments.forEach((item: any) => {
        if (item.course && item.course.id) {
          courseIds.push(item.course.id);
        }
      });
    }
    
    // Get course-specific announcements
    if (courseIds.length > 0) {
      const { data: courseAnnouncements } = await supabase
        .from('announcements')
        .select('*, course:courses(*)')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });
      
      if (courseAnnouncements) setAnnouncements(courseAnnouncements as Announcement[]);
    }
    
    // Get global announcements
    const { data: global } = await supabase
      .from('announcements')
      .select('*, course:courses(*)')
      .is('course_id', null)
      .order('created_at', { ascending: false });
    
    if (global) setGlobalAnnouncements(global as Announcement[]);
    
    setLoading(false);
  }

  const filteredAnnouncements = filterCourse
    ? announcements.filter(a => a.course?.name === filterCourse)
    : announcements;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-500 mt-1">Stay updated with important news</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Student Selected</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Please select a student from the Children page to view their announcements.
            </p>
            <a 
              href="/dashboard/parent/children" 
              className="inline-flex items-center px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
            >
              Go to Children →
            </a>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">SMART COMMUNICATION PORTAL · Parent Workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-500 mt-1">Stay updated with {studentName}'s courses</p>
            </div>
            <div className="bg-purple-100 rounded-full px-4 py-2">
              <span className="text-purple-700 font-medium">📢 Updates</span>
            </div>
          </div>
        </div>

        {/* Student Info Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <span className="text-xl">👧</span>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Viewing announcements for</p>
              <p className="font-medium">{studentName}</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {courses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="font-medium text-gray-700">Filter by Course:</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                title="Filter announcements by course"
              >
                <option value="">All Courses</option>
                {courses.map((course, idx) => (
                  <option key={idx} value={course}>{course}</option>
                ))}
              </select>
              {filterCourse && (
                <button
                  onClick={() => setFilterCourse('')}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Clear Filter ✕
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Global Announcements */}
        {globalAnnouncements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🌐</span> Global Announcements
            </h2>
            <div className="space-y-3">
              {globalAnnouncements.map((announcement) => (
                <div key={announcement.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                  <p className="text-gray-600 mt-2">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    📅 {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Course Announcements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>📖</span> Course Announcements
          </h2>
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Announcements</h3>
              <p className="text-gray-400">
                {filterCourse ? `No announcements for "${filterCourse}" course.` : 'No announcements available for this student.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                      {announcement.course && (
                        <p className="text-sm text-purple-600 mt-1">{announcement.course.name}</p>
                      )}
                      <p className="text-gray-600 mt-3">{announcement.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-4">
                      📅 {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">SMART COMMUNICATION PORTAL · Parent Workspace</p>
        </div>
      </div>
    </div>
  );
}