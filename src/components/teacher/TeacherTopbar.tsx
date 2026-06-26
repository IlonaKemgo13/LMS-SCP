"use client"

import { Bell } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const GRADIENTS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#10b981", to: "#0891b2" },
]

function getGradient(name: string) {
  return GRADIENTS[name.charCodeAt(0) % GRADIENTS.length]
}

export default function TeacherTopbar() {
  const { profile } = useAuth()

  const name = profile?.full_name ?? "Lecturer"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const gradient = getGradient(name)

  return (
    <header className="fixed left-0 right-0 top-16 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:left-64 lg:top-0">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          Teacher Dashboard
        </h2>
        <p className="truncate text-xs text-gray-500 sm:text-sm">
          Manage your academic content
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <button className="relative rounded-full p-2 transition hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-40 truncate text-sm font-medium text-gray-700 sm:block">
            {name}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-sm"
            style={{
              background: profile?.avatar_url
                ? "transparent"
                : `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
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
