"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FaUsers,
  FaEnvelope,
  FaChartBar,
  FaSignOutAlt,
  FaSearch,
  FaEye,
  FaEdit,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaBox,
  FaStar,
  FaRegStar,
  FaChartLine,
  FaBatteryFull,
  FaBolt,
} from "react-icons/fa"
import "tailwindcss";

const base_url = import.meta.env.VITE_BASE_URL

const AdminDashboard = ({ token, user, onLogout }) => {
  // Security check: If no token, log out immediately
  useEffect(() => {
    if (!token) {
      onLogout()
    }
  }, [token, onLogout])

  const [activeTab, setActiveTab] = useState("overview")
  const [inquiries, setInquiries] = useState([])
  const [products, setProducts] = useState([])
  const [reports, setReports] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 10,
  })
  const [productFilters, setProductFilters] = useState({
    type: "all",
    page: 1,
    limit: 10,
  })
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch dashboard stats

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${base_url}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [token])

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        page: filters.page,
        limit: filters.limit,
      })

      const response = await fetch(`${base_url}/contact/inquiries?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    } finally {
      setLoading(false)
    }
  }, [filters, token])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        type: productFilters.type,
        page: productFilters.page,
        limit: productFilters.limit,
      })

      const response = await fetch(`${base_url}/admin/dashboard/products?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }, [productFilters, token])

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${base_url}/admin/dashboard/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Update inquiry status
  const updateInquiryStatus = async (id, status) => {
    try {
      const response = await fetch(`${base_url}/contact/inquiries/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchInquiries()
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  // Delete inquiry
  const deleteInquiry = async (id) => {
    try {
      const response = await  fetch(`${base_url}/admin/dashboard/inquiries/${id}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchInquiries()
        setShowModal(false)
        setShowDeleteConfirm(false)
      } 
    } catch (error) {
      console.error("Error deleting inquiry:", error)
    }
  }

  // Toggle product featured status
  const toggleProductFeatured = async (id, featured) => {
    try {
      const response = await fetch(`${base_url}/admin/dashboard/products/${id}/featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured }),
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  useEffect(() => {
    fetchStats()
    if (activeTab === "inquiries") {
      fetchInquiries()
    } else if (activeTab === "products") {
      fetchProducts()
    } else if (activeTab === "reports") {
      fetchReports()
    }
  }, [activeTab, filters, productFilters, fetchStats, fetchInquiries, fetchProducts, fetchReports])

  // Security Feature: Logout when user clicks browser back button
  useEffect(() => {
    const handlePopState = () => {
      console.warn("Back button detected. Logging out for security.")
      onLogout()
    }

    // Push a history state when component mounts
    // This prevents accidental back navigation
    window.history.pushState({ dashboardState: "active" }, "")

    // Listen for back/forward button
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [onLogout])

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <FaClock className="w-4 h-4" />
      case "in_progress":
        return <FaEdit className="w-4 h-4" />
      case "resolved":
        return <FaCheckCircle className="w-4 h-4" />
      case "closed":
        return <FaTimesCircle className="w-4 h-4" />
      default:
        return <FaClock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.username}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "inquiries"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              Contact Inquiries
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaBox className="inline mr-2" />
              Manage Products
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaChartLine className="inline mr-2" />
              View Reports
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaEnvelope className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Inquiries</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.contacts?.total || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaClock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">New Inquiries</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.contacts?.new_inquiries || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUsers className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Today's Inquiries</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.contacts?.today_inquiries || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaBox className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.products?.total || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <FaEnvelope className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Manage Inquiries</h4>
                  <p className="text-sm text-gray-500">View and respond to customer inquiries</p>
                </button>

                <button
                  onClick={() => setActiveTab("products")}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <FaBox className="h-6 w-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Manage Products</h4>
                  <p className="text-sm text-gray-500">Manage battery and inverter listings</p>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <FaChartLine className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">View Reports</h4>
                  <p className="text-sm text-gray-500">Generate business reports and analytics</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inquiries List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Contact Inquiries</h3>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading inquiries...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No inquiries found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inquiries.map((inquiry) => (
                        <tr key={inquiry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                              <div className="text-sm text-gray-500">{inquiry.email}</div>
                              <div className="text-sm text-gray-500">{inquiry.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{inquiry.subject || "No subject"}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{inquiry.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}
                            >
                              {getStatusIcon(inquiry.status)}
                              <span className="ml-1 capitalize">{inquiry.status.replace("_", " ")}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedInquiry(inquiry)
                                setShowModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <FaEye className="inline mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Product Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
                <select
                  value={productFilters.type}
                  onChange={(e) => setProductFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="battery">Batteries</option>
                  <option value="inverter">Inverters</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-900 aspect-video flex items-center justify-center p-6">
                    {product.type === "battery" ? (
                      <FaBatteryFull className="text-5xl text-yellow-400" />
                    ) : (
                      <FaBolt className="text-5xl text-yellow-400" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <button
                        onClick={() => toggleProductFeatured(product.id, !product.is_featured)}
                        className={`p-1 rounded ${product.is_featured ? "text-yellow-500" : "text-gray-400"}`}
                      >
                        {product.is_featured ? <FaStar /> : <FaRegStar />}
                      </button>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold bg-blue-100 text-blue-800 py-1 px-2 rounded">
                        {product.category}
                      </span>
                      <span className="text-sm text-gray-600">{product.brand}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    {product.price && (
                      <p className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Business Reports & Analytics</h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading reports...</p>
                </div>
              ) : reports ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Inquiry Status Breakdown</h4>
                    <div className="space-y-2">
                      {reports.status_breakdown?.map((item) => (
                        <div key={item.status} className="flex justify-between items-center">
                          <span className="capitalize text-sm text-gray-600">{item.status.replace("_", " ")}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inquiry Categories */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Popular Inquiry Categories</h4>
                    <div className="space-y-2">
                      {reports.inquiry_categories?.map((item) => (
                        <div key={item.category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.category}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Trends */}
                  <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-4">Monthly Inquiry Trends (Last 6 Months)</h4>
                    <div className="space-y-2">
                      {reports.monthly_inquiries?.map((item) => (
                        <div key={item.month} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.month}</span>
                          <div className="flex gap-4">
                            <span className="text-sm">Total: {item.count}</span>
                            <span className="text-sm text-green-600">Resolved: {item.resolved_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No report data available.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for viewing inquiry details */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Inquiry Details</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimesCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.subject || "No subject"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, "new")}
                      className={`px-3 py-1 rounded text-sm ${selectedInquiry.status === "new" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, "in_progress")}
                      className={`px-3 py-1 rounded text-sm ${selectedInquiry.status === "in_progress" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, "resolved")}
                      className={`px-3 py-1 rounded text-sm ${selectedInquiry.status === "resolved" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Resolved
                    </button>
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, "closed")}
                      className={`px-3 py-1 rounded text-sm ${selectedInquiry.status === "closed" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <FaTrash className="mr-2" />
                    Delete Inquiry
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-1/2 transform -translate-y-1/2 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <FaTrash className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Inquiry</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to permanently delete this inquiry from {selectedInquiry.name}? This action cannot
                be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => deleteInquiry(selectedInquiry.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
