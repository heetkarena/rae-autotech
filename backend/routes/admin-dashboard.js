// const express = require("express")
// const { db } = require("../database/init")
// const jwt = require("jsonwebtoken")


import express from "express"
import { db } from "../database/init.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "rameshwar_autotech_secret_key_2024"

// Middleware to authenticate admin and check for revoked tokens
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  // Check revoked tokens table
  db.get(`SELECT token FROM revoked_tokens WHERE token = ?`, [token], (err, row) => {
    if (err) {
      console.error("Database error checking revoked tokens:", err)
      return res.status(500).json({ error: "Server error" })
    }

    if (row) {
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
  })
}

// Get dashboard overview
router.get("/overview", authenticateAdmin, (req, res) => {
  const stats = {}

  // Get inquiry statistics
  db.get(
    `
    SELECT 
      COUNT(*) as total_inquiries,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_inquiries,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as today_inquiries,
      SUM(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 ELSE 0 END) as week_inquiries
    FROM contact_inquiries
  `,
    [],
    (err, inquiryStats) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch statistics" })
      }

      stats.inquiries = inquiryStats

      // Get recent inquiries
      db.all(
        `
      SELECT id, name, email, subject, status, created_at 
      FROM contact_inquiries 
      ORDER BY created_at DESC 
      LIMIT 5
    `,
        [],
        (err, recentInquiries) => {
          if (err) {
            console.error("Database error:", err)
            return res.status(500).json({ error: "Failed to fetch recent inquiries" })
          }

          stats.recent_inquiries = recentInquiries
          res.json({ success: true, stats })
        },
      )
    },
  )
})

// Get all inquiries with filtering and pagination
router.get("/inquiries", authenticateAdmin, (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const status = req.query.status || "all"
  const search = req.query.search || ""

  let query = "SELECT * FROM contact_inquiries WHERE 1=1"
  const params = []

  // Filter by status
  if (status !== "all") {
    query += " AND status = ?"
    params.push(status)
  }

  // Search functionality
  if (search) {
    query += " AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)"
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm, searchTerm, searchTerm)
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  db.all(query, params, (err, inquiries) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch inquiries" })
    }

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM contact_inquiries WHERE 1=1"
    const countParams = []

    if (status !== "all") {
      countQuery += " AND status = ?"
      countParams.push(status)
    }

    if (search) {
      countQuery += " AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)"
      const searchTerm = `%${search}%`
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error("Count query error:", err)
        return res.status(500).json({ error: "Failed to get total count" })
      }

      res.json({
        success: true,
        inquiries,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
          hasNext: page < Math.ceil(countResult.total / limit),
          hasPrev: page > 1,
        },
      })
    })
  })
})

// Get single inquiry details
router.get("/inquiries/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params

  db.get("SELECT * FROM contact_inquiries WHERE id = ?", [id], (err, inquiry) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch inquiry" })
    }

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({ success: true, inquiry })
  })
})

// Update inquiry status
router.patch("/inquiries/:id/status", authenticateAdmin, (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ["new", "in_progress", "resolved", "closed"]
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" })
  }

  db.run(
    `
    UPDATE contact_inquiries 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,
    [status, id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to update status" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Inquiry not found" })
      }

      res.json({
        success: true,
        message: `Inquiry status updated to ${status}`,
        updated_id: id,
      })
    },
  )
})

// Add notes to inquiry
router.patch("/inquiries/:id/notes", authenticateAdmin, (req, res) => {
  const { id } = req.params
  const { notes } = req.body

  // First, let's add a notes column if it doesn't exist
  db.run(
    `
    ALTER TABLE contact_inquiries 
    ADD COLUMN notes TEXT DEFAULT ''
  `,
    (err) => {
      // Ignore error if column already exists

      db.run(
        `
      UPDATE contact_inquiries 
      SET notes = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
        [notes || "", id],
        function (err) {
          if (err) {
            console.error("Database error:", err)
            return res.status(500).json({ error: "Failed to update notes" })
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: "Inquiry not found" })
          }

          res.json({
            success: true,
            message: "Notes updated successfully",
            updated_id: id,
          })
        },
      )
    },
  )
})

