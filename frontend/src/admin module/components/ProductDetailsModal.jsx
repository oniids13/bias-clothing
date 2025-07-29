import { useState, useEffect } from "react";
import { adminApi } from "../../services/adminApi";

// Material UI Icons
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaletteIcon from "@mui/icons-material/Palette";
import StraightenIcon from "@mui/icons-material/Straighten";

const ProductDetailsModal = ({ productId, isOpen, onClose, onEdit }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminApi.getProductById(productId);

      if (result.success) {
        setProduct(result.data);
      } else {
        setError(result.message || "Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalStock = (variants) => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getUniqueColors = (variants) => {
    const colors = variants.map((variant) => variant.color);
    return [...new Set(colors)];
  };

  const getVariantsByColor = (variants) => {
    const colorGroups = {};
    variants.forEach((variant) => {
      if (!colorGroups[variant.color]) {
        colorGroups[variant.color] = [];
      }
      colorGroups[variant.color].push(variant);
    });
    return colorGroups;
  };

  const handleEditClick = () => {
    onEdit(product);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <VisibilityIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Product Details
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {product && (
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <EditIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading product details...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {product && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Images
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.imageUrl && product.imageUrl.length > 0 ? (
                      product.imageUrl.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">
                          No images available
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-4 mb-4">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      {product.isFeatured && (
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {product.isNew && (
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <AttachMoneyIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <CategoryIcon className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <InventoryIcon className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Stock</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {getTotalStock(product.variants || [])} units
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <PaletteIcon className="h-6 w-6 text-pink-600" />
                      <div>
                        <p className="text-sm text-gray-600">Colors</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {getUniqueColors(product.variants || []).length}{" "}
                          colors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {product.description || "No description available"}
                </p>
              </div>

              {/* Details */}
              {product.details && product.details.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Product Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {product.details.map((detail, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Variants
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(getVariantsByColor(product.variants)).map(
                      ([color, variants]) => (
                        <div
                          key={color}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                              style={{
                                backgroundColor:
                                  color.toLowerCase() === "white"
                                    ? "#f3f4f6"
                                    : color.toLowerCase(),
                              }}
                            ></div>
                            {color}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {variants.map((variant) => (
                              <div
                                key={variant.id}
                                className="bg-gray-50 p-3 rounded-lg text-center"
                              >
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <StraightenIcon className="h-4 w-4 text-gray-600" />
                                  <span className="font-semibold text-gray-900">
                                    {variant.size}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {variant.stock} in stock
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {variant.sku}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Slug:</span>
                    <span className="ml-2 text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {product.slug}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Product ID:
                    </span>
                    <span className="ml-2 text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {product.id}
                    </span>
                  </div>
                  {product.createdAt && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Created:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Last Updated:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
