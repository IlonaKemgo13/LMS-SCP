'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function ParentProfilePage() {
  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for creating new parent
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    studentId: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchParentData = async () => {
    setLoading(true);
    
    const { data: parentData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'parent@gmail.com')
      .single();

    if (parentData) {
      setParent(parentData);
      
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', parentData.id);

      if (links && links.length > 0) {
        const studentIds = links.map(link => link.student_id);
        const { data: studentsData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', studentIds);
        setChildren(studentsData || []);
      }
    }
    
    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student');
    setStudents(data || []);
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const newParentId = crypto.randomUUID();
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: newParentId,
            full_name: formData.full_name,
            email: formData.email,
            role: 'parent',
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      if (formData.studentId) {
        const { error: linkError } = await supabase
          .from('parent_student_links')
          .insert([
            {
              parent_id: profileData.id,
              student_id: formData.studentId,
            }
          ]);

        if (linkError) throw linkError;
      }

      setMessage({ type: 'success', text: 'Parent created successfully!' });
      setFormData({ full_name: '', email: '', studentId: '' });
      setShowCreateForm(false);
      fetchParentData();
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-500 mt-1">Manage your account and linked children</p>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                if (!showCreateForm) fetchStudents();
              }}
              className="px-5 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium shadow-sm"
            >
              {showCreateForm ? 'Cancel' : '+ Create New Parent'}
            </button>
          </div>
        </div>

        {/* Create Parent Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Parent</h2>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleCreateParent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="parent@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Student (Optional)</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  title="Select a student to link"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition font-medium"
              >
                {submitting ? 'Creating...' : 'Create Parent'}
              </button>
            </form>
          </div>
        )}
        
        {/* Parent Profile Card */}
        {parent ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
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
                  <p className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">Parent</p>
                </div>
              </div>
            </div>

            {/* Linked Children */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👧👦</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Linked Children</h2>
              </div>
              {children.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3">No children linked to this account.</p>
                  <a href="/dashboard/parent/profile" className="text-emerald-500 text-sm hover:underline">
                    Contact administrator to link children
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {children.map((child) => (
                    <div key={child.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{child.full_name}</p>
                        <p className="text-sm text-gray-500">{child.email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Student</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Parent Not Found</h3>
            <p className="text-gray-400">Please login with a parent account.</p>
          </div>
        )}
        
        {/* All Parents List */}
        <AllParentsList />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">SMART COMMUNICATION PORTAL · Parent Workspace</p>
        </div>
      </div>
    </div>
  );
}

// Component to display all parents
function AllParentsList() {
  const [parents, setParents] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: parentsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'parent');
      
      const { data: linksData } = await supabase
        .from('parent_student_links')
        .select('*');
      
      setParents(parentsData || []);
      setLinks(linksData || []);
      setLoading(false);
    }
    
    fetchData();
  }, []);

  if (loading) return null;
  
  if (parents.length === 0) return null;

  const getStudentCount = (parentId: string) => {
    return links.filter(link => link.parent_id === parentId).length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>👥</span> All Parents ({parents.length})
      </h2>
      <div className="space-y-3">
        {parents.map((parent) => (
          <div key={parent.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">{parent.full_name}</p>
              <p className="text-sm text-gray-500">{parent.email}</p>
            </div>
            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              {getStudentCount(parent.id)} child(ren)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}