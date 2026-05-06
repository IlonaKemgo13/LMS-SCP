"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Course = {
  id: string
  title: string
}

type Announcement = {
  id: string
  title: string
  content: string
  deadline: string | null
  created_at: string
  courses?: {
    title: string
  }
}

export default function TeacherAnnouncementsPage() {
  const supabase = createClient()

  const [courses, setCourses] = useState<Course[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCourse, setSelectedCourse] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [deadline, setDeadline] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // TEMPORARY teacher id
  const teacherId = "405b56ca-8e7a-41e7-96dd-417041305cdf"

  useEffect(() => {
    fetchCourses()
    fetchAnnouncements()
  }, [])

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", teacherId)

    if (!error && data) {
      setCourses(data)
    }
  }

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        content,
        deadline,
        created_at,
        courses (
          title
        )
      `)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAnnouncements(data as unknown as Announcement[])
    }

    setLoading(false)
  }

  const createAnnouncement = async () => {
    if (!selectedCourse || !title || !content) return

    const { error } = await supabase.from("announcements").insert({
      title,
      content,
      deadline: deadline || null,
      teacher_id: teacherId,
      course_id: selectedCourse,
    })

    if (!error) {
      setTitle("")
      setContent("")
      setDeadline("")
      setSelectedCourse("")
      fetchAnnouncements()
    }
  }

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [announcements, searchTerm])

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Teacher Workspace
        </p>

        <h1 className="mt-3 text-4xl font-bold">Course Announcements</h1>

        <p className="mt-3 max-w-2xl text-white/80">
          Publish announcements, reminders, deadlines, and updates for your
          assigned courses.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Announcement
            </h2>

            <p className="mt-1 text-gray-500">
              Share important updates with students and parents.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Course
              </label>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              >
                <option value="">Choose course</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Announcement Title
              </label>

              <input
                type="text"
                placeholder="e.g. Assignment Deadline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Deadline
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Announcement Message
              </label>

              <textarea
                rows={6}
                placeholder="Write announcement details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </div>

            <button
              onClick={createAnnouncement}
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Publish Announcement
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Announcements
              </h2>

              <p className="mt-1 text-gray-500">
                {filteredAnnouncements.length} announcement(s)
              </p>
            </div>

            <input
              type="text"
              placeholder="Search announcement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:w-72"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading announcements...</p>
            ) : filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
                No announcements found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement
}) {
  return (
    <div className="rounded-2xl border p-5 transition hover:border-indigo-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {announcement.title}
            </h3>

            {announcement.courses?.title && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {announcement.courses.title}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            {announcement.content}
          </p>

          {announcement.deadline && (
            <div className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
              Deadline:{" "}
              {new Date(announcement.deadline).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Posted {new Date(announcement.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}