"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Stats = {
  users: number
  teachers: number
  students: number
  parents: number
  courses: number
  enrollments: number
}

export default function AdminDashboardPage() {
  const supabase = createClient()

  const [stats, setStats] = useState<Stats>({
    users: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    courses: 0,
    enrollments: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("role")

      const { data: courses } = await supabase
        .from("courses")
        .select("id")

      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id")

      setStats({
        users: profiles?.length || 0,
        teachers:
          profiles?.filter((p) => p.role === "teacher").length || 0,
        students:
          profiles?.filter((p) => p.role === "student").length || 0,
        parents:
          profiles?.filter((p) => p.role === "parent").length || 0,
        courses: courses?.length || 0,
        enrollments: enrollments?.length || 0,
      })
    }

    fetchStats()
  }, [supabase])

  return (
    <section className="w-full space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="w-full rounded-3xl bg-linear-to-r from-slate-900 via-indigo-900 to-purple-900 p-5 text-white shadow-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
          Admin Workspace
        </p>

        <h1 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
          System Overview
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
          Manage users, courses, enrollments, announcements, and overall LMS
          activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.users}
          color="from-blue-500 to-cyan-400"
        />

        <StatCard
          title="Teachers"
          value={stats.teachers}
          color="from-purple-500 to-pink-500"
        />

        <StatCard
          title="Students"
          value={stats.students}
          color="from-emerald-500 to-teal-400"
        />

        <StatCard
          title="Parents"
          value={stats.parents}
          color="from-orange-500 to-red-400"
        />

        <StatCard
          title="Courses"
          value={stats.courses}
          color="from-indigo-500 to-blue-500"
        />

        <StatCard
          title="Enrollments"
          value={stats.enrollments}
          color="from-slate-600 to-slate-900"
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Start common administration tasks quickly.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickAction
              href="/admin/users"
              title="Manage Users"
            />

            <QuickAction
              href="/admin/courses"
              title="Manage Courses"
            />

            <QuickAction
              href="/admin/enrollments"
              title="Manage Enrollments"
            />

            <QuickAction
              href="/admin/announcements"
              title="Publish Announcement"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Admin Notes
          </h2>

          <div className="mt-5 space-y-4 text-sm text-gray-600">
            <p>Use the Users page to manage roles.</p>

            <p>Use Courses to assign lecturers.</p>

            <p>Use Enrollments to link students to courses.</p>

            <p>Use Announcements for school-wide notices.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md">
      <div className={`h-2 bg-linear-to-r ${color}`} />

      <div className="p-4 sm:p-6">
        <p className="text-sm text-gray-500">{title}</p>

        <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          {value}
        </h2>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  title,
}: {
  href: string
  title: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-gray-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 sm:p-5"
    >
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Open section
      </p>
    </Link>
  )
}