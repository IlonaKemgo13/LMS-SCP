"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Download, FileText } from "lucide-react"
import { toast } from "react-hot-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

type Course = {
  id: string
  title: string
}

type Recording = {
  id: string
  title: string
  description: string | null
  file_url: string
  course_id: string
  created_at: string
  courses?: { title: string } | null
}

type Material = {
  id: string
  title: string
  file_url: string
  course_id: string
  teacher_id: string
  created_at: string
}

export default function TeacherRecordingsPage() {
  const supabase   = createClient()
  const { profile } = useAuth()
  const teacherId  = profile?.id ?? ""

  const [courses,    setCourses]   = useState<Course[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [materials,  setMaterials]  = useState<Material[]>([])

  const [selectedCourse,    setSelectedCourse]    = useState("")
  const [title,             setTitle]             = useState("")
  const [description,       setDescription]       = useState("")
  const [materialTitle,     setMaterialTitle]     = useState("")
  const [materialFile,      setMaterialFile]      = useState<File | null>(null)

  const [isRecording,     setIsRecording]     = useState(false)
  const [audioBlob,       setAudioBlob]       = useState<Blob | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("")
  const [loading,         setLoading]         = useState(false)
  const [uploadingMaterial, setUploadingMaterial] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef   = useRef<Blob[]>([])

  useEffect(() => {
    if (teacherId) fetchCourses()
  }, [teacherId])

  useEffect(() => {
    if (teacherId && selectedCourse) {
      fetchRecordings(selectedCourse)
      fetchMaterials(selectedCourse)
    } else {
      setRecordings([])
      setMaterials([])
    }
  }, [teacherId, selectedCourse])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", teacherId)
      .order("title", { ascending: true })

    if (error) { toast.error("Failed to load courses."); return }
    setCourses(data || [])
  }

  async function fetchRecordings(courseId: string) {
    const { data, error } = await supabase
      .from("recordings")
      .select("id, title, description, file_url, course_id, created_at, courses(title)")
      .eq("teacher_id", teacherId)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) { toast.error("Failed to load recordings."); return }
    setRecordings((data as unknown as Recording[]) || [])
  }

  async function fetchMaterials(courseId: string) {
    const { data, error } = await supabase
      .from("materials")
      .select("id, title, file_url, course_id, teacher_id, created_at")
      .eq("teacher_id", teacherId)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) { toast.error("Failed to load materials."); return }
    setMaterials((data as Material[]) || [])
  }

  async function startRecording() {
    if (!selectedCourse || !title) {
      toast.error("Please select a course and enter a lesson title first.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current   = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioPreviewUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      toast.error("Microphone access was denied or is unavailable.")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  async function saveRecording() {
    if (!teacherId || !audioBlob || !selectedCourse || !title) return

    setLoading(true)
    const safeTitle = title.replace(/[^a-z0-9]/gi, "-").toLowerCase()
    const file      = new File([audioBlob], `${safeTitle}.webm`, { type: "audio/webm" })

    const formData = new FormData()
    formData.append("file",        file)
    formData.append("title",       title)
    formData.append("course_id",   selectedCourse)
    formData.append("description", description)

    const res = await fetch("/api/teacher/recordings", { method: "POST", body: formData })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(json.error || "Failed to save recording.")
      return
    }

    toast.success("Recording saved!")
    setTitle("")
    setDescription("")
    setAudioBlob(null)
    setAudioPreviewUrl("")
    await fetchRecordings(selectedCourse)
  }

  async function uploadMaterial() {
    if (!teacherId || !selectedCourse || !materialFile) {
      toast.error("Please select a course and choose a material file.")
      return
    }

    setUploadingMaterial(true)
    const formData = new FormData()
    formData.append("file",      materialFile)
    formData.append("title",     materialTitle || materialFile.name)
    formData.append("course_id", selectedCourse)

    const res = await fetch("/api/teacher/materials", { method: "POST", body: formData })
    const json = await res.json()
    setUploadingMaterial(false)

    if (!res.ok) {
      toast.error(json.error || "Failed to upload material.")
      return
    }

    toast.success("Material uploaded!")
    setMaterialTitle("")
    setMaterialFile(null)
    await fetchMaterials(selectedCourse)
  }

  const selectedCourseName = useMemo(
    () => courses.find((c) => c.id === selectedCourse)?.title || "",
    [courses, selectedCourse]
  )

  return (
    <section className="w-full space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:rounded-3xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 sm:text-sm">Teacher Workspace</p>
        <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">Audio Recordings</h1>
        <p className="mt-2 text-sm text-white/80 sm:mt-3 sm:max-w-2xl sm:text-base">
          Record audio lessons, upload notes, and view resources for the selected course.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Record New Lesson</h2>
            <p className="mt-1 text-sm text-gray-500">Select a course first. Recordings and materials update based on that course.</p>

            <div className="mt-5 space-y-4 sm:space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => { setSelectedCourse(e.target.value); setAudioBlob(null); setAudioPreviewUrl("") }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                >
                  <option value="">Choose course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to React Components"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lesson Description</label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe what this lesson covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {!isRecording ? (
                  <button onClick={startRecording} className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 sm:flex-none sm:rounded-2xl">
                    Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 sm:flex-none sm:rounded-2xl">
                    Stop Recording
                  </button>
                )}

                {audioBlob && (
                  <button
                    onClick={saveRecording}
                    disabled={loading || !teacherId}
                    className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:flex-none sm:rounded-2xl"
                  >
                    {loading ? "Saving..." : "Save Recording"}
                  </button>
                )}
              </div>

              {isRecording && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 sm:rounded-2xl">Recording in progress...</p>
              )}

              {audioPreviewUrl && (
                <div className="rounded-xl border p-4 sm:rounded-2xl">
                  <p className="mb-3 text-sm font-medium text-gray-700">Preview</p>
                  <audio controls className="w-full" src={audioPreviewUrl} />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Upload Additional Material</h2>
            <p className="mt-1 text-sm text-gray-500">Upload notes, PDFs, slides, or other learning resources for the selected course.</p>

            <div className="mt-5 space-y-4 sm:space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Material Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lecture Notes Week 1"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Material File</label>
                <input
                  type="file"
                  onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 sm:rounded-2xl"
                />
                {materialFile && <p className="mt-1.5 text-xs text-gray-500">Selected: {materialFile.name}</p>}
              </div>

              <button
                onClick={uploadMaterial}
                disabled={uploadingMaterial || !selectedCourse}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:rounded-2xl"
              >
                {uploadingMaterial ? "Uploading..." : "Upload Material"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Course Recordings</h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCourse ? `${recordings.length} recording(s) for ${selectedCourseName}` : "Choose a course to view recordings"}
            </p>
            <div className="mt-5 space-y-4">
              {!selectedCourse ? (
                <EmptyState message="Select a course to display its recordings." />
              ) : recordings.length > 0 ? (
                recordings.map((r) => <RecordingCard key={r.id} recording={r} />)
              ) : (
                <EmptyState message="No recordings found for this course." />
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Course Materials</h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCourse ? `${materials.length} material(s) for ${selectedCourseName}` : "Choose a course to view materials"}
            </p>
            <div className="mt-5 space-y-4">
              {!selectedCourse ? (
                <EmptyState message="Select a course to display its materials." />
              ) : materials.length > 0 ? (
                materials.map((m) => <MaterialCard key={m.id} material={m} />)
              ) : (
                <EmptyState message="No materials uploaded for this course." />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RecordingCard({ recording }: { recording: Recording }) {
  return (
    <div className="rounded-xl border p-4 transition hover:border-indigo-300 sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{recording.title}</h3>
        {recording.courses?.title && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">{recording.courses.title}</span>
        )}
      </div>
      {recording.description && <p className="mb-4 text-sm text-gray-500">{recording.description}</p>}
      <audio controls className="w-full" src={recording.file_url} />
      <p className="mt-3 text-xs text-gray-400">Uploaded {new Date(recording.created_at).toLocaleDateString()}</p>
    </div>
  )
}

function MaterialCard({ material }: { material: Material }) {
  return (
    <a
      href={material.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40 sm:rounded-2xl sm:p-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:h-11 sm:w-11 sm:rounded-2xl">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">{material.title}</h3>
          <p className="mt-0.5 text-xs text-gray-400">Uploaded {new Date(material.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <Download className="ml-3 h-4 w-4 shrink-0 text-indigo-600" />
    </a>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500 sm:rounded-2xl">{message}</div>
  )
}
