"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutModal from "@/components/LogoutModal"

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/parent-links", label: "Parent-To-Student" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/profile", label: "Profile" },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold">SCP-LMS</h1>
        <p className="text-sm text-slate-400">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex h-[calc(100vh-96px)] flex-col p-4">
        {/* Links */}
        <div className="space-y-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4">
          <LogoutModal />
        </div>
      </nav>
    </aside>
  )
}