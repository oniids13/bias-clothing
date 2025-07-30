import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../services/orderApi";

// Reusable Components
import { DashboardHeader } from "./components";

// Material UI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

const OrderManagement = () => {
  console.log("OrderManagement component loaded");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Success/notification states
  const [successMessage, setSuccessMessage] = useState("");

  // Order status options
  const orderStatuses = [
    {
      value: "PENDING",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: PendingIcon,
    },
    {
      value: "CONFIRMED",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircleIcon,
    },
    {
      value: "PROCESSING",
      label: "Processing",
      color: "bg-purple-100 text-purple-800",
      icon: EditIcon,
    },
    {
      value: "SHIPPED",
      label: "Shipped",
      color: "bg-indigo-100 text-indigo-800",
      icon: LocalShippingIcon,
    },
    {
      value: "DELIVERED",
      label: "Delivered",
      color: "bg-green-100 text-green-800",
      icon: CheckCircleIcon,
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: CancelIcon,
    },
  ];

  // Payment method icons
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
      case "credit_card":
        return CreditCardIcon;
      case "gcash":
      case "paymaya":
        return AccountBalanceWalletIcon;
      default:
        return PaymentIcon;
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Place fetchOrders before useEffect
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: currentPage,
        limit: 10,
      };

      if (debouncedSearchTerm) options.search = debouncedSearchTerm;
      if (statusFilter) options.status = statusFilter;
      if (paymentFilter) options.paymentMethod = paymentFilter;
      if (dateFilter) options.dateFilter = dateFilter;

      const result = await orderApi.getOrdersForAdmin(options);

      if (result.success) {
        setOrders(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    paymentFilter,
    dateFilter,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const handleViewDetails = (order) => {
    setViewingOrder(order);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (order) => {
    setUpdatingOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!updatingOrder || !newStatus) return;

    try {
      setStatusLoading(true);
      const result = await orderApi.updateOrderStatus(
        updatingOrder.id,
        newStatus
      );

      if (result.success) {
        setSuccessMessage(
          `Order #${updatingOrder.orderNumber} status updated to ${newStatus}`
        );
        fetchOrders();
        setShowStatusModal(false);
        setUpdatingOrder(null);
        setNewStatus("");
      } else {
        setError(result.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleGenerateInvoice = async (order) => {
    try {
      const result = await orderApi.generateInvoice(order.id);

      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${order.orderNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccessMessage(`Invoice generated for order #${order.orderNumber}`);
      } else {
        setError(result.message || "Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      setError("Failed to generate invoice");
    }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    return orderStatuses.find((s) => s.value === status) || orderStatuses[0];
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Order Details Modal Component
  const OrderDetailsModal = () => {
    if (!showDetailsModal || !viewingOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Order Details - #{viewingOrder.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(viewingOrder.createdAt)}
                </p>
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
              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Order Status</h4>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const statusInfo = getStatusInfo(viewingOrder.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <StatusIcon className="h-5 w-5" />
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Payment Information
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const PaymentIcon = getPaymentIcon(
                        viewingOrder.paymentMethod
                      );
                      return <PaymentIcon className="h-4 w-4 text-gray-600" />;
                    })()}
                    <span className="text-sm text-gray-600">
                      {viewingOrder.paymentMethod || "Not specified"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        viewingOrder.paymentStatus === "PAID"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {viewingOrder.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Customer Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">
                      {viewingOrder.user?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">
                      {viewingOrder.user?.email || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="font-medium">
                      {viewingOrder.shippingAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Variant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewingOrder.orderItems?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                item.product?.imageUrl?.[0] ||
                                "/src/images/bias_logo.png"
                              }
                              alt={item.product?.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-sm">
                              {item.product?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.variant?.size} / {item.variant?.color}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(viewingOrder.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatCurrency(viewingOrder.shipping || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(viewingOrder.tax || 0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(viewingOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => handleGenerateInvoice(viewingOrder)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download Invoice</span>
            </button>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                handleUpdateStatus(viewingOrder);
              }}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <EditIcon className="h-4 w-4" />
              <span>Update Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Status Update Modal Component
  const StatusUpdateModal = () => {
    if (!showStatusModal || !updatingOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <EditIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Update Order Status
              </h3>
              <p className="text-sm text-gray-600">
                Order #{updatingOrder.orderNumber}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowStatusModal(false);
                setUpdatingOrder(null);
                setNewStatus("");
              }}
              disabled={statusLoading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmStatusUpdate}
              disabled={statusLoading || newStatus === updatingOrder.status}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {statusLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Update Status"
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
          <p className="text-gray-600">Loading orders...</p>
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
          title="Order Management"
          subtitle="Manage customer orders and track order status"
          user={user}
          onRefresh={fetchOrders}
        >
          {/* Back Button */}
          <button
            onClick={handleBackToAdmin}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowBackIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Admin</span>
          </button>
        </DashboardHeader>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
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
                  <option value="">All Status</option>
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders ({pagination.totalCount})
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
                    Order Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    const PaymentIcon = getPaymentIcon(order.paymentMethod);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Order Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {order.user?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || "N/A"}
                            </div>
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

                        {/* Payment */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <PaymentIcon className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-900">
                                {order.paymentMethod || "N/A"}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                order.paymentStatus === "PAID"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {/* View Details */}
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-md hover:bg-blue-50"
                              title="View Details"
                            >
                              <VisibilityIcon className="h-5 w-5" />
                            </button>

                            {/* Update Status */}
                            <button
                              onClick={() => handleUpdateStatus(order)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-md hover:bg-green-50"
                              title="Update Status"
                            >
                              <EditIcon className="h-5 w-5" />
                            </button>

                            {/* Generate Invoice */}
                            <button
                              onClick={() => handleGenerateInvoice(order)}
                              className="text-purple-600 hover:text-purple-900 transition-colors p-1 rounded-md hover:bg-purple-50"
                              title="Generate Invoice"
                            >
                              <ReceiptIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <SearchIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No orders found
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
                  {pagination.totalCount} orders
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

      {/* Order Details Modal */}
      <OrderDetailsModal />

      {/* Status Update Modal */}
      <StatusUpdateModal />
    </div>
  );
};

export default OrderManagement;
