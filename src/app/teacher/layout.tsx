import TeacherSidebar from "@/components/teacher/TeacherSidebar"
import TeacherTopbar from "@/components/teacher/TeacherTopbar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherSidebar />

      <div className="ml-64 flex min-h-screen flex-col">
        <TeacherTopbar />

        <main className="flex-1 p-6 pt-22">
          {children}
        </main>
      </div>
    </div>
  )
}