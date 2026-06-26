import TeacherSidebar from "@/components/teacher/TeacherSidebar"
import TeacherTopbar from "@/components/teacher/TeacherTopbar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Topbar */}
      <TeacherTopbar />

      {/* Main Layout */}
      <div
        className="
          min-h-screen
          transition-all
          duration-300

          lg:ml-64
        "
      >
        {/* Mobile spacing for fixed topbar */}
        <main
          className="
            w-full
            overflow-x-hidden

            pt-28
            pb-6

            px-4
            sm:px-6
            lg:px-8
            lg:pt-24
          "
        >
          {children}
        </main>
      </div>
    </div>
  )
}