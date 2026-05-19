import bcrypt from "bcrypt"
import { sql } from "../database/db-neon.js"
import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function changeAdminCredentials() {
  try {
    console.log("🔐 Change Admin Credentials")
    console.log("==========================")

    const admins = await sql.query("SELECT * FROM admin_users WHERE is_active = TRUE")
    const admin = admins[0]

    if (!admin) {
      console.log("❌ No admin user found. Please create an admin first.")
      process.exit(1)
    }

    console.log(`Current admin: ${admin.username} (${admin.email})`)
    console.log("")

    const newUsername = await question("Enter new username: ")
    const newEmail = await question("Enter new email: ")
    const newPassword = await question("Enter new password: ")
    const confirmPassword = await question("Confirm new password: ")

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

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)

    const result = await sql.query(
      `UPDATE admin_users
       SET username = $1, email = $2, password_hash = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newUsername, newEmail, passwordHash, admin.id],
      { fullResults: true },
    )

    if (result.rowCount === 0) {
      console.log("❌ Failed to update admin credentials.")
    } else {
      console.log("✅ Admin credentials updated successfully!")
      console.log(`New Username: ${newUsername}`)
      console.log(`New Email: ${newEmail}`)
      console.log("🔒 Password updated securely")
    }
  } catch (error) {
    console.error("❌ Error updating credentials:", error)
  } finally {
    rl.close()
  }
}

changeAdminCredentials()
