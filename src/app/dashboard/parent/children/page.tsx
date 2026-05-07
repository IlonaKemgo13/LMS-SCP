import { supabase } from '@/lib/supabase';

export default async function ChildrenPage() {
  // Get Parent Laetitia by email
  const { data: parent } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'parent@gmail.com')
    .single();

  if (!parent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Parent Not Found</h2>
          <p className="text-gray-500 mb-4">Please login with a parent account to view children.</p>
          <a href="/dashboard/parent" className="inline-block px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Get linked students
  const { data: links } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parent.id);

  if (!links || links.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Student</h1>
            <p className="text-gray-500 mt-1">View and monitor your children's progress</p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👧👦</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Student Linked Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              You haven't linked any Student to your account yet. Please contac t the administrator to link your Student.
            </p>
            <a 
              href="/dashboard/parent/profile" 
              className="inline-flex items-center px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
            >
              Go to Profile →
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">SMART COMMUNICATION PORTAL · Parent Workspace</p>
          </div>
        </div>
      </div>
    );
  }

  const studentIds = links.map(link => link.student_id);
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .in('id', studentIds);

  // Get enrolled courses and grades for each student
  const studentsWithDetails = await Promise.all(students?.map(async (student) => {
    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course:courses(*)')
      .eq('student_id', student.id);
    
    // Get grades
    const { data: grades } = await supabase
      .from('grades')
      .select('grade')
      .eq('student_id', student.id);
    
    const avgGrade = grades && grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1)
      : 'N/A';
    
    return { 
      ...student, 
      courses: enrollments?.map(e => e.course) || [], 
      avgGrade,
      totalGrades: grades?.length || 0
    };
  }) || []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
              <p className="text-gray-500 mt-1">View and monitor your children's academic progress</p>
            </div>
            <div className="bg-emerald-100 rounded-full px-4 py-2">
              <span className="text-emerald-700 font-medium">{studentsWithDetails.length} Child(ren)</span>
            </div>
          </div>
        </div>

        {/* Parent Info Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <span className="text-xl">👨‍👩‍👧</span>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Parent Account</p>
              <p className="font-medium">{parent.full_name} · {parent.email}</p>
            </div>
          </div>
        </div>

        {/* Children Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studentsWithDetails.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{student.full_name}</h2>
                    <p className="text-blue-100 text-sm mt-1">{student.email}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-3 py-1 text-center">
                    <p className="text-xs text-blue-100">Average</p>
                    <p className="text-xl font-bold">{student.avgGrade}%</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-700">{student.courses.length}</p>
                    <p className="text-xs text-gray-400">Enrolled Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-700">{student.totalGrades}</p>
                    <p className="text-xs text-gray-400">Total Grades</p>
                  </div>
                </div>

                {/* Enrolled Courses */}
                {student.courses.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📚</span> Enrolled Courses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {student.courses.map((course: any) => (
                        <span key={course.id} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          {course.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-2">
                  <a 
                    href={`/dashboard/parent/grades?studentId=${student.id}`}
                    className="flex-1 text-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium"
                  >
                    📝 View Grades
                  </a>
                  <a 
                    href={`/dashboard/parent/announcements?studentId=${student.id}`}
                    className="flex-1 text-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
                  >
                    📢 Announcements
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">SMART COMMUNICATION PORTAL · Parent Workspace</p>
        </div>
      </div>
    </div>
  );
}