// Delete inquiry (soft delete)
router.delete("/inquiries/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params

  db.run(
    `
    UPDATE contact_inquiries 
    SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,
    [id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to delete inquiry" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Inquiry not found" })
      }

      res.json({
        success: true,
        message: "Inquiry deleted successfully",
        deleted_id: id,
      })
    },
  )
})

// Delete inquiry permanently
router.delete("/inquiries/:id/delete", authenticateAdmin, (req, res) => {
  const { id } = req.params
  //  console.log("DELETE inquiry route hit. ID:", id);

  db.run(`DELETE FROM contact_inquiries WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to delete inquiry" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Inquiry not found" })
    }

    res.json({
      success: true,
      message: "Inquiry deleted permanently",
      deleted_id: id,
    })
  })
})

// Get products for admin
router.get("/products", authenticateAdmin, (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const type = req.query.type || "all"

  let query = "SELECT * FROM products WHERE is_active = 1"
  const params = []

  if (type !== "all") {
    query += " AND type = ?"
    params.push(type)
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  db.all(query, params, (err, products) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch products" })
    }

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM products WHERE is_active = 1"
    const countParams = []

    if (type !== "all") {
      countQuery += " AND type = ?"
      countParams.push(type)
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error("Count query error:", err)
        return res.status(500).json({ error: "Failed to get total count" })
      }

      res.json({
        success: true,
        products,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
        },
      })
    })
  })
})

// Toggle product featured status
router.patch("/products/:id/featured", authenticateAdmin, (req, res) => {
  const { id } = req.params
  const { featured } = req.body

  db.run(
    `UPDATE products SET is_featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [featured ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to update product" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" })
      }

      res.json({
        success: true,
        message: `Product ${featured ? "featured" : "unfeatured"} successfully`,
      })
    },
  )
})

// Get reports data
router.get("/reports", authenticateAdmin, (req, res) => {
  const reports = {}

  // Inquiries by month (last 6 months)
  db.all(
    `
    SELECT 
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as count,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
    FROM contact_inquiries 
    WHERE created_at >= date('now', '-6 months')
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month DESC
  `,
    [],
    (err, monthlyData) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch monthly data" })
      }

      reports.monthly_inquiries = monthlyData

      // Inquiries by status
      db.all(
        `
      SELECT status, COUNT(*) as count 
      FROM contact_inquiries 
      GROUP BY status
    `,
        [],
        (err, statusData) => {
          if (err) {
            console.error("Database error:", err)
            return res.status(500).json({ error: "Failed to fetch status data" })
          }

          reports.status_breakdown = statusData

          // Popular inquiry subjects
          db.all(
            `
        SELECT 
          CASE 
            WHEN subject LIKE '%battery%' THEN 'Battery Related'
            WHEN subject LIKE '%inverter%' THEN 'Inverter Related'
            WHEN subject LIKE '%price%' OR subject LIKE '%cost%' THEN 'Pricing'
            WHEN subject LIKE '%installation%' THEN 'Installation'
            ELSE 'General Inquiry'
          END as category,
          COUNT(*) as count
        FROM contact_inquiries 
        WHERE subject IS NOT NULL AND subject != ''
        GROUP BY category
        ORDER BY count DESC
      `,
            [],
            (err, categoryData) => {
              if (err) {
                console.error("Database error:", err)
                return res.status(500).json({ error: "Failed to fetch category data" })
              }

              reports.inquiry_categories = categoryData

              // Recent activity (last 30 days)
              db.all(
                `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as inquiries
          FROM contact_inquiries 
          WHERE created_at >= date('now', '-30 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `,
                [],
                (err, activityData) => {
                  if (err) {
                    console.error("Database error:", err)
                    return res.status(500).json({ error: "Failed to fetch activity data" })
                  }

                  reports.recent_activity = activityData
                  res.json({ success: true, reports })
                },
              )
            },
          )
        },
      )
    },
  )
})

export default router;
