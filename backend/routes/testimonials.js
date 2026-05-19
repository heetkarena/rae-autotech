import express from "express"
import { sql } from "../database/db-neon.js"
import { validateTestimonial } from "../utils/helpers.js"

const router = express.Router()

// Get approved testimonials
router.get("/", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const testimonials = await sql.query(
      `SELECT * FROM testimonials
       WHERE is_approved = TRUE AND is_active = TRUE
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    )

    res.json({ testimonials })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch testimonials" })
  }
})

// Submit new testimonial
router.post("/submit", async (req, res) => {
  try {
    const { name, position, rating, text, image_url } = req.body

    const validation = validateTestimonial(req.body)
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      })
    }

    const result = await sql.query(
      `INSERT INTO testimonials (name, position, rating, text, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, position || "", rating, text, image_url || null],
    )

    res.status(201).json({
      success: true,
      message: "Thank you for your testimonial! It will be reviewed and published soon.",
      testimonialId: result[0]?.id,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to submit testimonial" })
  }
})

// Get all testimonials (admin only)
router.get("/admin/all", async (req, res) => {
  try {
    const status = req.query.status || "all"
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    let query = "SELECT * FROM testimonials WHERE is_active = TRUE"
    const params = []

    if (status === "pending") {
      query += " AND is_approved = FALSE"
    } else if (status === "approved") {
      query += " AND is_approved = TRUE"
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const testimonials = await sql.query(query, params)

    res.json({
      testimonials,
      pagination: {
        page,
        limit,
        hasMore: testimonials.length === limit,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch testimonials" })
  }
})

// Approve/reject testimonial (admin only)
router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params
    const { approved } = req.body

    const result = await sql.query(
      `UPDATE testimonials
       SET is_approved = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [approved ? true : false, id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Testimonial not found" })
    }

    res.json({
      success: true,
      message: `Testimonial ${approved ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to update testimonial" })
  }
})

// Delete testimonial (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await sql.query(
      `UPDATE testimonials
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Testimonial not found" })
    }

    res.json({ success: true, message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to delete testimonial" })
  }
})

export default router
