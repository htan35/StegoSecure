import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`SELECT id, imageurl, title, timestamp FROM gallery ORDER BY timestamp DESC`
    return Response.json(result || [])
  } catch (error) {
    console.error("Get gallery error:", error)
    return Response.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUrl, title, timestamp } = body

    let timestampValue: number
    if (typeof timestamp === "string") {
      timestampValue = new Date(timestamp).getTime()
    } else if (typeof timestamp === "number") {
      timestampValue = timestamp
    } else {
      timestampValue = Date.now()
    }

    const result = await sql`
      INSERT INTO gallery (imageurl, title, timestamp)
      VALUES (${imageUrl}, ${title || "Artifact"}, ${timestampValue})
      RETURNING *
    `

    return Response.json(result[0])
  } catch (error) {
    console.error("Add to gallery error:", error)
    return Response.json({ error: "Add to gallery failed" }, { status: 500 })
  }
}
