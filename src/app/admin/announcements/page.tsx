"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  ChevronDown,
  Clock,
  Megaphone,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Announcement = {
  id: string
  title: string
  content: string
  deadline: string | null
  created_at: string
  is_global: boolean
  target_role: string | null
}

const TARGET_META: Record<
  string,
  {
    label: string
    bg: string
    text: string
    ring: string
    dot: string
  }
> = {
  all: {
    label: "Everyone",
    bg: "#f1f5f9",
    text: "#475569",
    ring: "#e2e8f0",
    dot: "#94a3b8",
  },
  teacher: {
    label: "Teachers",
    bg: "#f5f3ff",
    text: "#6d28d9",
    ring: "#ddd6fe",
    dot: "#7c3aed",
  },
  student: {
    label: "Students",
    bg: "#f0fdfa",
    text: "#0f766e",
    ring: "#99f6e4",
    dot: "#0891b2",
  },
  parent: {
    label: "Parents",
    bg: "#fffbeb",
    text: "#b45309",
    ring: "#fde68a",
    dot: "#f59e0b",
  },
}

const ANNOUNCEMENT_COLORS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#3b82f6", to: "#6366f1" },
  { from: "#10b981", to: "#0891b2" },
]

function annColor(title: string) {
  return ANNOUNCEMENT_COLORS[title.charCodeAt(0) % ANNOUNCEMENT_COLORS.length]
}

export default function AdminAnnouncementsPage() {
  const supabase = createClient()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [targetFilter, setTargetFilter] = useState("all")

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [deadline, setDeadline] = useState("")
  const [targetRole, setTargetRole] = useState("all")

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    setLoading(true)

    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, content, deadline, created_at, is_global, target_role")
      .eq("is_global", true)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAnnouncements(data)
    }

    setLoading(false)
  }

  function closeModal() {
    setTitle("")
    setContent("")
    setDeadline("")
    setTargetRole("all")
    setShowModal(false)
  }

  async function addAnnouncement() {
    if (!title || !content) {
      alert("Please enter title and message.")
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("announcements").insert({
      title,
      content,
      deadline: deadline || null,
      created_by: user?.id || null,
      is_global: true,
      target_role: targetRole,
      course_id: null,
      teacher_id: null,
    })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    await fetchAnnouncements()
    setSaving(false)
    closeModal()
  }

  const filteredAnnouncements = useMemo(() => {
    const search = searchTerm.toLowerCase()

    return announcements.filter((announcement) => {
      return (
        (announcement.title.toLowerCase().includes(search) ||
          announcement.content.toLowerCase().includes(search)) &&
        (targetFilter === "all" || announcement.target_role === targetFilter)
      )
    })
  }, [announcements, searchTerm, targetFilter])

  return (
    <section className="w-full space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-5 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-28 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
          Admin Workspace
        </p>

        <h1 className="relative mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
          Global Announcements
        </h1>

        <p className="relative mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
          Publish important school-wide announcements for students, teachers,
          parents, or everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Global Notices"
          value={announcements.length}
          icon={<Bell className="h-5 w-5 text-violet-600" />}
          bar="from-violet-600 to-violet-300"
        />

        <StatCard
          label="For Everyone"
          value={announcements.filter((a) => a.target_role === "all").length}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          bar="from-blue-500 to-indigo-500"
        />

        <StatCard
          label="With Deadlines"
          value={announcements.filter((a) => a.deadline).length}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          bar="from-amber-500 to-yellow-300"
        />
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {loading
                ? "Loading..."
                : `${filteredAnnouncements.length} announcement${
                    filteredAnnouncements.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 sm:w-64"
              />
            </div>

            <div className="relative">
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-violet-500 sm:w-44"
              >
                <option value="all">All Targets</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              <Plus className="h-4 w-4" />
              Add Announcement
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] border-collapse md:min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {["ANNOUNCEMENT", "TARGET", "DEADLINE", "CREATED"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-left text-xs font-bold tracking-widest text-slate-400"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    Loading announcements...
                  </td>
                </tr>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => {
                  const color = annColor(announcement.title)
                  const target = announcement.target_role || "all"
                  const meta = TARGET_META[target] || TARGET_META.all
                  const hasDeadline = Boolean(announcement.deadline)
                  const isPast =
                    hasDeadline &&
                    new Date(announcement.deadline!) < new Date()

                  return (
                    <tr
                      key={announcement.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                            }}
                          >
                            <Megaphone className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {announcement.title}
                            </p>

                            <p className="mt-1 line-clamp-2 max-w-md text-sm leading-relaxed text-slate-400">
                              {announcement.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <TargetBadge meta={meta} />
                      </td>

                      <td className="px-5 py-4">
                        {hasDeadline ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${
                              isPast
                                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {new Date(
                              announcement.deadline!
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">
                            No deadline
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {new Date(
                          announcement.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <Megaphone className="mx-auto mb-4 h-10 w-10 text-slate-200" />

                    <p className="text-sm text-slate-400">
                      No announcements found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredAnnouncements.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredAnnouncements.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {announcements.length}
              </span>{" "}
              announcements
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

            <div className="flex items-start justify-between p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Global Announcement
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Publish an important notice to selected users.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 pb-6">
              <ModalField
                label="Title"
                placeholder="e.g. School Fees Deadline"
                value={title}
                onChange={setTitle}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Message
                </label>

                <textarea
                  rows={4}
                  placeholder="Write announcement message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-violet-500"
                />
              </div>

              <ModalField
                label="Deadline (optional)"
                placeholder=""
                value={deadline}
                onChange={setDeadline}
                type="date"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Target Audience
                </label>

                <div className="relative">
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-violet-500"
                  >
                    <option value="all">Everyone</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={closeModal}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={addAnnouncement}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-violet-700 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
                >
                  {saving ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
  icon,
  bar,
}: {
  label: string
  value: number
  icon: React.ReactNode
  bar: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
      <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${bar}`} />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
        {value}
      </h2>
    </div>
  )
}

function TargetBadge({
  meta,
}: {
  meta: {
    label: string
    bg: string
    text: string
    ring: string
    dot: string
  }
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: meta.bg,
        color: meta.text,
        boxShadow: `0 0 0 1px ${meta.ring}`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: meta.dot,
        }}
      />
      {meta.label}
    </span>
  )
}

function ModalField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-violet-500"
      />
    </div>
  )
}