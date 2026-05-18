// const express = require("express")
// const { db } = require("../database/init")
// const { validateTestimonial } = require("../utils/helpers")

import express from "express"
import { db } from  "../database/init.js"
import { validateTestimonial } from "../utils/helpers.js"

const router = express.Router()

// Get approved testimonials
router.get("/", (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 10

  db.all(
    `
    SELECT * FROM testimonials 
    WHERE is_approved = 1 AND is_active = 1 
    ORDER BY created_at DESC 
    LIMIT ?
  `,
    [limit],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch testimonials" })
      }

      res.json({ testimonials: rows })
    },
  )
})

// Submit new testimonial
router.post("/submit", (req, res) => {
  const { name, position, rating, text, image_url } = req.body

  // Validate input
  const validation = validateTestimonial(req.body)
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors,
    })
  }

  db.run(
    `
    INSERT INTO testimonials (name, position, rating, text, image_url)
    VALUES (?, ?, ?, ?, ?)
  `,
    [name, position || "", rating, text, image_url || null],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to submit testimonial" })
      }

      res.status(201).json({
        success: true,
        message: "Thank you for your testimonial! It will be reviewed and published soon.",
        testimonialId: this.lastID,
      })
    },
  )
})

// Get all testimonials (admin only)
router.get("/admin/all", (req, res) => {
  const status = req.query.status || "all" // 'pending', 'approved', 'all'
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  let query = "SELECT * FROM testimonials WHERE is_active = 1"
  const params = []

  if (status === "pending") {
    query += " AND is_approved = 0"
  } else if (status === "approved") {
    query += " AND is_approved = 1"
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch testimonials" })
    }

    res.json({
      testimonials: rows,
      pagination: {
        page,
        limit,
        hasMore: rows.length === limit,
      },
    })
  })
})

// Approve/reject testimonial (admin only)
router.patch("/:id/approve", (req, res) => {
  const { id } = req.params
  const { approved } = req.body // true or false

  db.run(
    `
    UPDATE testimonials 
    SET is_approved = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,
    [approved ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to update testimonial" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Testimonial not found" })
      }

      res.json({
        success: true,
        message: `Testimonial ${approved ? "approved" : "rejected"} successfully`,
      })
    },
  )
})

// Delete testimonial (admin only)
router.delete("/:id", (req, res) => {
  const { id } = req.params

  db.run(
    `
    UPDATE testimonials 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,
    [id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to delete testimonial" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Testimonial not found" })
      }

      res.json({ success: true, message: "Testimonial deleted successfully" })
    },
  )
})

export default router
