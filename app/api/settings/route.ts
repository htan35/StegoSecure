import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql.query("SELECT * FROM settings LIMIT 1")

    if (!result || result.length === 0) {
      const insertResult = await sql.query("INSERT INTO settings (decodepassword) VALUES ($1) RETURNING *", [
        "admin_secret",
      ])
      return Response.json(insertResult[0])
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("Get settings error:", error)
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { decode_password } = body

    const result = await sql.query(
      "UPDATE settings SET decodepassword = $1 WHERE id = (SELECT id FROM settings LIMIT 1) RETURNING *",
      [decode_password],
    )

    return Response.json(result[0])
  } catch (error) {
    console.error("Update settings error:", error)
    return Response.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
