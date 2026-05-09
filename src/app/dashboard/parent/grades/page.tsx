// src/app/dashboard/parent/grades/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("studentId");
    setStudentId(id);
    if (id) fetchGrades(id);
    else setLoading(false);
  }, []);

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

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-blue-600 bg-blue-50";
    if (grade >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!studentId) {
    return (
      <div className="text-center p-12">
        <div className="bg-yellow-100 p-4 rounded-lg inline-block">
          <p>Please select a student to view grades.</p>
          <a href="/dashboard/parent/children" className="text-blue-600 underline mt-2 block">Go to Children →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center"><p className="text-sm text-gray-500">Average</p><p className="text-2xl font-bold text-blue-600">{stats.avg}%</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><p className="text-sm text-gray-500">Highest</p><p className="text-2xl font-bold text-green-600">{stats.highest}%</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><p className="text-sm text-gray-500">Lowest</p><p className="text-2xl font-bold text-red-600">{stats.lowest}%</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-700">{stats.total}</p></div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr><th className="px-6 py-3 text-left text-sm font-semibold">Course</th><th className="px-6 py-3 text-left text-sm font-semibold">Grade</th><th className="px-6 py-3 text-left text-sm font-semibold">Date</th></tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{grade.course?.name || "N/A"}</td>
                <td className="px-6 py-3"><span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade.grade)}`}>{grade.grade}%</span></td>
                <td className="px-6 py-3 text-gray-500 text-sm">{new Date(grade.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}