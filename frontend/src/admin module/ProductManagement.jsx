import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/adminApi";

// Reusable Components
import { DashboardHeader } from "./components";

// Material UI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

const ProductManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) options.search = searchTerm;
      if (filterCategory) options.category = filterCategory;
      if (filterStatus !== "") options.isActive = filterStatus === "active";

      const result = await adminApi.getAllProductsForAdmin(options);

      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleViewDetails = (productId) => {
    // Navigate to product details page
    navigate(`/products/${productId}`);
  };

  const handleEditProduct = (productId) => {
    // TODO: Navigate to edit product page or open edit modal
    console.log("Edit product:", productId);
    // navigate(`/admin/products/edit/${productId}`);
  };

  const handleDeleteProduct = (productId, productName) => {
    // TODO: Show confirmation dialog and delete product
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      console.log("Delete product:", productId);
      // Implement delete functionality
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUniqueColors = (variants) => {
    const colors = variants.map((variant) => variant.color);
    return [...new Set(colors)];
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader
          title="Product Management"
          subtitle="Manage your product catalog and inventory"
          user={user}
          onRefresh={fetchProducts}
        >
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => console.log("Add new product")}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <AddIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Add Product</span>
            </button>
            <button
              onClick={handleBackToAdmin}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowBackIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Admin</span>
            </button>
          </div>
        </DashboardHeader>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FilterListIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Accessories">Accessories</option>
                <option value="Bags">Bags</option>
                <option value="Caps">Caps</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Products ({pagination.totalCount})
            </h2>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color Variants
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    View Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edit Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delete Product
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={
                              product.imageUrl && product.imageUrl.length > 0
                                ? product.imageUrl[0]
                                : "/src/images/bias_logo.png"
                            }
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "/src/images/bias_logo.png";
                            }}
                          />
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                          <div className="flex items-center mt-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </div>
                          )}
                      </td>

                      {/* Color Variants */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getUniqueColors(product.variants).map(
                            (color, index) => (
                              <span
                                key={index}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                              >
                                {color}
                              </span>
                            )
                          )}
                        </div>
                      </td>

                      {/* View Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(product.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <VisibilityIcon className="h-5 w-5" />
                        </button>
                      </td>

                      {/* Edit Product */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>
                      </td>

                      {/* Delete Product */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <DeleteIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <SearchIcon className="h-8 w-8 text-gray-400" />
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, pagination.totalCount)} of{" "}
                  {pagination.totalCount} products
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
    </div>
  );
};

export default ProductManagement;
