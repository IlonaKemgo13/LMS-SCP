"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const cards = [
  {
    title: "My Courses",
    description: "View and manage assigned courses.",
    href: "/teacher/courses",
    icon: "📚",
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Announcements",
    description: "Post updates, reminders, and deadlines.",
    href: "/teacher/announcements",
    icon: "📢",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Grades",
    description: "Enter and manage student grades.",
    href: "/teacher/grades",
    icon: "📊",
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Audio Recordings",
    description: "Upload lecture audio for your courses.",
    href: "/teacher/recordings",
    icon: "🎧",
    color: "from-orange-500 to-red-400",
  },
]

export default function TeacherDashboard() {
  const supabase = createClient()

  const [coursesCount, setCoursesCount] = useState(0)
  const [announcementsCount, setAnnouncementsCount] = useState(0)
  const [gradesCount, setGradesCount] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // COURSES
    const { count: courseCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", user.id)

    // ANNOUNCEMENTS
    const { count: announcementCount } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", user.id)

    // GRADES
    const { count: gradeCount } = await supabase
      .from("grades")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", user.id)

    setCoursesCount(courseCount || 0)
    setAnnouncementsCount(announcementCount || 0)
    setGradesCount(gradeCount || 0)
  }

  return (
    <section className="w-full space-y-6 px-4 pb-8 pt-36 sm:px-6 md:px-8 lg:px-10 lg:pt-24">
      {/* HERO */}
      <div className="overflow-hidden rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-5 text-white shadow-xl sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
          Smart Communication Portal
        </p>

        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl xl:text-5xl">
          Teacher Workspace
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
          Manage courses, publish announcements, record lectures, and track
          student performance from one place.
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`h-2 bg-linear-to-r ${card.color}`} />

            <div className="p-5 sm:p-6">
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r text-2xl text-white shadow-md sm:h-14 sm:w-14 ${card.color}`}
              >
                {card.icon}
              </div>

              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {card.title}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                {card.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-indigo-600 transition group-hover:translate-x-1">
                Open section →
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* QUICK ACTIONS */}
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Start your most common teaching tasks quickly.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              href="/teacher/announcements"
              icon="✏️"
              label="New Announcement"
            />

            <QuickAction
              href="/teacher/grades"
              icon="🧮"
              label="Add Grades"
            />

            <QuickAction
              href="/teacher/recordings"
              icon="🎙️"
              label="Upload Audio"
            />
          </div>
        </div>

        {/* OVERVIEW */}
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl">
            Today&apos;s Overview
          </h2>

          <div className="mt-6 space-y-4">
            <Stat
              label="Courses"
              value={String(coursesCount)}
              color="bg-blue-500"
            />

            <Stat
              label="Announcements"
              value={String(announcementsCount)}
              color="bg-purple-500"
            />

            <Stat
              label="Grades Posted"
              value={String(gradesCount)}
              color="bg-emerald-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center transition duration-300 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm"
    >
      <div className="text-3xl sm:text-4xl">{icon}</div>

      <p className="mt-3 text-sm font-semibold text-gray-800 sm:text-base">
        {label}
      </p>
    </Link>
  )
}

function Stat({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-3 w-3 shrink-0 rounded-full ${color}`} />

        <span className="truncate text-sm text-white/80 sm:text-base">
          {label}
        </span>
      </div>

      <span className="text-xl font-bold sm:text-2xl">
        {value}
      </span>
    </div>
  )
}