"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Megaphone,
  FileText,
  Mic2,
  Award,
  Settings,
} from "lucide-react"
import LogoutModal from "@/components/LogoutModal"

const links = [
  { href: "/student-dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/student-courses",      label: "Courses",      icon: BookOpen },
  { href: "/student-grades",       label: "Grades",       icon: BarChart2 },
  { href: "/student-announcements",label: "Announcements",icon: Megaphone },
  { href: "/student-materials",    label: "Materials",    icon: FileText },
  { href: "/student-recordings",   label: "Recordings",   icon: Mic2 },
  { href: "/student-results",      label: "Results",      icon: Award },
  { href: "/student-settings",     label: "Settings",     icon: Settings },
]

export default function StudentSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile topbar */}
      <div
        className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between px-4 text-white shadow-lg lg:hidden"
        style={{ background: "var(--color-student-sidebar-bg)" }}
      >
        <h1 className="text-xl font-bold">SCP Portal</h1>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-white/10"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col text-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{ background: "var(--color-student-sidebar-bg)" }}
      >
        <div className="border-b border-white/10 p-6">
          <h1 className="text-2xl font-bold">SCP Portal</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-student-sidebar-text)" }}>
            Student Workspace
          </p>
        </div>

        <nav className="flex flex-1 flex-col p-4">
          <div className="space-y-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/student-dashboard" &&
                  pathname.startsWith(link.href))
              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-slate-900 shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                  style={
                    !isActive
                      ? { color: "var(--color-student-sidebar-text)" }
                      : undefined
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-auto pt-6">
            <LogoutModal />
          </div>
        </nav>
      </aside>
    </>
  )
}
