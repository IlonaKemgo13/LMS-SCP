import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
]

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(req: Request) {
  const auth = await requireAuth(req, "teacher")
  if (!auth.ok) return auth.response

  const formData = await req.formData()
  const file      = formData.get("file") as File | null
  const title     = formData.get("title") as string | null
  const course_id = formData.get("course_id") as string | null

  if (!file || !title || !course_id) {
    return NextResponse.json(
      { error: "file, title and course_id are required" },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use PDF, Word, PowerPoint, Excel, or image files." },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 50 MB limit." }, { status: 400 })
  }

  const { data: course } = await auth.supabase
    .from("courses")
    .select("id")
    .eq("id", course_id)
    .eq("teacher_id", auth.userId)
    .single()

  if (!course) {
    return NextResponse.json(
      { error: "You are not assigned to this course" },
      { status: 403 }
    )
  }

  const ext = file.name.split(".").pop()
  const path = `materials/${course_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await auth.supabase.storage
    .from("materials")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const { data: { publicUrl } } = auth.supabase.storage
    .from("materials")
    .getPublicUrl(path)

  const { error: dbError } = await auth.supabase.from("materials").insert({
    title,
    course_id,
    file_url: publicUrl,
    teacher_id: auth.userId,
  })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, url: publicUrl })
}
