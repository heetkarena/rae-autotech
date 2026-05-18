import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 1. Properly define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Define the database directory and path
// This moves up one level from your 'routes' or 'config' folder into a 'database' folder
const dbDir = path.join(__dirname, "..", "database");
const dbPath = path.join(dbDir, "rameshwar_autotech.db");

// 3. CRITICAL: Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log("📁 Database directory created");
}

// 4. Create database connection
export const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
    console.error("Attempted Path:", dbPath);
  } else {
    console.log("✅ Connected to SQLite database at:", dbPath);
  }
});

// Initialize database tables
export const initializeDatabase = () => {
  // Contact inquiries table
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('battery', 'inverter')),
      brand TEXT NOT NULL,
      price DECIMAL(10,2),
      image_url TEXT,
      is_featured BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Testimonials table
  db.run(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      text TEXT NOT NULL,
      image_url TEXT,
      is_approved BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Admin users table (simple authentication)
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `)

  // Revoked tokens table to support logout and token revocation
  db.run(`
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      token TEXT PRIMARY KEY,
      expires_at INTEGER,
      revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Insert sample data
  insertSampleData()
}

const insertSampleData = () => {
  // Insert sample products
  const sampleProducts = [
    {
      name: "Exide Powersafe",
      description: "High-performance car battery with extended life and superior starting power",
      category: "Automotive",
      type: "battery",
      brand: "Exide",
      price: 4500.0,
      is_featured: 1,
    },
    {
      name: "Amaron Pro",
      description: "Maintenance-free battery with advanced calcium technology for longer life",
      category: "Automotive",
      type: "battery",
      brand: "Amaron",
      price: 5200.0,
      is_featured: 1,
    },
    {
      name: "Luminous Eco Volt",
      description: "Energy-efficient home inverter with rapid charging and pure sine wave output",
      category: "Home",
      type: "inverter",
      brand: "Luminous",
      price: 8500.0,
      is_featured: 1,
    },
    {
      name: "Livfast Solar Hybrid",
      description: "Solar-compatible inverter for sustainable power backup solutions",
      category: "Solar",
      type: "inverter",
      brand: "Livfast",
      price: 12000.0,
      is_featured: 1,
    },
  ]

  sampleProducts.forEach((product) => {
    db.run(
      `
      INSERT OR IGNORE INTO products (name, description, category, type, brand, price, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        product.name,
        product.description,
        product.category,
        product.type,
        product.brand,
        product.price,
        product.is_featured,
      ],
    )
  })

  // Insert sample testimonials
  const sampleTestimonials = [
    {
      name: "Haresh Solanki",
      position: "Homeowner",
      rating: 5,
      text: "I installed an Amaron battery and Luminous inverter from Rameshwar Electronics during power cuts in summer. Their team was professional, knowledgeable, and helped me choose the perfect solution for my home.",
      is_approved: 1,
    },
    {
      name: "Heet Karena",
      position: "Business Owner",
      rating: 5,
      text: "As a small business owner, reliable power is crucial. The team at Rameshwar provided excellent service when installing our backup power system. Their pricing was transparent and the quality is outstanding.",
      is_approved: 1,
    },
  ]

  sampleTestimonials.forEach((testimonial) => {
    db.run(
      `
      INSERT OR IGNORE INTO testimonials (name, position, rating, text, is_approved)
      VALUES (?, ?, ?, ?, ?)
    `,
      [testimonial.name, testimonial.position, testimonial.rating, testimonial.text, testimonial.is_approved],
    )
  })
}
