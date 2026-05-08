import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="ml-64 flex min-h-screen flex-col">
        <AdminTopbar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}