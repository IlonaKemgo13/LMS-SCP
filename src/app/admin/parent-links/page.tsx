"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Plus, Search, Users, X } from "lucide-react"
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
      alert("Please select parent and student.")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("parent_student_links")
      .insert({
        parent_id: parentId,
        student_id: studentId,
      })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    await fetchLinks()

    setSaving(false)
    closeModal()
  }

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const search = searchTerm.toLowerCase()

      return (
        link.parent?.full_name.toLowerCase().includes(search) ||
        link.parent?.email.toLowerCase().includes(search) ||
        link.student?.full_name.toLowerCase().includes(search) ||
        link.student?.email.toLowerCase().includes(search)
      )
    })
  }, [links, searchTerm])

  return (
    <>
      <section className="space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-900 p-10 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Admin Workspace
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Parent Student Relationships
          </h1>

          <p className="mt-3 max-w-3xl text-white/80">
            Connect parents with their children to allow monitoring of grades,
            announcements, and academic activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title="Parents" value={parents.length} />
          <StatCard title="Students" value={students.length} />
          <StatCard title="Relationships" value={links.length} />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Parent Links
              </h2>

              <p className="mt-2 text-gray-500">
                {filteredLinks.length} relationship(s)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Link Parent
            </button>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search parent or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-slate-600">
                    Parent
                  </th>

                  <th className="px-8 py-5 text-left text-sm font-semibold text-slate-600">
                    Student
                  </th>

                  <th className="px-8 py-5 text-left text-sm font-semibold text-slate-600">
                    Linked Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-12 text-center text-sm text-gray-500"
                    >
                      Loading relationships...
                    </td>
                  </tr>
                ) : filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-8 py-6">
                        <p className="font-semibold text-slate-900">
                          {link.parent?.full_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {link.parent?.email}
                        </p>
                      </td>

                      <td className="px-8 py-6">
                        <p className="font-semibold text-slate-900">
                          {link.student?.full_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {link.student?.email}
                        </p>
                      </td>

                      <td className="px-8 py-6 text-sm text-gray-500">
                        {new Date(link.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-12 text-center text-sm text-gray-500"
                    >
                      No parent relationships found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Link Parent To Student
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a parent-child relationship in the LMS.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 transition hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-5">
              <SelectField
                label="Parent"
                value={parentId}
                onChange={setParentId}
                placeholder="Select parent"
                options={parents.map((parent) => ({
                  value: parent.id,
                  label: `${parent.full_name} (${parent.email})`,
                }))}
              />

              <SelectField
                label="Student"
                value={studentId}
                onChange={setStudentId}
                placeholder="Select student"
                options={students.map((student) => ({
                  value: student.id,
                  label: `${student.full_name} (${student.email})`,
                }))}
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={addLink}
                  disabled={saving}
                  className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Relationship"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-500" />

      <div className="p-6">
        <p className="text-sm text-gray-500">{title}</p>

        <h2 className="mt-3 text-4xl font-bold text-gray-900">
          {value}
        </h2>
      </div>
    </div>
  )
}

function SelectField({
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
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-gray-200 px-4 pr-10 outline-none transition focus:border-indigo-500"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}