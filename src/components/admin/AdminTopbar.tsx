"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url: string | null
}

export default function AdminTopbar() {
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
  fetchProfile()

  window.addEventListener("profile-avatar-updated", fetchProfile)

  return () => {
    window.removeEventListener("profile-avatar-updated", fetchProfile)
  }
}, [])

  const fetchProfile = async () => {
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

  const adminName = profile?.full_name || "Administrator"

  const initials = adminName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
      {/* Left */}
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold sm:text-lg">
          Admin Dashboard
        </h2>

        <p className="hidden text-sm text-gray-500 sm:block">
          Manage the LMS platform
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notifications */}
        <button className="relative rounded-full p-2 transition hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-700" />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {adminName}
          </span>

          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
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