import { supabase, Profile } from '@/lib/supabase';

export default async function ParentDashboard() {
  // Get Parent Laetitia by email
  const { data: parent } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'parent@gmail.com')
    .single();

  if (!parent) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Parent not found. Please login as a parent.</p>
        </div>
      </div>
    );
  }

  // Get linked students
  const { data: links } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parent.id);

  const studentIds = links?.map(link => link.student_id) || [];
  
  // Get student profiles
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .in('id', studentIds);

  // Get recent grades for all children
  const { data: recentGrades } = await supabase
    .from('grades')
    .select(`
      *,
      course:courses(*),
      student:profiles!grades_student_id_fkey(*)
    `)
    .in('student_id', studentIds.length > 0 ? studentIds : ['none'])
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent announcements
  const { data: recentAnnouncements } = await supabase
    .from('announcements')
    .select(`
      *,
      course:courses(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate average grade
  const { data: allGrades } = await supabase
    .from('grades')
    .select('grade')
    .in('student_id', studentIds.length > 0 ? studentIds : ['none']);
  
  const avgGrade = allGrades && allGrades.length > 0
    ? (allGrades.reduce((sum, g) => sum + g.grade, 0) / allGrades.length).toFixed(1)
    : 'N/A';

  const childrenCount = students?.length || 0;
  const announcementsCount = recentAnnouncements?.length || 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
        <p className="text-gray-500">Monitor your children's academic progress</p>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 mb-8 text-white">
        <p className="text-emerald-100 mb-1">Welcome back!</p>
        <h2 className="text-2xl font-bold">{parent.full_name}</h2>
        <p className="text-emerald-100 mt-1">Parent Portal · {parent.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Linked Children</p>
              <p className="text-3xl font-bold text-gray-900">{childrenCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👧👦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Average Grade</p>
              <p className="text-3xl font-bold text-gray-900">{avgGrade}%</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Recent Updates</p>
              <p className="text-3xl font-bold text-gray-900">{announcementsCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Cards - Similar to Teacher Dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Children Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">My Children</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    View your children's profiles and academic progress
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👧👦</span>
                </div>
              </div>
              <a 
                href="/dashboard/parent/children" 
                className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700"
              >
                Open section →
              </a>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Announcements</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Stay updated with school and course announcements
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📢</span>
                </div>
              </div>
              <a 
                href="/dashboard/parent/announcements" 
                className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700"
              >
                Open section →
              </a>
            </div>
          </div>

          {/* Grades Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Grades</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Track your children's academic performance
                  </p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
              </div>
              <a 
                href="/dashboard/parent/grades" 
                className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700"
              >
                Open section →
              </a>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Profile</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    View and manage your account settings
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
              </div>
              <a 
                href="/dashboard/parent/profile" 
                className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700"
              >
                Open section →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        
        {recentGrades && recentGrades.length > 0 ? (
          <div className="space-y-3">
            {recentGrades.slice(0, 3).map((grade) => (
              <div key={grade.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">
                    {grade.student?.full_name} - {grade.course?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    New grade recorded: {grade.grade}%
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(grade.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <a href="/dashboard/parent/grades" className="text-emerald-600 text-sm hover:underline">
            View all grades →
          </a>
        </div>
      </div>

      {/* Smart Communication Portal Tagline */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          SMART COMMUNICATION PORTAL · Parent Workspace
        </p>
      </div>
    </div>
  );
}