// src/app/dashboard/parent/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const cards = [
  {
    title: "My Children",
    description: "View your children's profiles and academic progress.",
    href: "/dashboard/parent/children",
    icon: "👧👦",
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Announcements",
    description: "Stay updated with school and course announcements.",
    href: "/dashboard/parent/announcements",
    icon: "📢",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Grades",
    description: "Track your children's academic performance.",
    href: "/dashboard/parent/grades",
    icon: "📊",
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Profile",
    description: "Manage your account settings and preferences.",
    href: "/dashboard/parent/profile",
    icon: "👤",
    color: "from-orange-500 to-red-400",
  },
];

export default async function ParentDashboard() {
  // Get Parent by email
  const { data: parent } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", "parent@gmail.com")
    .single();

  if (!parent) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Parent not found. Please login as a parent.</p>
        </div>
      </div>
    );
  }

  // Get linked students
  const { data: links } = await supabase
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_id", parent.id);

  const studentIds = links?.map((link) => link.student_id) || [];
  const childrenCount = studentIds.length;

  // Get grades to calculate average
  const { data: allGrades } = await supabase
    .from("grades")
    .select("grade")
    .in("student_id", studentIds.length > 0 ? studentIds : ["none"]);

  const avgGrade =
    allGrades && allGrades.length > 0
      ? (allGrades.reduce((sum, g) => sum + g.grade, 0) / allGrades.length).toFixed(1)
      : "N/A";

  // Get announcements count
  const { count: announcementsCount } = await supabase
    .from("announcements")
    .select("*", { count: "exact", head: true });

  // Get deadlines count (example - adjust based on your schema)
  const deadlinesCount = 3;

  return (
    <section className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Smart Communication Portal
        </p>
        <h1 className="mt-3 text-4xl font-bold">Parent Workspace</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Welcome back, {parent.full_name}! Monitor your children's academic
          progress, stay updated with announcements, and track grades.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <div className="p-6">
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r text-2xl ${card.color}`}
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

      {/* Stats and Quick Actions Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="mt-1 text-gray-500">
            Access your most used parent features quickly.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickAction
              href="/dashboard/parent/children"
              icon="👧👦"
              label="View Children"
            />
            <QuickAction
              href="/dashboard/parent/grades"
              icon="📊"
              label="Check Grades"
            />
            <QuickAction
              href="/dashboard/parent/announcements"
              icon="📢"
              label="Announcements"
            />
          </div>
        </div>

        {/* Today's Overview Stats */}
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Today's Overview</h2>

          <div className="mt-6 space-y-4">
            <Stat label="Children" value={childrenCount.toString()} color="bg-blue-500" />
            <Stat label="Average Grade" value={`${avgGrade}%`} color="bg-emerald-500" />
            <Stat label="Announcements" value={announcementsCount?.toString() || "0"} color="bg-purple-500" />
            <Stat label="Upcoming Deadlines" value={deadlinesCount.toString()} color="bg-orange-500" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Quick Action Component
function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-gray-50 p-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50"
    >
      <div className="text-3xl">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-gray-800">{label}</p>
    </Link>
  );
}

// Stat Component
function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}