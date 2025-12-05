import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result =
      await sql`SELECT id, username, status, created_at FROM approval_requests WHERE status = 'pending' ORDER BY created_at ASC`
    console.log("[v0] Pending approval requests:", result)
    return Response.json(result || [])
  } catch (error) {
    console.error("Get approval requests error:", error)
    return Response.json({ error: "Failed to fetch approval requests" }, { status: 500 })
  }
}
