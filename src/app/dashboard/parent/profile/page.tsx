// src/app/dashboard/parent/profile/page.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function ParentProfilePage() {
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
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="bg-yellow-100 p-6 rounded-lg text-center">
        <p>Parent not found. Please login with a parent account.</p>
        <a href="/dashboard/parent" className="text-blue-600 underline mt-2 inline-block">
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">View your account information and linked children</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <p className="font-medium text-gray-800">{parent.full_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium text-gray-800">{parent.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <p className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Parent
              </p>
            </div>
          </div>
        </div>

        {/* Linked Children Card */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👧👦</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Linked Children</h2>
          </div>
          {children.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No children linked to your account.</p>
              <p className="text-sm text-gray-400 mt-2">
                Please contact the administrator to link children.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{child.full_name}</p>
                    <p className="text-sm text-gray-500">{child.email}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Student
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}