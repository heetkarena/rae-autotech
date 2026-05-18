import express from "express"
import cors from "cors"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const USE_NEON = process.env.USE_NEON === "true"
const NODE_ENV = process.env.NODE_ENV || "development"
const __dirname = "./uploads"

console.log(`Starting server in ${NODE_ENV} mode`)
console.log(`Database: ${USE_NEON ? "Neon Postgres (Production)" : "SQLite (Development)"}`)

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (for uploaded images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Import and initialize database based on environment
let db, initializeDatabase

if (USE_NEON) {
  console.log("Connecting to Neon Postgres...")

  // DEBUG of DATABASE CONNECTION OF NEON

  // console.log(process.env.DATABASE_URL);
  // console.log(process.env.USE_NEON);

  const neonModule = await import("./database/db-neon.js")
  initializeDatabase = neonModule.initializeDatabase
} else {
  // console.log("💾 Using SQLite database locally...")
  // const sqliteModule = await import("./database/init.js")
  // db = sqliteModule.db
  // initializeDatabase = sqliteModule.initializeDatabase
}

// Initialize database
console.log("Initializing database tables...")
try {
  await initializeDatabase()
  console.log("Database initialized successfully")
} catch (error) {
  console.error("Database initialization error:", error)
  process.exit(1)
}

// Import routes
// const contactRoutes = require("./routes/contact")
// const productRoutes = require("./routes/products")
// const testimonialRoutes = require("./routes/testimonials")
// const adminRoutes = require("./routes/admin")
// const dashboardRoutes = require("./routes/admin-dashboard");

import contactRoutes from "./routes/contact.js"
import productRoutes from "./routes/products.js"
import testimonialRoutes from "./routes/testimonials.js"
import adminRoutes from "./routes/admin.js"
import dashboardRoutes from "./routes/admin-dashboard.js"

// Use routes
app.use("/api/contact", contactRoutes)
app.use("/api/products", productRoutes)
app.use("/api/testimonials", testimonialRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/admin/dashboard", dashboardRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Rameshwar Autotech API is running",
    database: USE_NEON ? "Neon Postgres" : "SQLite",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Debug route to check database (SQLite only)
app.get("/api/debug/tables", (req, res) => {
  if (USE_NEON) {
    return res.json({ 
      message: "Debug endpoint not available for Neon. Check Neon dashboard.",
      database: "Neon Postgres"
    })
  }

  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json({ tables })
  })
})

// Error handling middleware
// app.use((err, req, res) => {
//   console.error(err.stack)
//   res.status(500).json({
//     error: "Something went wrong!",
//     message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
//   })
// })

// 404 handler
// app.use("(.*)", (req, res) => {
//   res.status(404).json({ error: "Route not found" })
// })

app.listen(PORT, () => {
  console.log(`Rameshwar Autotech API server running on port ${PORT}`)
  console.log(`Health check: http://localhost:5000/api/health`)
  console.log(`Admin status: http://localhost:5000/api/admin/status`)
})

export default app
