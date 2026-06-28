import ParentSidebar from "@/components/parent/ParentSidebar"
import ParentTopbar from "@/components/parent/ParentTopbar"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-page)" }}>
      <ParentSidebar />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <ParentTopbar />

        <main className="flex-1 p-4 pt-20 sm:p-6 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
