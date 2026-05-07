"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Bell,
  BookOpen,
  CalendarDays,
  Mic,
} from "lucide-react"

type Course = {
  id: string
  title: string
  code: string | null
  description: string | null
}

type Announcement = {
  id: string
  title: string
  content: string
  deadline: string | null
  created_at: string
}

type Recording = {
  id: string
  title: string
  description: string | null
  file_url: string
  created_at: string
}

export default function TeacherCourseDetailsPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  async function fetchCourseData() {
    setLoading(true)

    const [
      courseResponse,
      announcementsResponse,
      recordingsResponse,
    ] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, code, description")
        .eq("id", courseId)
        .single(),

      supabase
        .from("announcements")
        .select("id, title, content, deadline, created_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false }),

      supabase
        .from("recordings")
        .select("id, title, description, file_url, created_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false }),
    ])

    if (courseResponse.data) {
      setCourse(courseResponse.data)
    }

    if (announcementsResponse.data) {
      setAnnouncements(announcementsResponse.data)
    }

    if (recordingsResponse.data) {
      setRecordings(recordingsResponse.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading course...</p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Teacher Workspace
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          {course?.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {course?.code && (
            <span className="rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
              {course.code}
            </span>
          )}

          <span className="rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
            {announcements.length} Announcement(s)
          </span>

          <span className="rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
            {recordings.length} Recording(s)
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-white/80">
          {course?.description || "No course description available."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Announcements"
          value={announcements.length}
          icon={<Bell className="h-6 w-6" />}
          color="from-emerald-500 to-teal-500"
        />

        <StatCard
          title="Recordings"
          value={recordings.length}
          icon={<Mic className="h-6 w-6" />}
          color="from-indigo-500 to-purple-500"
        />
      </div>

      {/* Announcements */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Bell className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Course Announcements
            </h2>

            <p className="text-sm text-gray-500">
              Updates and notices shared with students.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))
          ) : (
            <EmptyState message="No announcements found for this course." />
          )}
        </div>
      </div>

      {/* Recordings */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Mic className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lesson Recordings
            </h2>

            <p className="text-sm text-gray-500">
              Audio recordings uploaded for this course.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {recordings.length > 0 ? (
            recordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
              />
            ))
          ) : (
            <EmptyState message="No recordings uploaded for this course." />
          )}
        </div>
      </div>
    </section>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className={`h-2 bg-linear-to-r ${color}`} />

      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="mt-3 text-4xl font-bold text-gray-900">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${color} text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement
}) {
  return (
    <div className="rounded-2xl border p-5 transition hover:border-emerald-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {announcement.title}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            {announcement.content}
          </p>

          {announcement.deadline && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
              <CalendarDays className="h-3 w-3" />
              Deadline:{" "}
              {new Date(
                announcement.deadline
              ).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Posted{" "}
        {new Date(
          announcement.created_at
        ).toLocaleDateString()}
      </p>
    </div>
  )
}

function RecordingCard({
  recording,
}: {
  recording: Recording
}) {
  return (
    <div className="rounded-2xl border p-5 transition hover:border-indigo-300">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <BookOpen className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {recording.title}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {recording.description || "No description available."}
          </p>
        </div>
      </div>

      <audio controls className="w-full" src={recording.file_url} />

      <p className="mt-4 text-xs text-gray-400">
        Uploaded{" "}
        {new Date(recording.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}

function EmptyState({
  message,
}: {
  message: string
}) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}