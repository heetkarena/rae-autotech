// const express = require("express")
// const { db } = require("../database/init")
// const { validateProduct } = require("../utils/helpers")

import express from "express"
import { db } from "../database/init.js"
import { validateProduct } from "../utils/helpers.js"

const router = express.Router()

// Get all products
router.get("/", (req, res) => {
  const type = req.query.type // 'battery' or 'inverter'
  const category = req.query.category
  const featured = req.query.featured
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit

  let query = "SELECT * FROM products WHERE is_active = 1"
  const params = []

  if (type) {
    query += " AND type = ?"
    params.push(type)
  }

  if (category) {
    query += " AND category = ?"
    params.push(category)
  }

  if (featured === "true") {
    query += " AND is_featured = 1"
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
  params.push(limit, offset)

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch products" })
    }

    res.json({
      products: rows,
      pagination: {
        page,
        limit,
        hasMore: rows.length === limit,
      },
    })
  })
})

// Get single product
router.get("/:id", (req, res) => {
  const { id } = req.params

  db.get("SELECT * FROM products WHERE id = ? AND is_active = 1", [id], (err, row) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch product" })
    }

    if (!row) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(row)
  })
})

// Create new product (admin only)
router.post("/", (req, res) => {
  const { name, description, category, type, brand, price, image_url, is_featured } = req.body

  // Validate input
  const validation = validateProduct(req.body)
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors,
    })
  }

  db.run(
    `
    INSERT INTO products (name, description, category, type, brand, price, image_url, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [name, description, category, type, brand, price || null, image_url || null, is_featured || 0],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to create product" })
      }

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        productId: this.lastID,
      })
    },
  )
})

// Update product (admin only)
router.put("/:id", (req, res) => {
  const { id } = req.params
  const { name, description, category, type, brand, price, image_url, is_featured } = req.body

  // Validate input
  const validation = validateProduct(req.body)
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors,
    })
  }

  db.run(
    `
    UPDATE products 
    SET name = ?, description = ?, category = ?, type = ?, brand = ?, 
        price = ?, image_url = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [name, description, category, type, brand, price || null, image_url || null, is_featured || 0, id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to update product" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" })
      }

      res.json({ success: true, message: "Product updated successfully" })
    },
  )
})

// Delete product (admin only)
router.delete("/:id", (req, res) => {
  const { id } = req.params

  // Soft delete - just mark as inactive
  db.run(
    `
    UPDATE products 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,
    [id],
    function (err) {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to delete product" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" })
      }

      res.json({ success: true, message: "Product deleted successfully" })
    },
  )
})

// Get product categories
router.get("/meta/categories", (req, res) => {
  const type = req.query.type

  let query = "SELECT DISTINCT category FROM products WHERE is_active = 1"
  const params = []

  if (type) {
    query += " AND type = ?"
    params.push(type)
  }

  query += " ORDER BY category"

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Failed to fetch categories" })
    }

    const categories = rows.map((row) => row.category)
    res.json({ categories })
  })
})

export default router