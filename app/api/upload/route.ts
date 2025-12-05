import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type || "image/png"
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log("[v0] Image uploaded, size:", buffer.length, "bytes")

    return Response.json({ url: dataUrl })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return Response.json({ error: "Upload failed" }, { status: 500 })
  }
}
