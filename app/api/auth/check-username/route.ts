import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const result = await sql.query("SELECT id FROM users WHERE username = $1", [username])

    return NextResponse.json({
      exists: result.length > 0,
    })
  } catch (error) {
    console.error("Check username error:", error)
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
}
