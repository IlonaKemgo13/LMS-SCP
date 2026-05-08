"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Bell,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Mic,
  Users,
} from "lucide-react"

type Course = {
  id: string
  title: string
  code: string |null
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

type Material = {
  id: string
  title: string
  file_url: string
  created_at: string
}

type EnrolledStudent = {
  id: string
  created_at: string
  profiles: {
    id: string
    full_name: string
    email: string
  } | null
}

export default function TeacherCourseDetailsPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [students, setStudents] = useState<EnrolledStudent[]>([])
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
      materialsResponse,
      studentsResponse,
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

      supabase
        .from("materials")
        .select("id, title, file_url, created_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false }),

      supabase
        .from("enrollments")
        .select(`
          id,
          created_at,
          profiles!enrollments_student_id_fkey (
            id,
            full_name,
            email
          )
        `)
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

    if (materialsResponse.data) {
      setMaterials(materialsResponse.data as Material[])
    }

    if (studentsResponse.data) {
      setStudents(studentsResponse.data as unknown as EnrolledStudent[])
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
      {/* HERO */}
      <div
        className="rounded-3xl p-8 text-white shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, #1a1145 0%, #2d1b6e 50%, #3b2391 100%)",
        }}
      >
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
            {students.length} Student(s)
          </span>

          <span className="rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
            {materials.length} Material(s)
          </span>

          <span className="rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
            {recordings.length} Recording(s)
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-white/80">
          {course?.description || "No course description available."}
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Students"
          value={students.length}
          icon={<Users className="h-6 w-6" />}
          color="from-blue-500 to-cyan-500"
        />

        <StatCard
          title="Materials"
          value={materials.length}
          icon={<FileText className="h-6 w-6" />}
          color="from-purple-500 to-indigo-500"
        />

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

      {/* STUDENTS */}
      <SectionCard
        icon={<Users className="h-6 w-6" />}
        title="Enrolled Students"
        subtitle="Students currently enrolled in this course."
        iconBg="bg-blue-50"
        iconText="text-blue-600"
      >
        <div className="space-y-4">
          {students.length > 0 ? (
            students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))
          ) : (
            <EmptyState message="No students enrolled in this course." />
          )}
        </div>
      </SectionCard>

      {/* MATERIALS */}
      <SectionCard
        icon={<FileText className="h-6 w-6" />}
        title="Course Materials"
        subtitle="Notes, PDFs, slides, and uploaded resources."
        iconBg="bg-purple-50"
        iconText="text-purple-600"
      >
        <div className="space-y-4">
          {materials.length > 0 ? (
            materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))
          ) : (
            <EmptyState message="No materials uploaded for this course." />
          )}
        </div>
      </SectionCard>

      {/* ANNOUNCEMENTS */}
      <SectionCard
        icon={<Bell className="h-6 w-6" />}
        title="Course Announcements"
        subtitle="Updates and notices shared with students."
        iconBg="bg-emerald-50"
        iconText="text-emerald-600"
      >
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
      </SectionCard>

      {/* RECORDINGS */}
      <SectionCard
        icon={<Mic className="h-6 w-6" />}
        title="Lesson Recordings"
        subtitle="Audio recordings uploaded for this course."
        iconBg="bg-indigo-50"
        iconText="text-indigo-600"
      >
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
      </SectionCard>
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
      <div className={`h-2 bg-gradient-to-r ${color}`} />

      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="mt-3 text-4xl font-bold text-gray-900">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  icon,
  title,
  subtitle,
  iconBg,
  iconText,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  iconBg: string
  iconText: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} ${iconText}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>

          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  )
}

function StudentCard({
  student,
}: {
  student: EnrolledStudent
}) {
  const name = student.profiles?.full_name || "Unknown student"
  const email = student.profiles?.email || "No email"

  return (
    <div className="rounded-2xl border p-5 transition hover:border-blue-300">
      <p className="font-semibold text-gray-900">
        {name}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {email}
      </p>

      <p className="mt-3 text-xs text-gray-400">
        Enrolled{" "}
        {new Date(student.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}

function MaterialCard({
  material,
}: {
  material: Material
}) {
  return (
    <a
      href={material.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-2xl border p-5 transition hover:border-purple-300 hover:bg-purple-50/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
          <FileText className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold text-gray-900">
            {material.title}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Uploaded{" "}
            {new Date(material.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Download className="h-4 w-4 text-purple-600" />
    </a>
  )
}

function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement
}) {
  return (
    <div className="rounded-2xl border p-5 transition hover:border-emerald-300">
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
        {new Date(
          recording.created_at
        ).toLocaleDateString()}
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