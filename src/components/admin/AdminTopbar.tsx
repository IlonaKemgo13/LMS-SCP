"use client"

import { Bell } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function AdminTopbar() {
  const { profile } = useAuth()

  const name = profile?.full_name ?? "Administrator"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold sm:text-lg">
          Admin Dashboard
        </h2>
        <p className="hidden text-sm text-slate-500 sm:block">
          Manage the LMS platform
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative rounded-full p-2 transition hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {name}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm"
            style={{ background: "var(--color-admin-sidebar-bg)" }}
          >
            {profile?.avatar_url ? (
              <img
                src={`${profile.avatar_url}?t=${Date.now()}`}
                alt="Admin avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
