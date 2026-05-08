"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoutModal from "@/components/LogoutModal"

const links = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/courses", label: "My Courses" },
  { href: "/teacher/announcements", label: "Announcements" },
  { href: "/teacher/grades", label: "Grades" },
  { href: "/teacher/recordings", label: "Audio Recordings" },
  { href: "/teacher/profile", label: "My Profile" },
]

export default function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl font-bold">SCP-LMS</h1>
        <p className="text-sm text-slate-300">Teacher Panel</p>
      </div>

      <nav className="space-y-2 p-4">
        <div className="space-y-2">
           {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/teacher" && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-slate-900"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
        </div>

        <div className="mt-auto pt-4">
          <LogoutModal />
        </div>
       
      </nav>
    </aside>
  )
}