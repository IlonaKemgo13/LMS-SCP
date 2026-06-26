"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
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

  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Topbar */}
      <div className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-slate-950 px-4 text-white shadow-lg lg:hidden">
        <h1 className="text-xl font-bold">SCP-LMS</h1>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-2xl font-bold">SCP-LMS</h1>

          <p className="text-sm text-slate-400">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col p-4">
          <div className="space-y-2">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/admin" &&
                  pathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
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

          {/* Logout */}
          <div className="mt-auto pt-4">
            <LogoutModal />
          </div>
        </nav>
      </aside>
    </>
  )
}