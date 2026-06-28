import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const formData = await req.formData()
  const file     = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, GIF, and WebP images are allowed." }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image exceeds 5 MB limit." }, { status: 400 })
  }

  const ext  = file.name.split(".").pop()
  const path = `avatars/${auth.userId}.${ext}`

  const { error: uploadError } = await auth.supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const { data: { publicUrl } } = auth.supabase.storage.from("avatars").getPublicUrl(path)

  const { error: profileError } = await auth.supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", auth.userId)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, url: publicUrl })
}
