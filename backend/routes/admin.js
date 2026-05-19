import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sql } from "../database/db-neon.js"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "rameshwar_autotech_secret_key_2024"

// Create admin user (for initial setup)
router.post("/create-admin", async (req, res) => {
  try {
    const { username, password, email } = req.body

    if (!username || !password || !email) {
      return res.status(400).json({
        error: "Username, password, and email are required",
      })
    }

    const adminCountRows = await sql.query("SELECT COUNT(*) as count FROM admin_users")
    const adminCount = Number(adminCountRows[0]?.count ?? 0)

    if (adminCount > 0) {
      return res.status(403).json({
        error: "Admin user already exists",
        message: "Only one admin can be created. Use login instead.",
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const result = await sql.query(
      `INSERT INTO admin_users (username, password_hash, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [username, passwordHash, email],
    )

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      adminId: result[0]?.id,
      username,
      email,
    })
  } catch (error) {
    console.error("Admin creation error:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  }
})

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    const users = await sql.query(
      "SELECT * FROM admin_users WHERE username = $1 AND is_active = TRUE",
      [username],
    )
    const user = users[0]

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    await sql.query("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed", details: error.message })
  }
})

// Check admin status
router.get("/status", async (req, res) => {
  try {
    const result = await sql.query("SELECT COUNT(*) as count FROM admin_users")
    const count = Number(result[0]?.count ?? 0)
    res.json({
      hasAdmin: count > 0,
      adminCount: count,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Database error" })
  }
})

// Dashboard stats
router.get("/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const contactStatsRows = await sql.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_inquiries,
        SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) as today_inquiries
      FROM contact_inquiries`,
    )
    const productStatsRows = await sql.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN type = 'battery' THEN 1 ELSE 0 END) as batteries,
        SUM(CASE WHEN type = 'inverter' THEN 1 ELSE 0 END) as inverters,
        SUM(CASE WHEN is_featured = TRUE THEN 1 ELSE 0 END) as featured
      FROM products WHERE is_active = TRUE`,
    )
    const testimonialStatsRows = await sql.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_approved = TRUE THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN is_approved = FALSE THEN 1 ELSE 0 END) as pending
      FROM testimonials WHERE is_active = TRUE`,
    )

    res.json({
      stats: {
        contacts: contactStatsRows[0] || {},
        products: productStatsRows[0] || {},
        testimonials: testimonialStatsRows[0] || {},
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).json({ error: "Failed to fetch stats" })
  }
})

// Middleware to authenticate JWT token and check revocation
async function authenticateToken(req, res, next) {
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

// Logout endpoint - revoke the token so it cannot be used again
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    let token = authHeader && authHeader.split(" ")[1]

    if (!token && req.body && req.body.token) {
      token = req.body.token
    }

    if (!token) {
      return res.status(400).json({ error: "Access token required for logout" })
    }

    const decoded = jwt.decode(token)
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null

    await sql.query(
      `INSERT INTO revoked_tokens (token, expires_at)
       VALUES ($1, $2)
       ON CONFLICT (token) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [token, expiresAt],
    )

    res.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Failed to revoke token:", error)
    res.status(500).json({ error: "Failed to logout" })
  }
})

export default router
