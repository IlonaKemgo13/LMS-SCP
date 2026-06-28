"use client"

import { Bell } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function StudentTopbar() {
  const { profile } = useAuth()

  const name = profile?.full_name ?? "Student"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:ml-0">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          Student Portal
        </h2>
        <p className="hidden text-xs text-slate-500 sm:block">
          Your academic workspace
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative rounded-full p-2 transition hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-700" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {name}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm"
            style={{ background: "var(--color-student-accent)" }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
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
