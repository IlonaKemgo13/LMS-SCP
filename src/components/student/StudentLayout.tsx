import StudentSidebar from "@/components/student/StudentSidebar"
import StudentTopbar from "@/components/student/StudentTopbar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-page)" }}>
      <StudentSidebar />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <StudentTopbar />

        <main className="flex-1 p-4 pt-20 sm:p-6 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
