import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionName = searchParams.get("collectionName")
    const filter = JSON.parse(searchParams.get("filter") || "{}")
    const sort = JSON.parse(searchParams.get("sort") || "{}")

    if (!collectionName) {
      return NextResponse.json({ error: "Missing collectionName" }, { status: 400 })
    }

    let whereClause = ""
    let paramIndex = 1
    const params: any[] = []

    // Normalize filter keys to match database column names (lowercase)
    const normalizedFilter = Object.entries(filter).reduce(
      (acc, [key, val]) => {
        const normalizedKey = key === "_id" ? "id" : key.toLowerCase()
        acc[normalizedKey] = val
        return acc
      },
      {} as Record<string, any>,
    )

    if (Object.keys(normalizedFilter).length > 0) {
      const conditions = Object.entries(normalizedFilter).map(([key, val]) => {
        params.push(val)
        return `"${key}" = $${paramIndex++}`
      })
      whereClause = `WHERE ${conditions.join(" AND ")}`
    }

    // Build ORDER clause
    const orderClauses = Object.entries(sort)
      .map(([key, direction]) => {
        const normalizedKey = key === "_id" ? "id" : key.toLowerCase()
        return `"${normalizedKey}" ${direction === -1 ? "DESC" : "ASC"}`
      })
      .join(", ")
    const orderClause = orderClauses ? `ORDER BY ${orderClauses}` : ""

    const query = `SELECT * FROM "${collectionName}" ${whereClause} ${orderClause}`
    const result = await sql.query(query, params)

    return NextResponse.json(result)
  } catch (error) {
    console.error("DB GET Error:", error)
    return NextResponse.json({ error: "Database query failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collectionName, action, payload } = body

    if (!collectionName || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === "insert") {
      const normalizedPayload = Object.entries(payload).reduce(
        (acc, [key, val]) => {
          const normalizedKey = key === "_id" ? "id" : key.toLowerCase()
          acc[normalizedKey] = val
          return acc
        },
        {} as Record<string, any>,
      )

      const columns = Object.keys(normalizedPayload)
      const values = Object.values(normalizedPayload)
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")

      const query = `INSERT INTO "${collectionName}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders}) RETURNING *`
      const result = await sql.query(query, values)

      return NextResponse.json(result[0])
    }

    if (action === "update") {
      const { id, updateData } = payload

      const normalizedUpdateData = Object.entries(updateData).reduce(
        (acc, [key, val]) => {
          const normalizedKey = key === "_id" ? "id" : key.toLowerCase()
          acc[normalizedKey] = val
          return acc
        },
        {} as Record<string, any>,
      )

      const setClauses = Object.entries(normalizedUpdateData)
        .map(([key], i) => `"${key}" = $${i + 1}`)
        .join(", ")
      const values = Object.values(normalizedUpdateData)
      values.push(id)

      const query = `UPDATE "${collectionName}" SET ${setClauses} WHERE id = $${values.length} RETURNING *`
      const result = await sql.query(query, values)

      return NextResponse.json(result[0])
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("DB POST Error:", error)
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
  }
}
