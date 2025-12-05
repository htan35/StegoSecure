import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const existingRequest = await sql`SELECT id FROM approval_requests WHERE username = ${username}`

    if (existingRequest.length > 0) {
      return NextResponse.json(
        { error: "Registration request already pending. Please wait for admin approval." },
        { status: 400 },
      )
    }

    const existingUser = await sql`SELECT id FROM users WHERE username = ${username}`

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already registered. Please login." }, { status: 400 })
    }

    const result =
      await sql`INSERT INTO approval_requests (username, password, status) VALUES (${username}, ${password}, 'pending') RETURNING id, username, status`

    console.log("[v0] Registration request created:", result[0])

    return NextResponse.json(
      {
        message: "Registration request submitted. Waiting for admin approval.",
        requestId: result[0].id,
        username: result[0].username,
        status: result[0].status,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
