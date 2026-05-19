import express from "express"
import { sql } from "../database/db-neon.js"
import { validateContactForm, sendNotificationEmail } from "../utils/helpers.js"

const router = express.Router()

// Submit contact form
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    const validation = validateContactForm({ name, email, phone, message })
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      })
    }

    const result = await sql.query(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, email, phone, subject || "", message],
    )

    const inquiryId = result[0]?.id ?? null

    sendNotificationEmail({
      name,
      email,
      phone,
      subject,
      message,
      inquiryId,
    })

    res.status(201).json({
      success: true,
      message: "Thank you for your inquiry! We will get back to you soon.",
      inquiryId,
    })
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all contact inquiries (admin only)
router.get("/inquiries", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit
    const status = req.query.status || "all"

    let query = "SELECT * FROM contact_inquiries"
    const params = []

    if (status !== "all") {
      query += ` WHERE status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const inquiries = await sql.query(query, params)

    let countQuery = "SELECT COUNT(*) as total FROM contact_inquiries"
    const countParams = []
    if (status !== "all") {
      countQuery += ` WHERE status = $${countParams.length + 1}`
      countParams.push(status)
    }

    const countRows = await sql.query(countQuery, countParams)
    const total = countRows[0]?.total ?? 0

    res.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch inquiries" })
  }
})

// Update inquiry status
router.patch("/inquiries/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ["new", "in_progress", "resolved", "closed"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const result = await sql.query(
      `UPDATE contact_inquiries
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({ success: true, message: "Status updated successfully" })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to update status" })
  }
})

export default router
