"use client"

import Link from "next/link"
import { useAdminStats } from "@/lib/hooks/useAdminStats"

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStats()

  const stats = {
    totalUsers:  data?.totalUsers  ?? 0,
    teachers:    data?.teachers    ?? 0,
    students:    data?.students    ?? 0,
    parents:     data?.parents     ?? 0,
    courses:     data?.courses     ?? 0,
    enrollments: data?.enrollments ?? 0,
  }

  const statCards = [
    { title: "Total Users",  value: isLoading ? "..." : stats.totalUsers,  color: "from-blue-500 to-cyan-400"     },
    { title: "Teachers",     value: isLoading ? "..." : stats.teachers,    color: "from-purple-500 to-pink-500"   },
    { title: "Students",     value: isLoading ? "..." : stats.students,    color: "from-emerald-500 to-teal-400"  },
    { title: "Parents",      value: isLoading ? "..." : stats.parents,     color: "from-orange-500 to-red-400"    },
    { title: "Courses",      value: isLoading ? "..." : stats.courses,     color: "from-indigo-500 to-blue-500"   },
    { title: "Enrollments",  value: isLoading ? "..." : stats.enrollments, color: "from-slate-600 to-slate-900"   },
  ]

  return (
    <section className="w-full space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-5 text-white shadow-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">Admin Workspace</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">System Overview</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
          Manage users, courses, enrollments, announcements, and overall LMS activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.title} className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md">
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-500">{card.title}</p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Quick Actions</h2>
          <p className="mt-1 text-sm text-gray-500">Start common administration tasks quickly.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["/admin/users",         "Manage Users"],
              ["/admin/courses",       "Manage Courses"],
              ["/admin/enrollments",   "Manage Enrollments"],
              ["/admin/announcements", "Publish Announcement"],
            ].map(([href, title]) => (
              <Link key={href} href={href} className="rounded-2xl border bg-gray-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50 sm:p-5">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">Open section</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Admin Notes</h2>
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
