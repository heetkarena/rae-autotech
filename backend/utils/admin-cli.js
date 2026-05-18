// Command Line Interface for Admin Management
// const { db } = require("./database/init")
// const readline = require("readline")

import { db } from "../database/init.js"
import readline from "readline"
import process from "process"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

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

function viewInquiries(status = null) {
  let query = "SELECT * FROM contact_inquiries"
  const params = []

  if (status) {
    query += " WHERE status = ?"
    params.push(status)
  }

  query += " ORDER BY created_at DESC"

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error:", err)
      return
    }

    console.log(`\n📋 Contact Inquiries ${status ? `(${status})` : ""}:`)
    console.log("=".repeat(50))

    if (rows.length === 0) {
      console.log("No inquiries found.")
      showMenu()
      promptUser()
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
    showMenu()
    promptUser()
  })
}

function updateInquiryStatus() {
  rl.question("Enter inquiry ID: ", (id) => {
    rl.question("Enter new status (new/in_progress/resolved/closed): ", (status) => {
      const validStatuses = ["new", "in_progress", "resolved", "closed"]

      if (!validStatuses.includes(status)) {
        console.log("❌ Invalid status. Please use: new, in_progress, resolved, or closed")
        showMenu()
        promptUser()
        return
      }

      db.run(
        "UPDATE contact_inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, id],
        function (err) {
          if (err) {
            console.error("❌ Error updating status:", err)
          } else if (this.changes === 0) {
            console.log("❌ Inquiry not found")
          } else {
            console.log(`✅ Inquiry #${id} status updated to: ${status}`)
          }

          showMenu()
          promptUser()
        },
      )
    })
  })
}

function searchInquiries() {
  rl.question("Enter search term (name, email, or message): ", (searchTerm) => {
    const query = `
      SELECT * FROM contact_inquiries 
      WHERE name LIKE ? OR email LIKE ? OR message LIKE ? OR subject LIKE ?
      ORDER BY created_at DESC
    `
    const searchPattern = `%${searchTerm}%`

    db.all(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
      if (err) {
        console.error("Error:", err)
        showMenu()
        promptUser()
        return
      }

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

      showMenu()
      promptUser()
    })
  })
}

function viewStatistics() {
  db.get(
    `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
      SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as today_count,
      SUM(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 ELSE 0 END) as week_count
    FROM contact_inquiries
  `,
    [],
    (err, stats) => {
      if (err) {
        console.error("Error:", err)
        showMenu()
        promptUser()
        return
      }

      console.log("\n📊 Inquiry Statistics:")
      console.log("=".repeat(30))
      console.log(`Total Inquiries: ${stats.total}`)
      console.log(`New: ${stats.new_count}`)
      console.log(`In Progress: ${stats.in_progress_count}`)
      console.log(`Resolved: ${stats.resolved_count}`)
      console.log(`Closed: ${stats.closed_count}`)
      console.log(`Today: ${stats.today_count}`)
      console.log(`This Week: ${stats.week_count}`)

      showMenu()
      promptUser()
    },
  )
}

function promptUser() {
  rl.question("\nSelect an option (1-6): ", (answer) => {
    switch (answer) {
      case "1":
        viewInquiries()
        break
      case "2":
        viewInquiries("new")
        break
      case "3":
        updateInquiryStatus()
        break
      case "4":
        searchInquiries()
        break
      case "5":
        viewStatistics()
        break
      case "6":
        console.log("👋 Goodbye!")
        rl.close()
        process.exit(0)
        break
      default:
        console.log("❌ Invalid option. Please select 1-6.")
        showMenu()
        promptUser()
    }
  })
}

// Start the CLI
console.log("🚀 Starting Admin CLI...")
showMenu()
promptUser()
