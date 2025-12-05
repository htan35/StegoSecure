import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")

    if (!chatId) {
      return Response.json({ error: "chatId required" }, { status: 400 })
    }

    const result = await sql`
      SELECT id, chatid, text, sender, timestamp, type, imageurl, created_at 
      FROM private_messages 
      WHERE chatid = ${chatId} 
      ORDER BY timestamp ASC
    `

    return Response.json(result || [])
  } catch (error) {
    console.error("Get messages error:", error)
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chatId, text, sender, timestamp, type, imageUrl } = body

    const result = await sql`
      INSERT INTO private_messages (chatid, text, sender, timestamp, type, imageurl)
      VALUES (${chatId}, ${text || ""}, ${sender}, ${timestamp}, ${type || "text"}, ${imageUrl || null})
      RETURNING *
    `

    return Response.json(result[0])
  } catch (error) {
    console.error("Send message error:", error)
    return Response.json({ error: "Failed to send message" }, { status: 500 })
  }
}
