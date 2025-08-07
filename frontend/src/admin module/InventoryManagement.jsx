import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/adminApi";

// Reusable Components
import { DashboardHeader } from "./components";

// Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const InventoryManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Success/notification states
  const [successMessage, setSuccessMessage] = useState("");

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Inventory stats
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    averageStockLevel: 0,
  });

  // Modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [stockUpdateData, setStockUpdateData] = useState({
    stock: 0,
    notes: "",
  });

  // View all variants modal
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getInventoryData();

      if (response.success) {
        setProducts(response.data.products);
        setInventoryStats(response.data.stats);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to fetch inventory data");
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Stock filter
    if (stockFilter !== "all") {
      filtered = filtered.filter((product) => {
        const hasLowStock = product.variants.some(
          (variant) => variant.stock <= 10 && variant.stock > 0
        );
        const hasOutOfStock = product.variants.some(
          (variant) => variant.stock === 0
        );
        const hasGoodStock = product.variants.some(
          (variant) => variant.stock > 10
        );

        switch (stockFilter) {
          case "low":
            return hasLowStock || hasOutOfStock; // Include both low stock and out of stock
          case "out":
            return hasOutOfStock;
          case "in":
            return hasGoodStock && !hasOutOfStock; // Only products with good stock and no out of stock variants
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "stock":
          aValue = a.variants.reduce((sum, variant) => sum + variant.stock, 0);
          bValue = b.variants.reduce((sum, variant) => sum + variant.stock, 0);
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleStockUpdate = async () => {
    try {
      const response = await adminApi.updateVariantStock(
        selectedVariant.id,
        stockUpdateData.stock,
        stockUpdateData.notes
      );

      if (response.success) {
        // Update local state
        setProducts((prevProducts) =>
          prevProducts.map((product) => ({
            ...product,
            variants: product.variants.map((variant) =>
              variant.id === selectedVariant.id
                ? { ...variant, stock: stockUpdateData.stock }
                : variant
            ),
          }))
        );

        setShowStockModal(false);
        setSelectedVariant(null);
        setStockUpdateData({ stock: 0, notes: "" });

        // Show success message
        setSuccessMessage(
          `Stock updated successfully for ${
            selectedVariant.product?.name || "product"
          }`
        );
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to update stock");
      console.error("Error updating stock:", error);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { status: "out", color: "text-red-600", bgColor: "bg-red-100" };
    if (stock <= 10)
      return {
        status: "low",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    return { status: "in", color: "text-green-600", bgColor: "bg-green-100" };
  };

  const getTotalStock = (variants) => {
    return variants.reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getLowStockVariants = (variants) => {
    return variants.filter(
      (variant) => variant.stock <= 10 // Include both low stock (1-10) and out of stock (0)
    );
  };

  const getOutOfStockVariants = (variants) => {
    return variants.filter((variant) => variant.stock === 0);
  };

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewAllVariants = (product) => {
    setSelectedProduct(product);
    setShowVariantsModal(true);
  };

  const handleEditStock = (variant, product) => {
    // Only allow editing if stock is low (≤10) or out of stock (0)
    if (variant.stock <= 10) {
      setSelectedVariant({ ...variant, product });
      setStockUpdateData({
        stock: variant.stock,
        notes: "",
      });
      setShowStockModal(true);
    }
  };

  const canEditStock = (stock) => {
    return stock <= 10; // Allow editing for low stock items (≤10) and out of stock items (0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
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
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
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
          title="Inventory Management"
          subtitle="Track and manage inventory levels across all product variants"
          user={user}
          onRefresh={fetchInventoryData}
          onBack={handleBackToAdmin}
          showBack={true}
        />

        {/* Statistics Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Inventory Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {inventoryStats.totalProducts}
                  </p>
                </div>
                <InventoryIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Low Stock Items
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {inventoryStats.lowStockItems}
                  </p>
                </div>
                <WarningIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {inventoryStats.outOfStockItems}
                  </p>
                </div>
                <TrendingDownIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(inventoryStats.totalValue)}
                  </p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Stock Level
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventoryStats.averageStockLevel}
                  </p>
                </div>
                <InventoryIcon className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FilterListIcon className="h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Accessories">Accessories</option>
                <option value="Bags">Bags</option>
                <option value="Caps">Caps</option>
              </select>
            </div>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock (≤10)</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Product Inventory ({filteredProducts.length})
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
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const totalStock = getTotalStock(product.variants);
                    const lowStockVariants = getLowStockVariants(
                      product.variants
                    );
                    const outOfStockVariants = getOutOfStockVariants(
                      product.variants
                    );
                    const stockStatus = getStockStatus(totalStock);

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Product */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0">
                              <img
                                className="h-16 w-16 rounded-lg object-cover"
                                src={
                                  product.imageUrl &&
                                  product.imageUrl.length > 0
                                    ? product.imageUrl[0]
                                    : "/src/images/bias_logo.png"
                                }
                                alt={product.name}
                                onError={(e) => {
                                  e.target.src = "/src/images/bias_logo.png";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.price)}
                          </div>
                        </td>
                        {/* Variants */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.variants.length} variants
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.variants
                              .slice(0, 3)
                              .map((variant, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                                >
                                  {variant.size}/{variant.color}
                                </span>
                              ))}
                            {product.variants.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                +{product.variants.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Stock */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {totalStock} units
                          </div>
                          {lowStockVariants.length > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              {lowStockVariants.length} low stock
                            </div>
                          )}
                          {outOfStockVariants.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {outOfStockVariants.length} out of stock
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}
                          >
                            {stockStatus.status === "out"
                              ? "Out of Stock"
                              : stockStatus.status === "low"
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {/* View All Variants Button */}
                            <button
                              onClick={() => handleViewAllVariants(product)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-md hover:bg-green-50"
                              title="View All Variants"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>

                            {/* Edit Stock Button - Show different behavior based on number of variants needing restock */}
                            {lowStockVariants.length === 1 && (
                              <button
                                onClick={() => {
                                  handleEditStock(lowStockVariants[0], product);
                                }}
                                className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded-md hover:bg-orange-50"
                                title="Edit Stock Level"
                              >
                                <EditIcon className="h-5 w-5" />
                              </button>
                            )}

                            {lowStockVariants.length > 1 && (
                              <button
                                onClick={() => handleViewAllVariants(product)}
                                className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded-md hover:bg-orange-50"
                                title={`Edit Stock Levels (${lowStockVariants.length})`}
                              >
                                <div className="relative">
                                  <EditIcon className="h-5 w-5" />
                                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {lowStockVariants.length}
                                  </span>
                                </div>
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
                          <InventoryIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No products found
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
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <WarningIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Stock Level
                </h3>
                <p className="text-sm text-orange-600">
                  Only low stock (≤10 units) and out of stock items can be
                  edited
                </p>
              </div>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Product</div>
              <div className="font-medium text-gray-900">
                {selectedVariant.product?.name}
              </div>

              <div className="text-sm text-gray-600 mb-1 mt-2">Variant</div>
              <div className="font-medium text-gray-900">
                {selectedVariant.size} - {selectedVariant.color}
              </div>

              <div className="text-sm text-gray-600 mb-1 mt-2">
                Current Stock
              </div>
              <div className="font-medium text-gray-900">
                {selectedVariant.stock} units
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={stockUpdateData.stock}
                onChange={(e) =>
                  setStockUpdateData((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={stockUpdateData.notes}
                onChange={(e) =>
                  setStockUpdateData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this stock update..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedVariant(null);
                  setStockUpdateData({ stock: 0, notes: "" });
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStockUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Variants Modal */}
      {showVariantsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <InventoryIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Variants - {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage all product variants
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVariantsModal(false);
                  setSelectedProduct(null);
                }}
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

            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Show low stock variants first if there are any */}
              {getLowStockVariants(selectedProduct.variants).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-orange-600 mb-3 flex items-center">
                    <WarningIcon className="h-4 w-4 mr-2" />
                    Items Needing Restock (
                    {getLowStockVariants(selectedProduct.variants).length}) -
                    Click to Edit
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getLowStockVariants(selectedProduct.variants).map(
                      (variant, index) => {
                        const stockStatus = getStockStatus(variant.stock);

                        return (
                          <div
                            key={`low-${index}`}
                            className="border-2 border-orange-300 bg-orange-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {variant.size}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700">
                                  {variant.color}
                                </span>
                              </div>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}
                              >
                                {stockStatus.status === "out" ? "Out" : "Low"}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Stock:</span>
                                <span className="font-medium text-orange-800">
                                  {variant.stock} units
                                </span>
                              </div>
                              {variant.sku && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">SKU:</span>
                                  <span className="font-mono text-xs">
                                    {variant.sku}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-orange-200">
                              <button
                                onClick={() => {
                                  handleEditStock(variant, selectedProduct);
                                  setShowVariantsModal(false);
                                }}
                                className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                              >
                                <EditIcon className="h-4 w-4" />
                                <span>Update Stock</span>
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Show all other variants */}
              {selectedProduct.variants.filter(
                (variant) => !canEditStock(variant.stock)
              ).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <InventoryIcon className="h-4 w-4 mr-2" />
                    Well Stocked Items (
                    {
                      selectedProduct.variants.filter(
                        (variant) => !canEditStock(variant.stock)
                      ).length
                    }
                    )
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProduct.variants
                      .filter((variant) => !canEditStock(variant.stock))
                      .map((variant, index) => {
                        const stockStatus = getStockStatus(variant.stock);

                        return (
                          <div
                            key={`good-${index}`}
                            className="border border-gray-200 bg-white rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {variant.size}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700">
                                  {variant.color}
                                </span>
                              </div>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}
                              >
                                Good
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Stock:</span>
                                <span className="font-medium text-green-700">
                                  {variant.stock} units
                                </span>
                              </div>
                              {variant.sku && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">SKU:</span>
                                  <span className="font-mono text-xs">
                                    {variant.sku}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-500 text-center">
                                Stock level is sufficient
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total Variants: {selectedProduct.variants.length} | Low Stock:{" "}
                  {getLowStockVariants(selectedProduct.variants).length} | Out
                  of Stock:{" "}
                  {getOutOfStockVariants(selectedProduct.variants).length}
                </div>
                <button
                  onClick={() => {
                    setShowVariantsModal(false);
                    setSelectedProduct(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
