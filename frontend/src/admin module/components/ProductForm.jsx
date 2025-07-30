import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/adminApi";

// Material UI Icons
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const ProductForm = ({
  productId = null,
  initialData = null,
  onSave,
  onCancel,
}) => {
  const navigate = useNavigate();
  const isEditMode = !!productId;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    details: ["", "", "", ""],
    price: "",
    category: "",
    isActive: true,
    isFeatured: false,
    isNew: true,
  });

  const [variants, setVariants] = useState([{ size: "M", color: "" }]);

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories (you can expand this list)
  const categories = [
    "T-Shirts",
    "Hoodies",
    "Accessories",
    "Bags",
    "Caps",
    "Jackets",
    "Pants",
    "Shoes",
  ];

  // Sizes from schema enum
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        details:
          initialData.details?.length >= 4
            ? initialData.details.slice(0, 4)
            : [
                ...(initialData.details || []),
                ...Array(4 - (initialData.details?.length || 0)).fill(""),
              ],
        price: initialData.price?.toString() || "",
        category: initialData.category || "",
        isActive: initialData.isActive ?? true,
        isFeatured: initialData.isFeatured ?? false,
        isNew: initialData.isNew ?? true,
      });

      if (initialData.imageUrl?.length > 0) {
        setImages(
          initialData.imageUrl.map((url, index) => ({
            id: index,
            url,
            file: null,
          }))
        );
      }

      if (initialData.variants?.length > 0) {
        setVariants(
          initialData.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
          }))
        );
      }
    }
  }, [isEditMode, initialData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle details array changes
  const handleDetailChange = (index, value) => {
    const newDetails = [...formData.details];
    newDetails[index] = value;
    setFormData((prev) => ({ ...prev, details: newDetails }));
  };

  // Handle variant changes
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // Add new variant
  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "M", color: "" }]);
  };

  // Remove variant
  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = 4 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Process all files and collect the results
    const newImages = [];
    const newImageFiles = [];
    let processedCount = 0;

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
        };

        newImages.push(newImage);
        newImageFiles.push(file);
        processedCount++;

        // When all files are processed, update the state
        if (processedCount === filesToAdd.length) {
          setImages((prev) => [...prev, ...newImages]);
          setImageFiles((prev) => [...prev, ...newImageFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (imageId) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      const newImages = prev.filter((img) => img.id !== imageId);

      // Also remove from imageFiles if it's a new file
      if (imageToRemove?.file) {
        setImageFiles((prevFiles) =>
          prevFiles.filter((file) => file !== imageToRemove.file)
        );
      }

      return newImages;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";

    // Validate at least one detail
    const hasDetails = formData.details.some((detail) => detail.trim());
    if (!hasDetails)
      newErrors.details = "At least one product detail is required";

    // Validate variants
    const invalidVariants = variants.some((variant) => !variant.color.trim());
    if (invalidVariants) newErrors.variants = "All variants must have color";

    // Check for duplicate variants
    const variantKeys = variants.map(
      (v) => `${v.size}-${v.color.toLowerCase()}`
    );
    const uniqueKeys = new Set(variantKeys);
    if (variantKeys.length !== uniqueKeys.size) {
      newErrors.variants = "Duplicate size-color combinations are not allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        details: formData.details.filter((detail) => detail.trim()),
        variants: variants.filter((variant) => variant.color.trim()),
      };

      // Handle image uploads - upload all new images at once
      let uploadedImageUrls = [];

      if (imageFiles.length > 0) {
        const uploadResult = await adminApi.uploadImages(imageFiles);
        if (uploadResult.success) {
          uploadedImageUrls = uploadResult.data.map((result) => result.url);
        } else {
          throw new Error(uploadResult.message || "Failed to upload images");
        }
      }

      // Keep existing image URLs for edit mode
      const existingImageUrls = images
        .filter((img) => !img.file && img.url)
        .map((img) => img.url);

      productData.imageUrl = [...existingImageUrls, ...uploadedImageUrls];

      // Call the appropriate API
      let result;
      if (isEditMode) {
        result = await adminApi.updateProduct(productId, productData);
      } else {
        result = await adminApi.createProduct(productData);
      }

      if (result.success) {
        if (onSave) {
          onSave(result.data);
        } else {
          navigate("/admin/products");
        }
      } else {
        setErrors({ submit: result.message || "Failed to save product" });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors({ submit: "An error occurred while saving the product" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditMode
                  ? "Update product information"
                  : "Create a new product for your store"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PHP) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Product Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Details *
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {formData.details.map((detail, index) => (
                  <input
                    key={index}
                    type="text"
                    value={detail}
                    onChange={(e) => handleDetailChange(index, e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Detail ${index + 1}`}
                  />
                ))}
              </div>
              {errors.details && (
                <p className="text-red-500 text-sm mt-1">{errors.details}</p>
              )}
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (Max 4)
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {images.length < 4 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <AddPhotoAlternateIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Product Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Product Variants *
                </label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <AddIcon className="h-4 w-4" />
                  <span>Add Variant</span>
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Size
                      </label>
                      <select
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) =>
                          handleVariantChange(index, "color", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter color"
                      />
                    </div>

                    <div className="flex items-end">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.variants && (
                <p className="text-red-500 text-sm mt-1">{errors.variants}</p>
              )}
            </div>

            {/* Product Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Settings
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      handleInputChange("isFeatured", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) =>
                      handleInputChange("isNew", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">New Product</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 border-t pt-6">
              <button
                type="button"
                onClick={onCancel || (() => navigate("/admin/products"))}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                <CancelIcon className="h-5 w-5" />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SaveIcon className="h-5 w-5" />
                <span>
                  {loading
                    ? "Saving..."
                    : isEditMode
                    ? "Update Product"
                    : "Create Product"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
