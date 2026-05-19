import { sql } from "../database/db-neon.js"
import readline from "readline"
import process from "process"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve))

function showMenu() {
  console.log("\n🔧 Rameshwar Autotech Admin CLI")
  console.log("================================")
  console.log("1. View all inquiries")
  console.log("2. View new inquiries")
  console.log("3. Update inquiry status")
  console.log("4. Search inquiries")
  console.log("5. View statistics")
  console.log("6. Exit")
  console.log("================================")
}

async function viewInquiries(status = null) {
  try {
    let query = "SELECT * FROM contact_inquiries"
    const params = []

    if (status) {
      query += ` WHERE status = $${params.length + 1}`
      params.push(status)
    }

    query += " ORDER BY created_at DESC"

    const rows = await sql.query(query, params)

    console.log(`\n📋 Contact Inquiries ${status ? `(${status})` : ""}:`)
    console.log("=".repeat(50))

    if (rows.length === 0) {
      console.log("No inquiries found.")
      return
    }

    rows.forEach((inquiry, index) => {
      console.log(`\n${index + 1}. ID: ${inquiry.id} | Status: ${inquiry.status.toUpperCase()}`)
      console.log(`   Name: ${inquiry.name}`)
      console.log(`   Email: ${inquiry.email}`)
      console.log(`   Phone: ${inquiry.phone}`)
      console.log(`   Subject: ${inquiry.subject || "No subject"}`)
      console.log(`   Date: ${new Date(inquiry.created_at).toLocaleString()}`)
      console.log(`   Message: ${inquiry.message.substring(0, 100)}${inquiry.message.length > 100 ? "..." : ""}`)
    })

    console.log(`\nTotal: ${rows.length} inquiries`)
  } catch (error) {
    console.error("Error:", error)
  }
}

async function updateInquiryStatus() {
  try {
    const id = await question("Enter inquiry ID: ")
    const status = await question("Enter new status (new/in_progress/resolved/closed): ")
    const validStatuses = ["new", "in_progress", "resolved", "closed"]

    if (!validStatuses.includes(status)) {
      console.log("❌ Invalid status. Please use: new, in_progress, resolved, or closed")
      return
    }

    const result = await sql.query(
      "UPDATE contact_inquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [status, id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      console.log("❌ Inquiry not found")
    } else {
      console.log(`✅ Inquiry #${id} status updated to: ${status}`)
    }
  } catch (error) {
    console.error("❌ Error updating status:", error)
  }
}

async function searchInquiries() {
  try {
    const searchTerm = await question("Enter search term (name, email, or message): ")
    const query = `
      SELECT * FROM contact_inquiries
      WHERE name ILIKE $1 OR email ILIKE $2 OR message ILIKE $3 OR subject ILIKE $4
      ORDER BY created_at DESC
    `
    const searchPattern = `%${searchTerm}%`

    const rows = await sql.query(query, [searchPattern, searchPattern, searchPattern, searchPattern])

    console.log(`\n🔍 Search Results for "${searchTerm}":`)
    console.log("=".repeat(50))

    if (rows.length === 0) {
      console.log("No matching inquiries found.")
    } else {
      rows.forEach((inquiry, index) => {
        console.log(`\n${index + 1}. ID: ${inquiry.id} | Status: ${inquiry.status.toUpperCase()}`)
        console.log(`   Name: ${inquiry.name}`)
        console.log(`   Email: ${inquiry.email}`)
        console.log(`   Subject: ${inquiry.subject || "No subject"}`)
        console.log(`   Date: ${new Date(inquiry.created_at).toLocaleString()}`)
      })
      console.log(`\nFound: ${rows.length} matching inquiries`)
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

async function viewStatistics() {
  try {
    const stats = await sql.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
        SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) as today_count,
        SUM(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as week_count
      FROM contact_inquiries`,
    )

    const summary = stats[0] || {}

    console.log("\n📊 Inquiry Statistics:")
    console.log("=".repeat(30))
    console.log(`Total Inquiries: ${summary.total || 0}`)
    console.log(`New: ${summary.new_count || 0}`)
    console.log(`In Progress: ${summary.in_progress_count || 0}`)
    console.log(`Resolved: ${summary.resolved_count || 0}`)
    console.log(`Closed: ${summary.closed_count || 0}`)
    console.log(`Today: ${summary.today_count || 0}`)
    console.log(`This Week: ${summary.week_count || 0}`)
  } catch (error) {
    console.error("Error:", error)
  }
}

async function promptUser() {
  const answer = await question("\nSelect an option (1-6): ")
  switch (answer) {
    case "1":
      await viewInquiries()
      break
    case "2":
      await viewInquiries("new")
      break
    case "3":
      await updateInquiryStatus()
      break
    case "4":
      await searchInquiries()
      break
    case "5":
      await viewStatistics()
      break
    case "6":
      console.log("👋 Goodbye!")
      rl.close()
      process.exit(0)
      return
    default:
      console.log("❌ Invalid option. Please select 1-6.")
  }

  showMenu()
  await promptUser()
}

// Start the CLI
console.log("🚀 Starting Admin CLI...")
showMenu()
promptUser()
