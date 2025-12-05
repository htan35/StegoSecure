import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest) {
  try {
    const { requestId, action } = await request.json()

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing requestId or action" }, { status: 400 })
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 })
    }

    const approvalResult = await sql`SELECT id, username, password, role FROM approval_requests WHERE id = ${requestId}`

    console.log("[v0] Approval result:", approvalResult)

    if (!approvalResult || approvalResult.length === 0) {
      return NextResponse.json({ error: "Approval request not found" }, { status: 404 })
    }

    const request_info = approvalResult[0]

    if (action === "approve") {
      await sql`INSERT INTO users (username, password, role, isverified) VALUES (${request_info.username}, ${request_info.password}, ${request_info.role || "user"}, true)`

      await sql`UPDATE approval_requests SET status = 'approved', updated_at = NOW() WHERE id = ${requestId}`

      return NextResponse.json({
        message: "User approved and added to system",
        username: request_info.username,
      })
    } else {
      await sql`UPDATE approval_requests SET status = 'rejected', updated_at = NOW() WHERE id = ${requestId}`

      return NextResponse.json({
        message: "Registration request rejected",
        username: request_info.username,
      })
    }
  } catch (error) {
    console.error("Error processing approval:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}
