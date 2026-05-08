"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileText, Pencil, Search, X } from "lucide-react"
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
  course_id: string | null
  teacher_id: string | null
  is_global: boolean | null
  target_role: string | null
  courses?: {
    title: string
  } | null
}

type Material = {
  id: string
  title: string
  file_url: string
  course_id: string
  teacher_id: string
  created_at: string
}

export default function TeacherAnnouncementsPage() {
  const supabase = createClient()

  const [teacherId, setTeacherId] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [materials, setMaterials] = useState<Material[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [deadline, setDeadline] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editDeadline, setEditDeadline] = useState("")

  useEffect(() => {
    fetchCurrentTeacher()
  }, [])

  useEffect(() => {
    if (teacherId) {
      fetchPageData()
    }
  }, [teacherId])

  async function fetchCurrentTeacher() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      setLoading(false)
      return
    }

    setTeacherId(user.id)
  }

  async function fetchPageData() {
    setLoading(true)

    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", teacherId)
      .order("title", { ascending: true })

    if (coursesError) {
      alert(coursesError.message)
      setLoading(false)
      return
    }

    const teacherCourses = coursesData || []
    const courseIds = teacherCourses.map((course) => course.id)

    setCourses(teacherCourses)

    let courseAnnouncements: Announcement[] = []

    if (courseIds.length > 0) {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          id,
          title,
          content,
          deadline,
          created_at,
          course_id,
          teacher_id,
          is_global,
          target_role,
          courses (
            title
          )
        `)
        .in("course_id", courseIds)
        .order("created_at", { ascending: false })

      if (!error && data) {
        courseAnnouncements = data as unknown as Announcement[]
      }
    }

    const { data: globalAnnouncementsData } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        content,
        deadline,
        created_at,
        course_id,
        teacher_id,
        is_global,
        target_role,
        courses (
          title
        )
      `)
      .eq("is_global", true)
      .in("target_role", ["all", "teacher"])
      .order("created_at", { ascending: false })

    const globalAnnouncements =
      (globalAnnouncementsData as unknown as Announcement[]) || []

    const mergedAnnouncements = [
      ...courseAnnouncements,
      ...globalAnnouncements,
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )

    setAnnouncements(mergedAnnouncements)

    if (courseIds.length > 0) {
      const { data: materialsData } = await supabase
        .from("materials")
        .select("id, title, file_url, course_id, teacher_id, created_at")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false })

      setMaterials((materialsData as Material[]) || [])
    }

    setLoading(false)
  }

  async function createAnnouncement() {
    if (!teacherId || !selectedCourse || !title || !content) {
      alert("Please select a course, enter a title, and write a message.")
      return
    }

    setSaving(true)

    const { error: announcementError } = await supabase
      .from("announcements")
      .insert({
        title,
        content,
        deadline: deadline || null,
        teacher_id: teacherId,
        course_id: selectedCourse,
        created_by: teacherId,
        is_global: false,
        target_role: "student",
      })

    if (announcementError) {
      alert(announcementError.message)
      setSaving(false)
      return
    }

    if (file) {
      const safeFileName = file.name.replace(/\s+/g, "-")
      const filePath = `${teacherId}/${selectedCourse}/${Date.now()}-${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file)

      if (uploadError) {
        alert(uploadError.message)
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath)

      const { error: materialError } = await supabase.from("materials").insert({
        title: file.name,
        file_url: publicUrlData.publicUrl,
        course_id: selectedCourse,
        teacher_id: teacherId,
      })

      if (materialError) {
        alert(materialError.message)
        setSaving(false)
        return
      }
    }

    setSelectedCourse("")
    setTitle("")
    setContent("")
    setDeadline("")
    setFile(null)

    await fetchPageData()
    setSaving(false)
  }

  function openAnnouncement(announcement: Announcement) {
    setSelectedAnnouncement(announcement)
    setEditMode(false)
    setEditTitle(announcement.title)
    setEditContent(announcement.content)
    setEditDeadline(announcement.deadline || "")
  }

  async function updateAnnouncement() {
    if (!selectedAnnouncement) return

    setSaving(true)

    const { error } = await supabase
      .from("announcements")
      .update({
        title: editTitle,
        content: editContent,
        deadline: editDeadline || null,
      })
      .eq("id", selectedAnnouncement.id)
      .eq("teacher_id", teacherId)

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    await fetchPageData()

    setSelectedAnnouncement(null)
    setEditMode(false)
    setSaving(false)
  }

  const filteredAnnouncements = useMemo(() => {
    const search = searchTerm.toLowerCase()

    return announcements.filter((announcement) => {
      return (
        announcement.title.toLowerCase().includes(search) ||
        announcement.content.toLowerCase().includes(search) ||
        announcement.courses?.title?.toLowerCase().includes(search)
      )
    })
  }, [announcements, searchTerm])

  const selectedAnnouncementMaterials = useMemo(() => {
    if (!selectedAnnouncement?.course_id) return []

    return materials.filter(
      (material) => material.course_id === selectedAnnouncement.course_id
    )
  }, [materials, selectedAnnouncement])

  return (
    <>
      <section className="w-full space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero Banner */}
        <div className="rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:rounded-3xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
            Teacher Workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
            Course Announcements
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:mt-3 sm:max-w-2xl sm:text-base">
            View admin notices, publish course announcements, and attach
            materials for your students.
          </p>
        </div>

        {/* Two-column grid — stacks on mobile */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create Announcement */}
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Create Announcement
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Share updates and optionally upload course material.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assignment Deadline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Announcement Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Write announcement details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl sm:rows-6"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Attach Material{" "}
                  <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
                {file && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                onClick={createAnnouncement}
                disabled={!teacherId || saving}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:rounded-2xl"
              >
                {saving ? "Publishing..." : "Publish Announcement"}
              </button>
            </div>
          </div>

          {/* Announcements List */}
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Announcements
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredAnnouncements.length} announcement(s)
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search announcement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading announcements...</p>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <button
                    key={announcement.id}
                    onClick={() => openAnnouncement(announcement)}
                    className="w-full rounded-xl border p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 sm:rounded-2xl sm:p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                        {announcement.title}
                      </h3>
                      {announcement.is_global ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                          Admin
                        </span>
                      ) : (
                        announcement.courses?.title && (
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                            {announcement.courses.title}
                          </span>
                        )
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {announcement.content}
                    </p>
                    <p className="mt-3 text-xs text-gray-400">
                      Posted{" "}
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500 sm:rounded-2xl">
                  No announcements found.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-99999 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Announcement Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage announcement information.
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {selectedAnnouncement.is_global && (
                <div className="rounded-xl bg-purple-50 p-4 text-sm font-medium text-purple-700 sm:rounded-2xl">
                  This is an admin/global announcement.
                </div>
              )}

              {!editMode ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Title
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                      {selectedAnnouncement.title}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Message
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {selectedAnnouncement.content}
                    </p>
                  </div>

                  {/* Info grid — 1 col on mobile, 2 on md+ */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <InfoBox
                      label="Course"
                      value={
                        selectedAnnouncement.courses?.title ||
                        "Global Announcement"
                      }
                    />
                    <InfoBox
                      label="Deadline"
                      value={
                        selectedAnnouncement.deadline
                          ? new Date(
                              selectedAnnouncement.deadline
                            ).toLocaleDateString()
                          : "No deadline"
                      }
                    />
                    <InfoBox
                      label="Posted"
                      value={new Date(
                        selectedAnnouncement.created_at
                      ).toLocaleDateString()}
                    />
                    <InfoBox
                      label="Type"
                      value={
                        selectedAnnouncement.is_global
                          ? "Admin Global"
                          : "Course Announcement"
                      }
                    />
                  </div>

                  {selectedAnnouncementMaterials.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Related Materials For This Course
                      </p>
                      <div className="space-y-3">
                        {selectedAnnouncementMaterials.map((material) => (
                          <a
                            key={material.id}
                            href={material.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-xl border p-4 transition hover:border-indigo-300 hover:bg-indigo-50 sm:rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {material.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Uploaded{" "}
                                  {new Date(
                                    material.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Download className="ml-3 h-4 w-4 shrink-0 text-indigo-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedAnnouncement.is_global &&
                    selectedAnnouncement.teacher_id === teacherId && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto sm:rounded-2xl"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Announcement
                      </button>
                    )}
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl sm:rows-6"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => setEditMode(false)}
                      className="w-full rounded-xl border px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto sm:rounded-2xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateAnnouncement}
                      disabled={saving}
                      className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto sm:rounded-2xl"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:rounded-2xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}