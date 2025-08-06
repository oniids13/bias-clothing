import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/adminApi";

// Reusable Components
import { DashboardHeader } from "./components";

// Material UI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const CustomerManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // Remove roleFilter and add active/inactive filter and sorting
  const [statusFilter, setStatusFilter] = useState(""); // "active", "inactive", or ""
  const [sortByOrders, setSortByOrders] = useState(null); // null, "asc", or "desc"

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Success/notification states
  const [successMessage, setSuccessMessage] = useState("");

  // Customer statistics
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    totalRevenue: 0,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Place fetchCustomers before useEffect
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: currentPage,
        limit: 10,
      };

      if (debouncedSearchTerm) options.search = debouncedSearchTerm;
      // No role filter

      const result = await adminApi.getAllCustomers(options);

      if (result.success) {
        let filtered = result.data;
        // Filter by active/inactive
        if (statusFilter === "active") {
          filtered = filtered.filter((c) => c._count?.orders > 0);
        } else if (statusFilter === "inactive") {
          filtered = filtered.filter(
            (c) => !c._count?.orders || c._count.orders === 0
          );
        }
        // Sort by number of orders
        if (sortByOrders === "asc") {
          filtered = filtered
            .slice()
            .sort((a, b) => (a._count?.orders || 0) - (b._count?.orders || 0));
        } else if (sortByOrders === "desc") {
          filtered = filtered
            .slice()
            .sort((a, b) => (b._count?.orders || 0) - (a._count?.orders || 0));
        }
        setCustomers(filtered);
        setPagination(result.pagination);
      } else {
        setError(result.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, sortByOrders]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch customer statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await adminApi.getCustomerStats();
        if (result.success) {
          setCustomerStats(result.data);
        }
      } catch (error) {
        console.error("Error fetching customer stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setDebouncedSearchTerm(searchTerm);
  };

  const handleViewDetails = async (customerId) => {
    try {
      const result = await adminApi.getCustomerDetails(customerId);
      if (result.success) {
        setViewingCustomer(result.data);
        setShowDetailsModal(true);
      } else {
        setError(result.message || "Failed to fetch customer details");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setError("Failed to load customer details");
    }
  };

  const handleDeleteCustomer = (customer) => {
    setDeletingCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      setDeleteLoading(true);
      const result = await adminApi.deleteCustomer(deletingCustomer.id);

      if (result.success) {
        setSuccessMessage(
          `Customer "${deletingCustomer.name}" deleted successfully`
        );
        fetchCustomers();
        setShowDeleteConfirm(false);
        setDeletingCustomer(null);
      } else {
        setError(result.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("Failed to delete customer");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingCustomer(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCustomerStatus = (customer) => {
    if (customer._count?.orders > 0) {
      return {
        status: "active",
        label: "Active Customer",
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
      };
    } else {
      return {
        status: "inactive",
        label: "Inactive Customer",
        color: "bg-gray-100 text-gray-800",
        icon: CancelIcon,
      };
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Customer Details Modal Component
  const CustomerDetailsModal = () => {
    if (!showDetailsModal || !viewingCustomer) return null;

    const statusInfo = getCustomerStatus(viewingCustomer);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AccountCircleIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewingCustomer.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customer since {formatDate(viewingCustomer.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Customer Status
                </h4>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5" />
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Contact Information
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <EmailIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {viewingCustomer.email}
                    </span>
                  </div>
                  {viewingCustomer.phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {viewingCustomer.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            {viewingCustomer.addresses &&
              viewingCustomer.addresses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Shipping Addresses ({viewingCustomer.addresses.length})
                  </h4>
                  <div className="space-y-3">
                    {viewingCustomer.addresses.map((address, index) => (
                      <div
                        key={address.id}
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <LocationOnIcon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              Address {index + 1}
                            </span>
                            {address.isDefault && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{address.street}</div>
                          <div>{address.barangay}</div>
                          <div>
                            {address.city}, {address.state} {address.zipCode}
                          </div>
                          <div>{address.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Order History */}
            {viewingCustomer.orders && viewingCustomer.orders.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Order History ({viewingCustomer.orders.length} orders)
                </h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Order #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewingCustomer.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customer Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Customer Statistics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {viewingCustomer._count?.orders || 0}
                  </div>
                  <div className="text-xs text-gray-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {viewingCustomer._count?.addresses || 0}
                  </div>
                  <div className="text-xs text-gray-600">Addresses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDate(viewingCustomer.createdAt)}
                  </div>
                  <div className="text-xs text-gray-600">Member Since</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {viewingCustomer.role}
                  </div>
                  <div className="text-xs text-gray-600">Role</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
            {viewingCustomer._count?.orders === 0 && (
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleDeleteCustomer(viewingCustomer);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete Customer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirm || !deletingCustomer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <WarningIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Customer
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{deletingCustomer.name}"</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will permanently remove the customer account and all
              associated data from your system.
            </p>
            {deletingCustomer._count?.orders > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <WarningIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Cannot delete customer with existing orders
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  This customer has {deletingCustomer._count.orders} order(s)
                  and cannot be deleted.
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={cancelDelete}
              disabled={deleteLoading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteLoading || deletingCustomer._count?.orders > 0}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {deleteLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Delete Customer"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <DashboardHeader
          title="Customer Management"
          subtitle="Manage customer accounts and view customer information"
          user={user}
          onRefresh={fetchCustomers}
        >
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToAdmin}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowBackIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Admin</span>
            </button>
          </div>
        </DashboardHeader>

        {/* Statistics Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Customer Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {customerStats.totalCustomers}
                  </p>
                </div>
                <GroupIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Active Customers
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {customers.filter((c) => c._count?.orders > 0).length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {customerStats.newCustomers}
                  </p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FilterListIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Customers</option>
                <option value="active">Active Customers</option>
                <option value="inactive">Inactive Customers</option>
              </select>
            </div>
            {/* Sort by Orders */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Sort by Orders:</span>
              <button
                className={`px-2 py-1 rounded ${
                  sortByOrders === "asc"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() =>
                  setSortByOrders(sortByOrders === "asc" ? null : "asc")
                }
                title="Sort Ascending"
              >
                ↑
              </button>
              <button
                className={`px-2 py-1 rounded ${
                  sortByOrders === "desc"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() =>
                  setSortByOrders(sortByOrders === "desc" ? null : "desc")
                }
                title="Sort Descending"
              >
                ↓
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Customers ({pagination.totalCount})
            </h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Since
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.length > 0 ? (
                  customers.map((customer) => {
                    const statusInfo = getCustomerStatus(customer);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <PersonIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.role}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm text-gray-900">
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {customer._count?.orders || 0} orders
                          </div>
                        </td>

                        {/* Member Since */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(customer.createdAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {/* View Details */}
                            <button
                              onClick={() => handleViewDetails(customer.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-md hover:bg-blue-50"
                              title="View Details"
                            >
                              <VisibilityIcon className="h-5 w-5" />
                            </button>

                            {/* Delete - Only show for customers with no orders */}
                            {customer._count?.orders === 0 && (
                              <button
                                onClick={() => handleDeleteCustomer(customer)}
                                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-md hover:bg-red-50"
                                title="Delete Customer"
                              >
                                <DeleteIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <PersonIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No customers found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, pagination.totalCount)} of{" "}
                  {pagination.totalCount} customers
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`px-3 py-1 rounded-md text-sm ${
                      pagination.hasPrevPage
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`px-3 py-1 rounded-md text-sm ${
                      pagination.hasNextPage
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default CustomerManagement;
