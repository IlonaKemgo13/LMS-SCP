"use client"

import Link from "next/link"
import { useTeacherStats } from "@/lib/hooks/useTeacherStats"

const cards = [
  { title: "My Courses",        description: "View and manage assigned courses.",       href: "/teacher/courses",       icon: "📚", color: "from-blue-500 to-cyan-400"    },
  { title: "Announcements",     description: "Post updates, reminders, and deadlines.", href: "/teacher/announcements", icon: "📢", color: "from-purple-500 to-pink-500"  },
  { title: "Grades",            description: "Enter and manage student grades.",         href: "/teacher/grades",        icon: "📊", color: "from-emerald-500 to-teal-400" },
  { title: "Audio Recordings",  description: "Upload lecture audio for your courses.",  href: "/teacher/recordings",    icon: "🎧", color: "from-orange-500 to-red-400"   },
]

export default function TeacherDashboard() {
  const { data, isLoading } = useTeacherStats()

  return (
    <section className="w-full space-y-6 px-4 pb-8 pt-36 sm:px-6 md:px-8 lg:px-10 lg:pt-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-5 text-white shadow-xl sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">Smart Communication Portal</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl xl:text-5xl">Teacher Workspace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
          Manage courses, publish announcements, record lectures, and track student performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <div className="p-5 sm:p-6">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r text-2xl text-white shadow-md sm:h-14 sm:w-14 ${card.color}`}>
                {card.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{card.description}</p>
              <p className="mt-5 text-sm font-semibold text-indigo-600 transition group-hover:translate-x-1">Open section →</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Quick Actions</h2>
          <p className="mt-1 text-sm text-gray-500">Start your most common teaching tasks quickly.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["/teacher/announcements", "✏️", "New Announcement"],
              ["/teacher/grades",        "🧮", "Add Grades"],
              ["/teacher/recordings",    "🎙️", "Upload Audio"],
            ].map(([href, icon, label]) => (
              <Link key={href as string} href={href as string} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50">
                <div className="text-3xl">{icon}</div>
                <p className="mt-3 text-sm font-semibold text-gray-800">{label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl">Overview</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Courses",      isLoading ? "..." : String(data?.courses    ?? 0), "bg-blue-500"   ],
              ["Announcements",isLoading ? "..." : String(data?.grades     ?? 0), "bg-purple-500" ],
              ["Grades Posted",isLoading ? "..." : String(data?.materials  ?? 0), "bg-emerald-500"],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${color}`} />
                  <span className="text-sm text-white/80">{label}</span>
                </div>
                <span className="text-xl font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
