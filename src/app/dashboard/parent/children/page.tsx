// src/app/dashboard/parent/children/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function ChildrenPage() {
  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: parentData } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", "parent@gmail.com")
        .single();

      if (parentData) {
        setParent(parentData);
        const { data: links } = await supabase
          .from("parent_student_links")
          .select("student_id")
          .eq("parent_id", parentData.id);
        if (links?.length) {
          const studentIds = links.map((l) => l.student_id);
          const { data: studentsData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", studentIds);
          setChildren(studentsData || []);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-gray-600">No children linked to your account.</p>
          <a href="/dashboard/parent/profile" className="text-blue-600 underline mt-2 inline-block">
            Contact administrator →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <p className="text-gray-500">View and monitor your children's academic progress</p>
        </div>
        <div className="bg-blue-100 rounded-full px-4 py-2">
          <span className="text-blue-700 font-medium">{children.length} Child(ren)</span>
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
                <a href={`/dashboard/parent/grades?studentId=${child.id}`} className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  📝 View Grades
                </a>
                <a href={`/dashboard/parent/announcements?studentId=${child.id}`} className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                  📢 Announcements
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}