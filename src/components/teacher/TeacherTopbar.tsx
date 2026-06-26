"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string | null
}

const AVATAR_GRADIENTS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#10b981", to: "#0891b2" },
]

function getGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

export default function TeacherTopbar() {
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("id", user.id)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  const lecturerName = profile?.full_name || "Lecturer"

  const initials = lecturerName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const gradient = getGradient(lecturerName)

  return (
    <header className="fixed left-0 right-0 top-16 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:left-64 lg:top-0">
      {/* LEFT */}
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          Teacher Dashboard
        </h2>

        <p className="truncate text-xs text-gray-500 sm:text-sm">
          Manage your academic content
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        {/* NOTIFICATION */}
        <button
          type="button"
          className="relative rounded-full p-2 transition hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-700" />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* PROFILE */}
        <div className="flex items-center gap-3">
          <span className="hidden max-w-40 truncate text-sm font-medium text-gray-700 sm:block">
            {lecturerName}
          </span>

          {/* AVATAR */}
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