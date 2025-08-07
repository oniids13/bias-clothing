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
  const [showSuccessfulOrders, setShowSuccessfulOrders] = useState(false);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
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

  // Payment status options
  const paymentStatuses = [
    {
      value: "PENDING",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "PAID",
      label: "Paid",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "FAILED",
      label: "Failed",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "REFUNDED",
      label: "Refunded",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "PARTIALLY_REFUNDED",
      label: "Partially Refunded",
      color: "bg-orange-100 text-orange-800",
    },
  ];

  // Payment method icons
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
      case "credit_card":
      case "credit card":
      case "debit":
      case "debit card":
        return CreditCardIcon;
      case "gcash":
      case "g-cash":
      case "g cash":
        return AccountBalanceWalletIcon;
      default:
        return PaymentIcon;
    }
  };

  // Normalize payment method display
  const normalizePaymentMethod = (method) => {
    if (!method) return "Not specified";

    const normalized = method.toLowerCase().trim();

    switch (normalized) {
      case "gcash":
      case "g-cash":
      case "g cash":
        return "GCash";
      case "card":
      case "credit_card":
      case "credit card":
      case "debit":
      case "debit card":
        return "Card";
      default:
        // Return the original method if it doesn't match any known patterns
        return method;
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
      if (paymentFilter) options.paymentStatus = paymentFilter;
      if (dateFilter) options.dateFilter = dateFilter;
      if (showSuccessfulOrders) options.successfulOnly = true;

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
    showSuccessfulOrders,
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
    setNewPaymentStatus(order.paymentStatus);
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
        setNewPaymentStatus("");
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

  const confirmPaymentStatusUpdate = async () => {
    if (!updatingOrder || !newPaymentStatus) return;

    try {
      setStatusLoading(true);
      const result = await orderApi.updatePaymentStatus(
        updatingOrder.id,
        newPaymentStatus
      );

      if (result.success) {
        setSuccessMessage(
          `Order #${updatingOrder.orderNumber} payment status updated to ${newPaymentStatus}`
        );
        fetchOrders();
        setShowStatusModal(false);
        setUpdatingOrder(null);
        setNewStatus("");
        setNewPaymentStatus("");
      } else {
        setError(result.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to update payment status");
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
                      {normalizePaymentMethod(viewingOrder.paymentMethod)}
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
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">
                      {viewingOrder.user?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    {viewingOrder.address ? (
                      <div className="font-medium">
                        <div>{viewingOrder.address.street}</div>
                        <div>{viewingOrder.address.barangay}</div>
                        <div>
                          {viewingOrder.address.city},{" "}
                          {viewingOrder.address.state}{" "}
                          {viewingOrder.address.zipCode}
                        </div>
                        <div>{viewingOrder.address.country}</div>
                      </div>
                    ) : (
                      <p className="font-medium text-gray-500">
                        No address provided
                      </p>
                    )}
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
                    {(() => {
                      const orderItems =
                        viewingOrder.items || viewingOrder.orderItems || [];

                      if (orderItems.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No order items found
                            </td>
                          </tr>
                        );
                      }

                      return orderItems.map((item, index) => {
                        // Handle different possible data structures
                        const productName =
                          item.product?.name ||
                          item.productName ||
                          "Unknown Product";
                        const productImage =
                          item.product?.imageUrl?.[0] ||
                          "/src/images/bias_logo.png";
                        const size = item.size || item.variant?.size || "N/A";
                        const color =
                          item.color || item.variant?.color || "N/A";
                        const quantity = item.quantity || 0;
                        const unitPrice = item.unitPrice || item.price || 0;
                        const totalPrice =
                          item.totalPrice || unitPrice * quantity;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                                <span className="font-medium text-sm">
                                  {productName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {size} / {color}
                            </td>
                            <td className="px-4 py-3 text-sm">{quantity}</td>
                            <td className="px-4 py-3 text-sm">
                              {formatCurrency(unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {formatCurrency(totalPrice)}
                            </td>
                          </tr>
                        );
                      });
                    })()}
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
            {!showSuccessfulOrders && (
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleUpdateStatus(viewingOrder);
                }}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <EditIcon className="h-4 w-4" />
                <span>Update Order</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Status Update Modal Component
  const StatusUpdateModal = () => {
    const [activeTab, setActiveTab] = useState("order"); // "order" or "payment"

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
                Update Order Details
              </h3>
              <p className="text-sm text-gray-600">
                Order #{updatingOrder.orderNumber}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("order")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "order"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Order Status
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "payment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Payment Status
            </button>
          </div>

          {/* Order Status Tab */}
          {activeTab === "order" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Order Status
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
          )}

          {/* Payment Status Tab */}
          {activeTab === "payment" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {paymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowStatusModal(false);
                setUpdatingOrder(null);
                setNewStatus("");
                setNewPaymentStatus("");
              }}
              disabled={statusLoading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={
                activeTab === "order"
                  ? confirmStatusUpdate
                  : confirmPaymentStatusUpdate
              }
              disabled={
                statusLoading ||
                (activeTab === "order" && newStatus === updatingOrder.status) ||
                (activeTab === "payment" &&
                  newPaymentStatus === updatingOrder.paymentStatus)
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {statusLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                `Update ${activeTab === "order" ? "Status" : "Payment Status"}`
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
          onBack={handleBackToAdmin}
          showBack={true}
        >
          {/* Successful Orders Indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              View Successful Orders
            </span>
          </div>
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
              {/* Successful Orders Toggle */}
              <button
                onClick={() => {
                  setShowSuccessfulOrders(!showSuccessfulOrders);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showSuccessfulOrders
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                {showSuccessfulOrders
                  ? "✓ Viewing Successful Orders"
                  : "View Successful Orders"}
              </button>

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
              {showSuccessfulOrders
                ? "Successful Order History"
                : "Active Orders"}{" "}
              ({pagination.totalCount})
            </h2>
            {showSuccessfulOrders ? (
              <p className="text-sm text-gray-600 mt-1">
                Showing delivered and paid orders
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                Orders that need attention or are in progress
              </p>
            )}
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
                            <div className="text-sm text-gray-500">
                              {order.user?.phone || "No phone"}
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
                                {normalizePaymentMethod(order.paymentMethod)}
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

                            {/* Update Status - Only show for non-successful orders */}
                            {!showSuccessfulOrders && (
                              <button
                                onClick={() => handleUpdateStatus(order)}
                                className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-md hover:bg-green-50"
                                title="Update Order & Payment Status"
                              >
                                <EditIcon className="h-5 w-5" />
                              </button>
                            )}

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
                          {showSuccessfulOrders
                            ? "No successful orders found"
                            : "No active orders found"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {showSuccessfulOrders
                            ? "Delivered and paid orders will appear here"
                            : "All orders are either completed or need attention"}
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
