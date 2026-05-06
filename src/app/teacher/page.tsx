import Link from "next/link"

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
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Smart Communication Portal
        </p>
        <h1 className="mt-3 text-4xl font-bold">Teacher Workspace</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Manage courses, publish announcements, record lectures, and track
          student performance from one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`h-2 bg-linear-to-r ${card.color}`} />

            <div className="p-6">
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-r text-2xl ${card.color}`}
              >
                {card.icon}
              </div>

              <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{card.description}</p>

              <p className="mt-5 text-sm font-semibold text-indigo-600">
                Open section →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="mt-1 text-gray-500">
            Start your most common teaching tasks quickly.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickAction href="/teacher/announcements" icon="✏️" label="New Announcement" />
            <QuickAction href="/teacher/grades" icon="🧮" label="Add Grades" />
            <QuickAction href="/teacher/recordings" icon="🎙️" label="Upload Audio" />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Today&apos;s Overview</h2>

          <div className="mt-6 space-y-4">
            <Stat label="Courses" value="0" color="bg-blue-500" />
            <Stat label="Announcements" value="0" color="bg-purple-500" />
            <Stat label="Grades Posted" value="0" color="bg-emerald-500" />
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
      className="rounded-2xl border bg-gray-50 p-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50"
    >
      <div className="text-3xl">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-gray-800">{label}</p>
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
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  )
}