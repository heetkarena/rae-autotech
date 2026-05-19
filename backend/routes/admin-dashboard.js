import express from "express"
import jwt from "jsonwebtoken"
import { sql } from "../database/db-neon.js"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "rameshwar_autotech_secret_key_2024"

async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    const revoked = await sql.query("SELECT token FROM revoked_tokens WHERE token = $1", [token])
    if (revoked.length > 0) {
      return res.status(403).json({ error: "Token has been revoked" })
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" })
      }
      req.user = user
      req.token = token
      next()
    })
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Get dashboard overview
router.get("/overview", authenticateAdmin, async (req, res) => {
  try {
    const inquiryStatsRows = await sql.query(
      `SELECT
        COUNT(*) as total_inquiries,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_inquiries,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) as today_inquiries,
        SUM(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as week_inquiries
      FROM contact_inquiries`,
    )

    const recentInquiries = await sql.query(
      `SELECT id, name, email, subject, status, created_at
       FROM contact_inquiries
       ORDER BY created_at DESC
       LIMIT 5`,
    )

    res.json({
      success: true,
      stats: {
        inquiries: inquiryStatsRows[0] || {},
        recent_inquiries: recentInquiries,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch statistics" })
  }
})

// Get all inquiries with filtering and pagination
router.get("/inquiries", authenticateAdmin, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit
    const status = req.query.status || "all"
    const search = req.query.search || ""

    let query = "SELECT * FROM contact_inquiries WHERE 1=1"
    const params = []

    if (status !== "all") {
      query += ` AND status = $${params.length + 1}`
      params.push(status)
    }

    if (search) {
      const searchTerm = `%${search}%`
      query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 2} OR subject ILIKE $${params.length + 3} OR message ILIKE $${params.length + 4})`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const inquiries = await sql.query(query, params)

    let countQuery = "SELECT COUNT(*) as total FROM contact_inquiries WHERE 1=1"
    const countParams = []

    if (status !== "all") {
      countQuery += ` AND status = $${countParams.length + 1}`
      countParams.push(status)
    }

    if (search) {
      const searchTerm = `%${search}%`
      countQuery += ` AND (name ILIKE $${countParams.length + 1} OR email ILIKE $${countParams.length + 2} OR subject ILIKE $${countParams.length + 3} OR message ILIKE $${countParams.length + 4})`
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    const countRows = await sql.query(countQuery, countParams)
    const total = Number(countRows[0]?.total ?? 0)

    res.json({
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch inquiries" })
  }
})

// Get single inquiry details
router.get("/inquiries/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const rows = await sql.query("SELECT * FROM contact_inquiries WHERE id = $1", [id])
    const inquiry = rows[0]

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({ success: true, inquiry })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch inquiry" })
  }
})

// Update inquiry status
router.patch("/inquiries/:id/status", authenticateAdmin, async (req, res) => {
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

    res.json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      updated_id: id,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to update status" })
  }
})

// Add notes to inquiry
router.patch("/inquiries/:id/notes", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    const result = await sql.query(
      `UPDATE contact_inquiries
       SET notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [notes || "", id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({
      success: true,
      message: "Notes updated successfully",
      updated_id: id,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to update notes" })
  }
})

// Delete inquiry (soft delete)
router.delete("/inquiries/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const result = await sql.query(
      `UPDATE contact_inquiries
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({
      success: true,
      message: "Inquiry deleted successfully",
      deleted_id: id,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to delete inquiry" })
  }
})

// Delete inquiry permanently
router.delete("/inquiries/:id/delete", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const result = await sql.query("DELETE FROM contact_inquiries WHERE id = $1", [id], {
      fullResults: true,
    })

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({
      success: true,
      message: "Inquiry deleted permanently",
      deleted_id: id,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to delete inquiry" })
  }
})

// Get products for admin
router.get("/products", authenticateAdmin, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit
    const type = req.query.type || "all"

    let query = "SELECT * FROM products WHERE is_active = TRUE"
    const params = []

    if (type !== "all") {
      query += ` AND type = $${params.length + 1}`
      params.push(type)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const products = await sql.query(query, params)

    let countQuery = "SELECT COUNT(*) as total FROM products WHERE is_active = TRUE"
    const countParams = []
    if (type !== "all") {
      countQuery += ` AND type = $${countParams.length + 1}`
      countParams.push(type)
    }

    const countRows = await sql.query(countQuery, countParams)
    const total = Number(countRows[0]?.total ?? 0)

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Toggle product featured status
router.patch("/products/:id/featured", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { featured } = req.body

    const result = await sql.query(
      `UPDATE products SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [featured ? true : false, id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json({
      success: true,
      message: `Product ${featured ? "featured" : "unfeatured"} successfully`,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

// Get reports data
router.get("/reports", authenticateAdmin, async (req, res) => {
  try {
    const monthlyData = await sql.query(
      `SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
      FROM contact_inquiries
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC`,
    )

    const statusData = await sql.query(
      `SELECT status, COUNT(*) as count FROM contact_inquiries GROUP BY status`,
    )

    const categoryData = await sql.query(
      `SELECT
        CASE
          WHEN subject ILIKE '%battery%' THEN 'Battery Related'
          WHEN subject ILIKE '%inverter%' THEN 'Inverter Related'
          WHEN subject ILIKE '%price%' OR subject ILIKE '%cost%' THEN 'Pricing'
          WHEN subject ILIKE '%installation%' THEN 'Installation'
          ELSE 'General Inquiry'
        END as category,
        COUNT(*) as count
      FROM contact_inquiries
      WHERE subject IS NOT NULL AND subject != ''
      GROUP BY category
      ORDER BY count DESC`,
    )

    const activityData = await sql.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as inquiries
      FROM contact_inquiries
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC`,
    )

    res.json({
      success: true,
      reports: {
        monthly_inquiries: monthlyData,
        status_breakdown: statusData,
        inquiry_categories: categoryData,
        recent_activity: activityData,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch reports" })
  }
})

export default router
