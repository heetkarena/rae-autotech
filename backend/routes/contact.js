// const express = require("express")
// const { db } = require("../database/init")
// const { validateContactForm, sendNotificationEmail } = require("../utils/helpers")

import express from "express"
import { db } from "../database/init.js"
import { validateContactForm, sendNotificationEmail } from "../utils/helpers.js"

const router = express.Router()

// Submit contact form
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Validate input
    const validation = validateContactForm({ name, email, phone, message })
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      })
    }

    // Insert into database
    db.run(
      `INSERT INTO contact_inquiries (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, subject || "", message],
      function (err) {
        if (err) {
          console.error("Database error:", err)
          return res.status(500).json({ error: "Failed to save inquiry" })
        }

        // Send notification email (optional - implement based on needs)
        sendNotificationEmail({
          name,
          email,
          phone,
          subject,
          message,
          inquiryId: this.lastID,
        })

        res.status(201).json({
          success: true,
          message: "Thank you for your inquiry! We will get back to you soon.",
          inquiryId: this.lastID,
        })
      },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all contact inquiries (admin only)
router.get("/inquiries", (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const status = req.query.status || "all"

  let query = "SELECT * FROM contact_inquiries"
  const params = []

  if (status !== "all") {
    query += " WHERE status = ?"
    params.push(status)
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch inquiries" })
    }

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM contact_inquiries"
    const countParams = []

    if (status !== "all") {
      countQuery += " WHERE status = ?"
      countParams.push(status)
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error("Count query error:", err)
        return res.status(500).json({ error: "Failed to get total count" })
      }

      res.json({
        inquiries: rows,
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

// Update inquiry status
router.patch("/inquiries/:id/status", (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ["new", "in_progress", "resolved", "closed"]
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" })
  }

  db.run(
    `UPDATE contact_inquiries 
     SET status = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to update status" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Inquiry not found" })
      }

      res.json({ success: true, message: "Status updated successfully" })
    },
  )
})

export default router;