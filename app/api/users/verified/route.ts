import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Fetch all verified users from the users table
    const result = await sql.query(
      "SELECT id, username, role, isverified FROM users WHERE isverified = true ORDER BY username ASC",
    )
    return Response.json(result || [])
  } catch (error) {
    console.error("Get verified users error:", error)
    return Response.json({ error: "Failed to fetch verified users" }, { status: 500 })
  }
}
