'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface Grade {
  id: string;
  grade: number;
  created_at: string;
  assessment_type?: string;
  score?: number;
  course: { name: string };
}

export default function ParentGradesPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState<string[]>([]);
  const [stats, setStats] = useState({ avg: 0, highest: 0, lowest: 0, total: 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('studentId');
    setStudentId(id);
    if (id) {
      fetchGrades(id);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchGrades(studentId: string) {
    setLoading(true);
    
    const { data: student } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single();
    
    if (student) setStudentName(student.full_name);
    
    const { data: gradesData } = await supabase
      .from('grades')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('student_id', studentId);
    
    if (gradesData) {
      setGrades(gradesData);
      
      // Calculate statistics
      const gradeValues = gradesData.map(g => g.grade);
      const avg = gradeValues.length > 0 
        ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length 
        : 0;
      const highest = gradeValues.length > 0 ? Math.max(...gradeValues) : 0;
      const lowest = gradeValues.length > 0 ? Math.min(...gradeValues) : 0;
      
      setStats({
        avg: Math.round(avg * 10) / 10,
        highest,
        lowest,
        total: gradeValues.length
      });
      
      // Get unique courses for filter
      const uniqueCourses = [...new Set(gradesData.map(g => g.course?.name).filter(Boolean))];
      setCourses(uniqueCourses);
    }
    
    setLoading(false);
  }

  const filteredGrades = grades.filter(grade => {
    if (filterCourse && grade.course?.name !== filterCourse) return false;
    return true;
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'text-emerald-600 bg-emerald-50';
    if (grade >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading grades...</p>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
            <p className="text-gray-500 mt-1">Track academic performance</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Student Selected</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Please select a student from the Children page to view their grades.
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
              <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
              <p className="text-gray-500 mt-1">Academic performance for {studentName}</p>
            </div>
            <div className="bg-emerald-100 rounded-full px-4 py-2">
              <span className="text-emerald-700 font-medium">{stats.total} Grades</span>
            </div>
          </div>
        </div>

        {/* Student Info Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <span className="text-xl">👧</span>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Viewing grades for</p>
              <p className="font-medium">{studentName}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Average Grade</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.avg}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Highest Grade</p>
            <p className="text-2xl font-bold text-green-600">{stats.highest}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Lowest Grade</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowest}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Assessments</p>
            <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
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
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              title="Filter by course"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
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
        
        {/* Grades Table */}
        {filteredGrades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Grades Available</h3>
            <p className="text-gray-400">
              {filterCourse ? `No grades for "${filterCourse}" course yet.` : 'No grades recorded for this student yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assessment Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-800">{grade.course?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {grade.assessment_type || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(grade.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">SMART COMMUNICATION PORTAL · Parent Workspace</p>
        </div>
      </div>
    </div>
  );
}