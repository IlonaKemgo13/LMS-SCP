"use client"

import { Bell } from "lucide-react"

export default function TeacherTopbar() {
  // Later, replace this with logged-in lecturer data from Supabase
  const lecturerName = "John Doe"

  const initials = lecturerName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Teacher Dashboard</h2>
        <p className="text-sm text-gray-500">Manage your academic content</p>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            {lecturerName}
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}