import TeacherSidebar from "@/components/teacher/TeacherSidebar"
import TeacherTopbar from "@/components/teacher/TeacherTopbar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-100">
      <TeacherSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TeacherTopbar />

        <main className="min-w-0 flex-1 overflow-x-hidden p-6 pt-22">
          {children}
        </main>
      </div>
    </div>
  )
}