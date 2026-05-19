"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Megaphone,
  ClipboardList,
  Mic2,
  User,
} from "lucide-react"

import LogoutModal from "@/components/LogoutModal"

const links = [
  {
    href: "/teacher",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/teacher/courses",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/teacher/announcements",
    label: "Announcements",
    icon: Megaphone,
  },
  {
    href: "/teacher/grades",
    label: "Grades",
    icon: ClipboardList,
  },
  {
    href: "/teacher/recordings",
    label: "Audio Recordings",
    icon: Mic2,
  },
  {
    href: "/teacher/profile",
    label: "My Profile",
    icon: User,
  },
]

export default function TeacherSidebar() {
  const pathname = usePathname()

  const [open, setOpen] = useState(false)

  return (
    <>
      {/* MOBILE TOPBAR */}

      <div className="fixed left-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            SCP-LMS
          </h1>

          <p className="text-xs text-slate-500">
            Teacher Panel
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* MOBILE OVERLAY */}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-60 flex h-screen w-72 flex-col bg-slate-900 text-white transition-transform duration-300 lg:w-64 ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-700 p-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              SCP-LMS
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Teacher Panel
            </p>
          </div>

          {/* CLOSE BTN MOBILE */}

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex flex-1 flex-col p-4">
          <div className="space-y-2">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/teacher" &&
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
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* LOGOUT */}

          <div className="mt-auto pt-6">
            <LogoutModal />
          </div>
        </nav>
      </aside>
    </>
  )
}