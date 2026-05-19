"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldOff,
  X,
  Users,
  ChevronDown,
  Save,
  AlertTriangle,
  Mail,
  CalendarDays,
  Shield,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type User = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

const ROLE_META: Record<
  string,
  {
    label: string
    barFrom: string
    barTo: string
    badgeBg: string
    badgeText: string
    dotColor: string
  }
> = {
  admin: {
    label: "Admin",
    barFrom: "#f43f5e",
    barTo: "#fb7185",
    badgeBg: "#fff1f2",
    badgeText: "#be123c",
    dotColor: "#f43f5e",
  },
  teacher: {
    label: "Teacher",
    barFrom: "#7c3aed",
    barTo: "#a78bfa",
    badgeBg: "#f5f3ff",
    badgeText: "#6d28d9",
    dotColor: "#7c3aed",
  },
  student: {
    label: "Student",
    barFrom: "#0891b2",
    barTo: "#22d3ee",
    badgeBg: "#f0fdfa",
    badgeText: "#0f766e",
    dotColor: "#0891b2",
  },
  parent: {
    label: "Parent",
    barFrom: "#f59e0b",
    barTo: "#fcd34d",
    badgeBg: "#fffbeb",
    badgeText: "#b45309",
    dotColor: "#f59e0b",
  },
}

export default function AdminUsersPage() {
  const supabase = createClient()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  /* add user */
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")

  /* filters */
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")

  /* view */
  const [viewUser, setViewUser] = useState<User | null>(null)

  /* edit */
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("student")
  const [updating, setUpdating] = useState(false)

  /* disable */
  const [disableUser, setDisableUser] = useState<User | null>(null)
  const [disabling, setDisabling] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })

    setUsers(data || [])
    setLoading(false)
  }

  async function saveUser() {
    if (!fullName || !email || !password || !role) {
      alert("Please fill all fields.")
      return
    }

    setSaving(true)

    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        role,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || "Failed to create user.")
      setSaving(false)
      return
    }

    await fetchUsers()

    setFullName("")
    setEmail("")
    setPassword("")
    setRole("student")

    setSaving(false)
    setShowModal(false)
  }

  function openEditModal(user: User) {
    setEditUser(user)
    setEditName(user.full_name)
    setEditEmail(user.email)
    setEditRole(user.role)
  }

  async function updateUser() {
    if (!editUser) return

    setUpdating(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editName,
        email: editEmail,
        role: editRole,
      })
      .eq("id", editUser.id)

    if (error) {
      alert(error.message)
      setUpdating(false)
      return
    }

    await fetchUsers()

    setUpdating(false)
    setEditUser(null)
  }

  async function disableAccount() {
    if (!disableUser) return

    setDisabling(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "disabled",
      })
      .eq("id", disableUser.id)

    if (error) {
      alert(error.message)
      setDisabling(false)
      return
    }

    await fetchUsers()

    setDisabling(false)
    setDisableUser(null)
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const s = searchTerm.toLowerCase()

      return (
        (u.full_name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s)) &&
        (selectedRole === "all" || u.role === selectedRole)
      )
    })
  }, [users, searchTerm, selectedRole])

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      admin: 0,
      teacher: 0,
      student: 0,
      parent: 0,
    }

    users.forEach((u) => {
      if (u.role in c) c[u.role]++
    })

    return c
  }, [users])

  return (
    <section className="space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
      {/* HERO */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-900 to-purple-900 p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          Admin Workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          User Management
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Manage admins, teachers, students, and parents registered in the LMS platform.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(["admin", "teacher", "student", "parent"] as const).map((key) => {
          const m = ROLE_META[key]

          return (
            <div
              key={key}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div
                className="mb-4 h-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${m.barFrom}, ${m.barTo})`,
                }}
              />

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {m.label}s
              </p>

              <h2 className="mt-2 text-4xl font-black text-slate-900">
                {counts[key]}
              </h2>
            </div>
          )
        })}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Platform Users
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {loading
                ? "Loading..."
                : `${filteredUsers.length} user(s) found`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-violet-500 sm:w-64"
              />
            </div>

            {/* FILTER */}
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-violet-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* ADD USER */}
            <button
              onClick={() => setShowModal(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {["USER", "EMAIL", "ROLE", "JOINED", "ACTIONS"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-bold tracking-widest text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                        {user.full_name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.full_name}
                        </p>

                        <p className="text-xs text-slate-400">
                          LMS User
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <ActionBtn
                        icon={<Eye />}
                        onClick={() => setViewUser(user)}
                      />

                      <ActionBtn
                        icon={<Pencil />}
                        onClick={() => openEditModal(user)}
                      />

                      <ActionBtn
                        icon={<ShieldOff />}
                        danger
                        onClick={() => setDisableUser(user)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showModal && (
        <ModalWrapper onClose={() => setShowModal(false)}>
          <ModalHeader
            title="Add New User"
            subtitle="Create a new LMS account."
            onClose={() => setShowModal(false)}
          />

          <div className="space-y-4">
            <Field
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChange={setFullName}
            />

            <Field
              label="Email"
              placeholder="john@gmail.com"
              value={email}
              onChange={setEmail}
            />

            <Field
              label="Password"
              placeholder="Temporary password"
              value={password}
              onChange={setPassword}
              type="password"
            />

            <RoleSelect value={role} onChange={setRole} />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={saveUser}
                disabled={saving}
                className="h-11 flex-1 rounded-xl bg-violet-700 text-sm font-semibold text-white"
              >
                {saving ? "Saving..." : "Save User"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* VIEW MODAL */}
      {viewUser && (
        <ModalWrapper onClose={() => setViewUser(null)}>
          <ModalHeader
            title="User Details"
            subtitle="View account information."
            onClose={() => setViewUser(null)}
          />

          <div className="space-y-4">
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={viewUser.email}
            />

            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Joined"
              value={new Date(viewUser.created_at).toLocaleDateString()}
            />

            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label="Role"
              value={viewUser.role}
            />
          </div>
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <ModalWrapper onClose={() => setEditUser(null)}>
          <ModalHeader
            title="Edit User"
            subtitle="Update account information."
            onClose={() => setEditUser(null)}
          />

          <div className="space-y-4">
            <Field
              label="Full Name"
              placeholder="Full name"
              value={editName}
              onChange={setEditName}
            />

            <Field
              label="Email"
              placeholder="Email"
              value={editEmail}
              onChange={setEditEmail}
            />

            <RoleSelect value={editRole} onChange={setEditRole} />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditUser(null)}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={updateUser}
                disabled={updating}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 text-sm font-semibold text-white"
              >
                <Save className="h-4 w-4" />
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* DISABLE MODAL */}
      {disableUser && (
        <ModalWrapper onClose={() => setDisableUser(null)}>
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Disable Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Disable {disableUser.full_name}'s account?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDisableUser(null)}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={disableAccount}
                disabled={disabling}
                className="h-11 flex-1 rounded-xl bg-rose-600 text-sm font-semibold text-white"
              >
                {disabling ? "Disabling..." : "Disable"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </section>
  )
}

/* COMPONENTS */

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role]

  if (!m) return null

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: m.badgeBg,
        color: m.badgeText,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: m.dotColor,
        }}
      />

      {m.label}
    </span>
  )
}

function ActionBtn({
  icon,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
    </button>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
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
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-500"
      />
    </div>
  )
}

function RoleSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Role
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-500"
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="parent">Parent</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  )
}

function ModalWrapper({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: string
  onClose: () => void
}) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {subtitle}
        </p>
      </div>

      <button
        onClick={onClose}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}