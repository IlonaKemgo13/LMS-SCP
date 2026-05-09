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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type User = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

/* ───────────────────────────────────────────── */

const ROLE_META: Record<
  string,
  {
    label: string
    barFrom: string
    barTo: string
    badgeBg: string
    badgeText: string
    badgeRing: string
    dotColor: string
  }
> = {
  admin: {
    label: "Admin",
    barFrom: "#f43f5e",
    barTo: "#fb7185",
    badgeBg: "#fff1f2",
    badgeText: "#be123c",
    badgeRing: "#fecdd3",
    dotColor: "#f43f5e",
  },
  teacher: {
    label: "Teacher",
    barFrom: "#7c3aed",
    barTo: "#a78bfa",
    badgeBg: "#f5f3ff",
    badgeText: "#6d28d9",
    badgeRing: "#ddd6fe",
    dotColor: "#7c3aed",
  },
  student: {
    label: "Student",
    barFrom: "#0891b2",
    barTo: "#22d3ee",
    badgeBg: "#f0fdfa",
    badgeText: "#0f766e",
    badgeRing: "#99f6e4",
    dotColor: "#0891b2",
  },
  parent: {
    label: "Parent",
    barFrom: "#f59e0b",
    barTo: "#fcd34d",
    badgeBg: "#fffbeb",
    badgeText: "#b45309",
    badgeRing: "#fde68a",
    dotColor: "#f59e0b",
  },
}

const AVATAR_COLORS = [
  { from: "#7c3aed", to: "#4f46e5" },
  { from: "#0891b2", to: "#0d9488" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#3b82f6", to: "#6366f1" },
  { from: "#10b981", to: "#0891b2" },
]

function getAvatar(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/* ───────────────────────────────────────────── */

export default function AdminUsersPage() {
  const supabase = createClient()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")

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

  function closeModal() {
    setFullName("")
    setEmail("")
    setPassword("")
    setRole("student")
    setShowModal(false)
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

    setSaving(false)
    closeModal()
  }

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const s = searchTerm.toLowerCase()

        return (
          (u.full_name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s)) &&
          (selectedRole === "all" || u.role === selectedRole)
        )
      }),
    [users, searchTerm, selectedRole]
  )

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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f2f6",
        padding: "28px 32px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* HERO */}

      <div
        style={{
          borderRadius: 20,
          background:
            "linear-gradient(135deg, #1a1145 0%, #2d1b6e 50%, #3b2391 100%)",
          padding: "36px 40px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(55,20,180,0.25)",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(196,181,253,0.8)",
            marginBottom: 8,
          }}
        >
          Admin Workspace
        </p>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
          }}
        >
          User Management
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(196,181,253,0.7)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          Manage admins, teachers, students, and parents registered in the LMS
          platform.
        </p>
      </div>

      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {(["admin", "teacher", "student", "parent"] as const).map((key) => {
          const m = ROLE_META[key]
          const active = selectedRole === key

          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setSelectedRole(active ? "all" : key)
              }
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px",
                border: active
                  ? "2px solid #7c3aed"
                  : "2px solid transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  height: 5,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${m.barFrom}, ${m.barTo})`,
                  marginBottom: 14,
                }}
              />

              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  marginBottom: 8,
                }}
              >
                {m.label}s
              </p>

              <p
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {counts[key]}
              </p>
            </button>
          )
        })}
      </div>

      {/* TABLE CARD */}

      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}
      >
        {/* TOOLBAR */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Platform Users
            </h2>

            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                marginTop: 4,
              }}
            >
              {loading
                ? "Loading..."
                : `${filteredUsers.length} user(s) found`}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {/* SEARCH */}

            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 15,
                  height: 15,
                  color: "#94a3b8",
                }}
              />

              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: 40,
                  width: 220,
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                  paddingLeft: 36,
                  paddingRight: 12,
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* ROLE FILTER */}

            <div style={{ position: "relative" }}>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                  padding: "0 32px 0 12px",
                  fontSize: 13,
                  appearance: "none",
                  outline: "none",
                }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>

              <ChevronDown
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: "#94a3b8",
                }}
              />
            </div>

            {/* ADD BUTTON */}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{
                height: 40,
                borderRadius: 12,
                border: "none",
                background:
                  "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                padding: "0 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add User
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {["USER", "EMAIL", "ROLE", "JOINED", "ACTIONS"].map(
                  (h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        textAlign: i === 4 ? "right" : "left",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "#94a3b8",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "60px 20px",
                      textAlign: "center",
                    }}
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const av = getAvatar(user.full_name)

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      {/* USER */}

                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: `linear-gradient(135deg, ${av.from}, ${av.to})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {getInitials(user.full_name)}
                          </div>

                          <div>
                            <p
                              style={{
                                fontWeight: 600,
                                color: "#0f172a",
                                margin: 0,
                              }}
                            >
                              {user.full_name}
                            </p>

                            <p
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                margin: 0,
                              }}
                            >
                              LMS User
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td
                        style={{
                          padding: "14px 20px",
                          color: "#64748b",
                          fontSize: 13,
                        }}
                      >
                        {user.email}
                      </td>

                      {/* ROLE */}

                      <td style={{ padding: "14px 20px" }}>
                        <RoleBadge role={user.role} />
                      </td>

                      {/* DATE */}

                      <td
                        style={{
                          padding: "14px 20px",
                          color: "#94a3b8",
                          fontSize: 13,
                        }}
                      >
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>

                      {/* ACTIONS */}

                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 6,
                          }}
                        >
                          <ActionBtn
                            icon={<Eye />}
                            label="View"
                          />
                          <ActionBtn
                            icon={<Pencil />}
                            label="Edit"
                          />
                          <ActionBtn
                            icon={<ShieldOff />}
                            label="Disable"
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "60px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Users
                      style={{
                        width: 40,
                        height: 40,
                        color: "#e2e8f0",
                        marginBottom: 12,
                      }}
                    />

                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    >
                      No users found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15,23,42,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 5,
                background:
                  "linear-gradient(90deg, #7c3aed, #a78bfa, #6366f1)",
              }}
            />

            <div
              style={{
                padding: "24px 24px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Add New User
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    marginTop: 4,
                  }}
                >
                  Create a new LMS account.
                </p>
              </div>

              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X />
              </button>
            </div>

            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <Field
                label="Full Name"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={setFullName}
              />

              <Field
                label="Email Address"
                placeholder="e.g. user@gmail.com"
                value={email}
                onChange={setEmail}
                type="email"
              />

              <Field
                label="Temporary Password"
                placeholder="Enter temporary password"
                value={password}
                onChange={setPassword}
                type="password"
              />

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 12,
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: "0 14px",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "14px 24px 20px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  padding: "0 18px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={saveUser}
                disabled={saving}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#fff",
                  fontWeight: 600,
                  padding: "0 20px",
                  cursor: "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────────────────────────── */

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role]

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        background: m.badgeBg,
        color: m.badgeText,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: m.dotColor,
        }}
      />
      {m.label}
    </span>
  )
}

function ActionBtn({
  icon,
  label,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: 8,
        fontSize: 12,
        padding: "5px 10px",
        border: danger
          ? "1px solid #ffe4e6"
          : "1px solid #e2e8f0",
        background: danger ? "#fff1f2" : "#f8fafc",
        color: danger ? "#f43f5e" : "#475569",
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
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
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 12,
          border: "1.5px solid #e2e8f0",
          background: "#f8fafc",
          padding: "0 14px",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  )
}