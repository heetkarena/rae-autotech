// const express = require("express")
// const bcrypt = require("bcrypt")
// const jwt = require("jsonwebtoken")
// const { db } = require("../database/init")

import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { db } from "../database/init.js"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "rameshwar_autotech_secret_key_2024"
// console.log(JWT_SECRET)

// Create admin user (for initial setup)
router.post("/create-admin", async (req, res) => {
  try {
    const { username, password, email } = req.body

    console.log("Received admin creation request:", { username, email })

    if (!username || !password || !email) {
      return res.status(400).json({
        error: "Username, password, and email are required",
        received: { username: !!username, password: !!password, email: !!email },
      })
    }

    // Check if any admin already exists
    db.get("SELECT COUNT(*) as count FROM admin_users", [], async (err, result) => {
      if (err) {
        console.error("Database error checking admin count:", err)
        return res.status(500).json({ error: "Database error", details: err.message })
      }

      console.log("Current admin count:", result.count)

      // Allow creating admin if no admins exist
      if (result.count > 0) {
        return res.status(403).json({
          error: "Admin user already exists",
          message: "Only one admin can be created. Use login instead.",
        })
      }

      try {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        console.log("Creating admin user...")

        db.run(
          `INSERT INTO admin_users (username, password_hash, email)
           VALUES (?, ?, ?)`,
          [username, passwordHash, email],
          function (err) {
            if (err) {
              console.error("Database error creating admin:", err)
              if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({
                  error: "Username or email already exists",
                  details: err.message,
                })
              }
              return res.status(500).json({
                error: "Failed to create admin",
                details: err.message,
              })
            }

            console.log("Admin user created successfully with ID:", this.lastID)

            res.status(201).json({
              success: true,
              message: "Admin user created successfully",
              adminId: this.lastID,
              username: username,
              email: email,
            })
          },
        )
      } catch (hashError) {
        console.error("Password hashing error:", hashError)
        res.status(500).json({
          error: "Failed to hash password",
          details: hashError.message,
        })
      }
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
router.post("/login", (req, res) => {
  const { username, password } = req.body

  console.log("Login attempt for username:", username)

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" })
  }

  db.get(`SELECT * FROM admin_users WHERE username = ? AND is_active = 1`, [username], async (err, user) => {
    if (err) {
      console.error("Database error during login:", err)
      return res.status(500).json({ error: "Login failed", details: err.message })
    }

    if (!user) {
      console.log("User not found:", username)
      return res.status(401).json({ error: "Invalid credentials" })
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        console.log("Invalid password for user:", username)
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Update last login
      db.run(`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [user.id])

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      )

      console.log("Login successful for user:", username)

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
      console.error("Password comparison error:", error)
      res.status(500).json({ error: "Login failed", details: error.message })
    }
  })
})

// Check admin status
router.get("/status", (req, res) => {
  db.get("SELECT COUNT(*) as count FROM admin_users", [], (err, result) => {
    if (err) {
      console.error("Database error:", err)
      return res.status(500).json({ error: "Database error" })
    }

    res.json({
      hasAdmin: result.count > 0,
      adminCount: result.count,
    })
  })
})

// Dashboard stats
router.get("/dashboard/stats", authenticateToken, (req, res) => {
  const stats = {}

  // Get contact inquiries count
  db.get(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_inquiries,
      SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as today_inquiries
    FROM contact_inquiries`,
    [],
    (err, contactStats) => {
      if (err) {
        console.error("Database error:", err)
        return res.status(500).json({ error: "Failed to fetch stats" })
      }

      stats.contacts = contactStats

      // Get products count
      db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN type = 'battery' THEN 1 ELSE 0 END) as batteries,
          SUM(CASE WHEN type = 'inverter' THEN 1 ELSE 0 END) as inverters,
          SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured
        FROM products WHERE is_active = 1`,
        [],
        (err, productStats) => {
          if (err) {
            console.error("Database error:", err)
            return res.status(500).json({ error: "Failed to fetch stats" })
          }

          stats.products = productStats

          // Get testimonials count
          db.get(
            `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN is_approved = 0 THEN 1 ELSE 0 END) as pending
            FROM testimonials WHERE is_active = 1`,
            [],
            (err, testimonialStats) => {
              if (err) {
                console.error("Database error:", err)
                return res.status(500).json({ error: "Failed to fetch stats" })
              }

              stats.testimonials = testimonialStats
              res.json({ stats })
            },
          )
        },
      )
    },
  )
})

// Middleware to authenticate JWT token and check revocation
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  // Check if token has been revoked
  db.get(`SELECT token FROM revoked_tokens WHERE token = ?`, [token], (err, row) => {
    if (err) {
      console.error("Database error checking revoked tokens:", err)
      return res.status(500).json({ error: "Server error" })
    }

    if (row) {
      return res.status(403).json({ error: "Token has been revoked" })
    }

    // Verify token
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

// Logout endpoint - revoke the token so it cannot be used again
router.post("/logout", (req, res) => {
  const authHeader = req.headers["authorization"]
  let token = authHeader && authHeader.split(" ")[1]

  // Allow token to be passed in request body (useful for navigator.sendBeacon or keepalive requests)
  if (!token && req.body && req.body.token) {
    token = req.body.token
  }

  if (!token) {
    return res.status(400).json({ error: "Access token required for logout" })
  }

  // Decode token to get expiry and store so we can optionally cleanup expired revocations
  const decoded = jwt.decode(token)
  const expiresAt = decoded && decoded.exp ? decoded.exp * 1000 : null

  db.run(
    `INSERT OR REPLACE INTO revoked_tokens (token, expires_at) VALUES (?, ?)`,
    [token, expiresAt],
    function (err) {
      if (err) {
        console.error("Failed to revoke token:", err)
        return res.status(500).json({ error: "Failed to logout" })
      }

      res.json({ success: true, message: "Logged out successfully" })
    },
  )
})

export default router