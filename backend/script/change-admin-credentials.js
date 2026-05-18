// Script to change admin credentials
// const bcrypt = require("bcrypt")
// const { db } = require("../database/init")
// const readline = require("readline")

import bcrypt from "bcrypt" 
import { db } from "../database/init.js"
import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function changeAdminCredentials() {
  console.log("🔐 Change Admin Credentials")
  console.log("==========================")

  // Get current admin
  db.get("SELECT * FROM admin_users WHERE is_active = 1", [], async (err, admin) => {
    if (err) {
      console.error("❌ Database error:", err)
      process.exit(1)
    }

    if (!admin) {
      console.log("❌ No admin user found. Please create an admin first.")
      process.exit(1)
    }

    console.log(`Current admin: ${admin.username} (${admin.email})`)
    console.log("")

    rl.question("Enter new username: ", (newUsername) => {
      rl.question("Enter new email: ", (newEmail) => {
        rl.question("Enter new password: ", async (newPassword) => {
          rl.question("Confirm new password: ", async (confirmPassword) => {
            if (newPassword !== confirmPassword) {
              console.log("❌ Passwords don't match!")
              rl.close()
              return
            }

            if (newPassword.length < 8) {
              console.log("❌ Password must be at least 8 characters long!")
              rl.close()
              return
            }

            try {
              const saltRounds = 10
              const passwordHash = await bcrypt.hash(newPassword, saltRounds)

              db.run(
                `UPDATE admin_users 
                 SET username = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [newUsername, newEmail, passwordHash, admin.id],
                (err) => {
                  if (err) {
                    console.error("❌ Error updating credentials:", err)
                  } else {
                    console.log("✅ Admin credentials updated successfully!")
                    console.log(`New Username: ${newUsername}`)
                    console.log(`New Email: ${newEmail}`)
                    console.log("🔒 Password updated securely")
                  }
                  rl.close()
                },
              )
            } catch (error) {
              console.error("❌ Error hashing password:", error)
              rl.close()
            }
          })
        })
      })
    })
  })
}

changeAdminCredentials()
