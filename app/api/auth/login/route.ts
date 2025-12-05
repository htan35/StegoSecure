import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const result =
      await sql`SELECT id, username, role, isverified FROM users WHERE username = ${username} AND password = ${password}`

    console.log("[v0] Login query result:", result)

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials or not yet approved. Please register if you haven't already." },
        { status: 401 },
      )
    }

    const user = result[0]
    console.log("[v0] User found:", user, "isverified:", user.isverified)

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isverified: user.isverified,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
