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

      <div className="flex min-h-screen flex-col lg:ml-64">
        <AdminTopbar />

        <main className="flex-1 p-4 pt-20 sm:p-6 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}