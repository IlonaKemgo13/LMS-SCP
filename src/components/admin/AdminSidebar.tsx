"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/parent-links", label: "Parent-To-Student" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/recordings", label: "Recordings" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/profile", label: "Profile" },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="min-h-screen w-64 bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold">SCP-LMS</h1>
        <p className="text-sm text-slate-400">Admin Panel</p>
      </div>

      <nav className="space-y-2 p-4">
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
      </nav>
    </aside>
  )
}