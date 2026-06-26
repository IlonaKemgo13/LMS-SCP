"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  GraduationCap,
  Heart,
  Link2,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { createClient } from "@/lib/supabase/client"

type Parent = {
  id: string
  full_name: string
  email: string
}

type Student = {
  id: string
  full_name: string
  email: string
}

type ParentStudentLink = {
  id: string
  created_at: string
  parent: {
    full_name: string
    email: string
  } | null

  student: {
    full_name: string
    email: string
  } | null
}

/* ───────────────────────────────────────────── */

const PARENT_COLORS = [
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#8b5cf6", to: "#6d28d9" },
  { from: "#ec4899", to: "#be185d" },
  { from: "#ef4444", to: "#b91c1c" },
]

const STUDENT_COLORS = [
  { from: "#0891b2", to: "#0d9488" },
  { from: "#3b82f6", to: "#6366f1" },
  { from: "#10b981", to: "#0891b2" },
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#06b6d4", to: "#0284c7" },
]

function parentColor(name: string) {
  return PARENT_COLORS[name.charCodeAt(0) % PARENT_COLORS.length]
}

function studentColor(name: string) {
  return STUDENT_COLORS[name.charCodeAt(0) % STUDENT_COLORS.length]
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/* ───────────────────────────────────────────── */

export default function AdminParentLinksPage() {
  const supabase = createClient()

  const [parents, setParents] = useState<Parent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [links, setLinks] = useState<ParentStudentLink[]>([])

  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  const [parentId, setParentId] = useState("")
  const [studentId, setStudentId] = useState("")

  useEffect(() => {
    fetchParents()
    fetchStudents()
    fetchLinks()
  }, [])

  async function fetchParents() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "parent")
      .order("full_name")

    setParents(data || [])
  }

  async function fetchStudents() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student")
      .order("full_name")

    setStudents(data || [])
  }

  async function fetchLinks() {
    setLoading(true)

    const { data, error } = await supabase
      .from("parent_student_links")
      .select(`
        id,
        created_at,
        parent:profiles!parent_student_links_parent_id_fkey (
          full_name,
          email
        ),
        student:profiles!parent_student_links_student_id_fkey (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setLinks(data as unknown as ParentStudentLink[])
    }

    setLoading(false)
  }

  function closeModal() {
    setParentId("")
    setStudentId("")
    setShowModal(false)
  }

  async function addLink() {
    if (!parentId || !studentId) {
      toast.error("Please select parent and student.")
      return
    }

    setSaving(true)

    const res  = await fetch("/api/admin/parent-links", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ parent_id: parentId, student_id: studentId }),
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || "Failed to create link.")
      setSaving(false)
      return
    }

    toast.success("Parent linked to student!")
    await fetchLinks()
    setSaving(false)
    closeModal()
  }

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const search = searchTerm.toLowerCase()

      return (
        link.parent?.full_name
          .toLowerCase()
          .includes(search) ||
        link.parent?.email
          .toLowerCase()
          .includes(search) ||
        link.student?.full_name
          .toLowerCase()
          .includes(search) ||
        link.student?.email
          .toLowerCase()
          .includes(search)
      )
    })
  }, [links, searchTerm])

  return (
    <section className="space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
          Admin Workspace
        </p>

        <h1 className="relative mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
          Parent–Student Relationships
        </h1>

        <p className="relative mt-3 max-w-3xl text-sm text-white/80 sm:text-base">
          Connect parents with their children to allow monitoring
          of grades, announcements, and academic activity.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Parents"
          value={parents.length}
          icon={<Heart className="h-5 w-5 text-rose-500" />}
          bar="from-rose-500 to-pink-400"
        />

        <StatCard
          label="Students"
          value={students.length}
          icon={
            <GraduationCap className="h-5 w-5 text-cyan-600" />
          }
          bar="from-cyan-500 to-cyan-300"
        />

        <StatCard
          label="Relationships"
          value={links.length}
          icon={<Link2 className="h-5 w-5 text-violet-600" />}
          bar="from-violet-600 to-violet-300"
        />
      </div>

      {/* TABLE CARD */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Parent Links
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {loading
                ? "Loading..."
                : `${filteredLinks.length} relationship${
                    filteredLinks.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* SEARCH */}

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search parent or student..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 sm:w-64"
              />
            </div>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              <Plus className="h-4 w-4" />
              Link Parent
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="min-w-[850px] border-collapse md:min-w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "PARENT",
                  "STUDENT",
                  "LINKED DATE",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-xs font-bold tracking-widest text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    Loading relationships...
                  </td>
                </tr>
              ) : filteredLinks.length > 0 ? (
                filteredLinks.map((link) => {
                  const parentName =
                    link.parent?.full_name || "Unknown"

                  const studentName =
                    link.student?.full_name || "Unknown"

                  const parentTheme =
                    parentColor(parentName)

                  const studentTheme =
                    studentColor(studentName)

                  return (
                    <tr
                      key={link.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      {/* PARENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${parentTheme.from}, ${parentTheme.to})`,
                            }}
                          >
                            {initials(parentName)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {parentName}
                            </p>

                            <p className="text-xs text-slate-400">
                              {link.parent?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* STUDENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {/* CONNECTOR */}

                          <div className="hidden items-center gap-1 sm:flex">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background:
                                  parentTheme.from,
                              }}
                            />

                            <div className="h-[2px] w-6 bg-gradient-to-r from-violet-300 to-indigo-300" />

                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background:
                                  studentTheme.from,
                              }}
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                              style={{
                                background: `linear-gradient(135deg, ${studentTheme.from}, ${studentTheme.to})`,
                              }}
                            >
                              {initials(studentName)}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {studentName}
                              </p>

                              <p className="text-xs text-slate-400">
                                {link.student?.email ||
                                  "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {new Date(
                          link.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-16 text-center"
                  >
                    <Users className="mx-auto h-10 w-10 text-slate-200" />

                    <p className="mt-3 text-sm text-slate-400">
                      No parent relationships found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        {!loading && filteredLinks.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredLinks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {links.length}
              </span>{" "}
              relationships
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-violet-600 to-cyan-500" />

            <div className="flex items-start justify-between p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Link Parent To Student
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create a parent-child relationship in the LMS.
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
              <ModalSelect
                label="Parent"
                value={parentId}
                onChange={setParentId}
                placeholder="Select parent"
                options={parents.map((parent) => ({
                  value: parent.id,
                  label: `${parent.full_name} (${parent.email})`,
                }))}
              />

              <ModalSelect
                label="Student"
                value={studentId}
                onChange={setStudentId}
                placeholder="Select student"
                options={students.map((student) => ({
                  value: student.id,
                  label: `${student.full_name} (${student.email})`,
                }))}
              />

              {/* PREVIEW */}

              {parentId && studentId && (() => {
                const parent = parents.find(
                  (p) => p.id === parentId
                )

                const student = students.find(
                  (s) => s.id === studentId
                )

                if (!parent || !student) return null

                const parentTheme = parentColor(
                  parent.full_name
                )

                const studentTheme = studentColor(
                  student.full_name
                )

                return (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${parentTheme.from}, ${parentTheme.to})`,
                          }}
                        >
                          {initials(parent.full_name)}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {parent.full_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-[2px] w-6 bg-violet-300" />

                        <Link2 className="h-4 w-4 text-violet-600" />

                        <div className="h-[2px] w-6 bg-violet-300" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${studentTheme.from}, ${studentTheme.to})`,
                          }}
                        >
                          {initials(student.full_name)}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {student.full_name}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={closeModal}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={addLink}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-violet-700 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Relationship"}
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
      <div
        className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${bar}`}
      />

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

function ModalSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: {
    value: string
    label: string
  }[]
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none transition focus:border-violet-500"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}