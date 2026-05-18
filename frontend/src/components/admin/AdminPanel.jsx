"use client"

import { useState, useEffect } from "react"
import "tailwindcss";
import AdminLogin from "./AdminLogin"
import AdminDashboard from "./AdminDashboard"

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in (token only, stored in sessionStorage)
  useEffect(() => {
    const savedToken = sessionStorage.getItem("adminToken")

    if (savedToken) {
      try {
        // derive user info from token payload (do not store user info in browser storage)
        const parsed = (() => {
          try {
            const base64Url = savedToken.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
            return JSON.parse(jsonPayload)
          } catch (e) { return null }
        })()

        setToken(savedToken)
        if (parsed) setUser({ id: parsed.userId, username: parsed.username, email: parsed.email })
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing token:", error)
        sessionStorage.removeItem("adminToken")
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (authToken, userData) => {
    // Persist only the token in sessionStorage so it is cleared when tab closes
    sessionStorage.setItem("adminToken", authToken)
    setToken(authToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      const tokenToSend = sessionStorage.getItem("adminToken") || token
      if (tokenToSend) {
        // Use keepalive so the browser can send this even when unloading
        try {
          await fetch(`${import.meta.env.VITE_BASE_URL}/admin/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenToSend}`,
            },
            body: JSON.stringify({}),
            keepalive: true,
          })
        } catch (e) {
          // ignore network errors on logout
        }
      }
    } finally {
      // Clear any stored token and in-memory user data
      sessionStorage.removeItem("adminToken")
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      // redirect to login page
      window.location.href = '/admin-login'
    }
  }

  // Ensure automatic logout when tab/window is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      const tokenToSend = sessionStorage.getItem("adminToken") || token
      if (tokenToSend) {
        try {
          // best-effort background request to revoke token on server
          fetch(`${import.meta.env.VITE_BASE_URL}/admin/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenToSend}`,
            },
            body: JSON.stringify({}),
            keepalive: true,
          })
        } catch (e) {
          // ignore
        }
      }
      // Remove token so reopening a closed tab won't automatically log back in
      sessionStorage.removeItem("adminToken")
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {isAuthenticated ? (
        <AdminDashboard token={token} user={user} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  )
}

export default AdminPanel
