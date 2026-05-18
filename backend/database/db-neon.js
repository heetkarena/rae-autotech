import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Connect using your Neon Connection String from the dashboard
// Format: postgresql://user:password@endpoint.neon.tech/neondb
const sql = neon(process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) throw new Error('Environment variable DATABASE_URL is not set');
// console.log(process.env.DATABASE_URL)
export const initializeDatabase = async () => {
  try {
    console.log("🚀 Starting Postgres Migration...");

    // 1. Contact Inquiries Table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Products Table
    // Note: BOOLEAN in Postgres is TRUE/FALSE, not 0/1
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('battery', 'inverter')),
        brand TEXT NOT NULL,
        price DECIMAL(10,2),
        image_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Testimonials Table
    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        text TEXT NOT NULL,
        image_url TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. Admin Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `;

    console.log("✅ Tables created successfully.");
    
    // Insert Sample Data
    await insertSampleData();

  } catch (error) {
    console.error("❌ Migration Error:", error);
  }
};

const insertSampleData = async () => {
  // Sample Products
  const sampleProducts = [
    ["Exide Powersafe", "High-performance car battery...", "Automotive", "battery", "Exide", 4500.0, true],
    ["Amaron Pro", "Maintenance-free battery...", "Automotive", "battery", "Amaron", 5200.0, true],
    ["Luminous Eco Volt", "Energy-efficient home inverter...", "Home", "inverter", "Luminous", 8500.0, true],
    ["Livfast Solar Hybrid", "Solar-compatible inverter...", "Solar", "inverter", "Livfast", 12000.0, true]
  ];

  for (const p of sampleProducts) {
    await sql`
      INSERT INTO products (name, description, category, type, brand, price, is_featured)
      VALUES (${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]})
      ON CONFLICT DO NOTHING
    `;
  }

  // Sample Testimonials
  const sampleTestimonials = [
    ["Haresh Solanki", "Homeowner", 5, "I installed an Amaron battery...", true],
    ["Heet Karena", "Business Owner", 5, "As a small business owner...", true]
  ];

  for (const t of sampleTestimonials) {
    await sql`
      INSERT INTO testimonials (name, position, rating, text, is_approved)
      VALUES (${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ${t[4]})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log("✅ Sample data synced.");
};