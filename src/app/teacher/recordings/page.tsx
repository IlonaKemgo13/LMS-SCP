"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Course = {
  id: string
  title: string
}

type Recording = {
  id: string
  title: string
  description: string | null
  file_url: string
  created_at: string
  courses?: {
    title: string
  }
}

export default function TeacherRecordingsPage() {
  const supabase = createClient()

  const [courses, setCourses] = useState<Course[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])

  const [selectedCourse, setSelectedCourse] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const teacherId = "405b56ca-8e7a-41e7-96dd-417041305cdf"

  useEffect(() => {
    fetchCourses()
    fetchRecordings()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", teacherId)

    setCourses(data || [])
  }

  const fetchRecordings = async () => {
    const { data } = await supabase
      .from("recordings")
      .select(`
        id,
        title,
        description,
        file_url,
        created_at,
        courses (
          title
        )
      `)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    setRecordings((data as unknown as Recording[]) || [])
  }

  const startRecording = async () => {
    if (!selectedCourse || !title) {
      alert("Please select a course and enter a lesson title first.")
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunksRef.current = []

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
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const saveRecording = async () => {
    if (!audioBlob || !selectedCourse || !title) return

    setLoading(true)

    const fileName = `${teacherId}/${selectedCourse}/${Date.now()}-${title}.webm`

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(fileName, audioBlob, {
        contentType: "audio/webm",
      })

    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from("recordings")
      .getPublicUrl(fileName)

    const { error: insertError } = await supabase.from("recordings").insert({
      title,
      description,
      file_url: publicUrlData.publicUrl,
      file_type: "audio",
      course_id: selectedCourse,
      teacher_id: teacherId,
    })

    if (insertError) {
      alert(insertError.message)
      setLoading(false)
      return
    }

    setTitle("")
    setDescription("")
    setSelectedCourse("")
    setAudioBlob(null)
    setAudioPreviewUrl("")
    fetchRecordings()
    setLoading(false)
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
          Teacher Workspace
        </p>

        <h1 className="mt-3 text-4xl font-bold">Audio Recordings</h1>

        <p className="mt-3 max-w-2xl text-white/80">
          Record audio lessons directly from your browser and share them with
          students and parents.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Record New Lesson
          </h2>

          <p className="mt-1 text-gray-500">
            Select a course, enter lesson details, then start recording.
          </p>

          <div className="mt-6 space-y-5">
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
                Lesson Title
              </label>

              <input
                type="text"
                placeholder="e.g. Introduction to React Components"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lesson Description
              </label>

              <textarea
                rows={5}
                placeholder="Briefly describe what this lesson covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Stop Recording
                </button>
              )}

              {audioBlob && (
                <button
                  onClick={saveRecording}
                  disabled={loading}
                  className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Recording"}
                </button>
              )}
            </div>

            {isRecording && (
              <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
                Recording in progress...
              </p>
            )}

            {audioPreviewUrl && (
              <div className="rounded-2xl border p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Preview
                </p>
                <audio controls className="w-full" src={audioPreviewUrl} />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Recordings
          </h2>

          <p className="mt-1 text-gray-500">
            {recordings.length} recording(s)
          </p>

          <div className="mt-6 space-y-4">
            {recordings.length > 0 ? (
              recordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
                No recordings uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function RecordingCard({ recording }: { recording: Recording }) {
  return (
    <div className="rounded-2xl border p-5 transition hover:border-indigo-300">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {recording.title}
        </h3>

        {recording.courses?.title && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            {recording.courses.title}
          </span>
        )}
      </div>

      {recording.description && (
        <p className="mb-4 text-sm text-gray-500">
          {recording.description}
        </p>
      )}

      <audio controls className="w-full" src={recording.file_url} />

      <p className="mt-4 text-xs text-gray-400">
        Uploaded {new Date(recording.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}