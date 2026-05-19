import express from "express"
import { sql } from "../database/db-neon.js"
import { validateProduct } from "../utils/helpers.js"

const router = express.Router()

// Get all products
router.get("/", async (req, res) => {
  try {
    const type = req.query.type
    const category = req.query.category
    const featured = req.query.featured
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 20
    const offset = (page - 1) * limit

    let query = "SELECT * FROM products WHERE is_active = TRUE"
    const params = []

    if (type) {
      query += ` AND type = $${params.length + 1}`
      params.push(type)
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`
      params.push(category)
    }

    if (featured === "true") {
      query += " AND is_featured = TRUE"
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const products = await sql.query(query, params)

    res.json({
      products,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const products = await sql.query(
      "SELECT * FROM products WHERE id = $1 AND is_active = TRUE",
      [id],
    )

    const product = products[0]
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
})

// Create new product (admin only)
router.post("/", async (req, res) => {
  try {
    const { name, description, category, type, brand, price, image_url, is_featured } = req.body

    const validation = validateProduct(req.body)
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      })
    }

    const newPrice = price != null ? price : null
    const newImageUrl = image_url || null
    const featuredValue = is_featured === true || is_featured === "true"

    const result = await sql.query(
      `INSERT INTO products (name, description, category, type, brand, price, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [name, description, category, type, brand, newPrice, newImageUrl, featuredValue],
    )

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: result[0]?.id,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to create product" })
  }
})

// Update product (admin only)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, type, brand, price, image_url, is_featured } = req.body

    const validation = validateProduct(req.body)
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      })
    }

    const newPrice = price != null ? price : null
    const newImageUrl = image_url || null
    const featuredValue = is_featured === true || is_featured === "true"

    const result = await sql.query(
      `UPDATE products
       SET name = $1, description = $2, category = $3, type = $4, brand = $5,
           price = $6, image_url = $7, is_featured = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [name, description, category, type, brand, newPrice, newImageUrl, featuredValue, id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json({ success: true, message: "Product updated successfully" })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

// Delete product (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await sql.query(
      `UPDATE products
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

// Get product categories
router.get("/meta/categories", async (req, res) => {
  try {
    const type = req.query.type

    let query = "SELECT DISTINCT category FROM products WHERE is_active = TRUE"
    const params = []

    if (type) {
      query += ` AND type = $${params.length + 1}`
      params.push(type)
    }

    query += " ORDER BY category"

    const rows = await sql.query(query, params)
    const categories = rows.map((row) => row.category)

    res.json({ categories })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

export default router
