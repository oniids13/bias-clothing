import React from "react";
import { useNavigate } from "react-router-dom";

const ProductDetails = ({
  product,
  selectedSize,
  selectedColor,
  quantity,
  currentStock,
  availableColors,
  availableSizes,
  addingToCart,
  addToCartMessage,
  user,
  handleSizeClick,
  handleColorClick,
  handleQuantityChange,
  handleAddToCart,
}) => {
  const navigate = useNavigate();

  // Check if a size is available (always allow selection, don't restrict based on color)
  const isSizeAvailable = (size) => {
    return availableSizes.includes(size);
  };

  // Check if a color is available (always allow selection, don't restrict based on size)
  const isColorAvailable = (color) => {
    return availableColors.includes(color);
  };

  // Check if the selected combination is valid (only used for stock checking)
  const isValidCombination = () => {
    if (!selectedSize || !selectedColor) return false;
    return product.variants?.some(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const getButtonText = () => {
    if (addingToCart) return "Adding...";
    if (!product.isActive) return "Out of Stock";
    if (!user) return "Login to Add to Cart";

    // More helpful text based on what's missing
    if (!selectedSize && !selectedColor) return "Select Size and Color";
    if (!selectedSize) return "Select Size";
    if (!selectedColor) return "Select Color";
    if (!isValidCombination()) return "Invalid Size/Color Combination";
    return "Add to Cart";
  };

  const isButtonDisabled = () => {
    return (
      !product.isActive ||
      addingToCart ||
      (user && (!selectedSize || !selectedColor || !isValidCombination()))
    );
  };

  const handleButtonClick = () => {
    if (!user) {
      handleLoginRedirect();
    } else {
      handleAddToCart();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
      <p className="text-2xl font-semibold text-red-600 mb-4">
        ₱
        {product.price.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}
      </p>
      {product.description && (
        <p className="text-gray-600 mb-6">{product.description}</p>
      )}
      {product.details && (
        <div className="space-y-4">
          <div>
            <ul className="text-gray-600">
              {product.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="space-y-4 mt-5">
        <div>
          <span className="font-semibold">Category: </span>
          <span className="text-gray-600">{product.category}</span>
        </div>
        <div>
          <span className="font-semibold">Status: </span>
          <span
            className={product.isActive ? "text-green-600" : "text-red-600"}
          >
            {product.isActive ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* User status indicator */}
        {!user && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-800">
              Please{" "}
              <button
                onClick={handleLoginRedirect}
                className="font-semibold underline hover:text-blue-600"
              >
                login
              </button>{" "}
              to add items to cart
            </span>
          </div>
        )}
      </div>

      {/* Color Selection */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">
          Color:{" "}
          {selectedColor && (
            <span className="text-gray-600">({selectedColor})</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const isAvailable = isColorAvailable(color);
            const isSelected = selectedColor === color;

            return (
              <button
                key={color}
                onClick={() => isAvailable && handleColorClick(color)}
                disabled={!isAvailable}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  !isAvailable
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                    : isSelected
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>

        {/* Stock Display - shown below color selection */}
        {selectedColor && selectedSize && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            {isValidCombination() ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Stock Available:{" "}
                </span>
                <span
                  className={`font-semibold ${
                    currentStock > 10
                      ? "text-green-600"
                      : currentStock > 5
                      ? "text-yellow-600"
                      : currentStock > 0
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {currentStock} {currentStock === 1 ? "item" : "items"}
                </span>
                {currentStock === 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    This item is out of stock but can still be added to cart.
                    You can purchase it when stock becomes available.
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm font-medium text-red-600">
                This size/color combination is not available
              </span>
            )}
          </div>
        )}
      </div>

      {/* Size Selection */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">
            Size:{" "}
            {selectedSize && (
              <span className="text-gray-600">({selectedSize})</span>
            )}
          </h3>
          <div className="grid grid-cols-7 w-fit gap-0">
            {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => {
              const isAvailable = isSizeAvailable(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => isAvailable && handleSizeClick(size)}
                  disabled={!isAvailable}
                  className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium ${
                    size !== "XS" ? "-ml-px" : ""
                  } ${["XL", "XXL", "XXXL"].includes(size) ? "-mt-px" : ""} ${
                    !isAvailable
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-black text-white border-black z-10"
                      : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {size === "XXXL" ? (
                    <span className="text-xs">XXXL</span>
                  ) : (
                    size
                  )}
                </button>
              );
            })}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4 mt-4">
            {user && (
              <div className="flex items-center">
                <span className="text-sm font-medium mr-3 text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-200 bg-white text-gray-600 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center border-x border-gray-300 font-medium bg-gray-100 text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-200 bg-white text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleButtonClick}
              disabled={isButtonDisabled()}
              className={`px-6 py-2 rounded font-medium transition-colors duration-200 ${
                isButtonDisabled()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : !user
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {getButtonText()}
            </button>
          </div>

          {/* Add to Cart Message */}
          {addToCartMessage && (
            <div
              className={`mt-2 p-3 rounded-lg text-sm ${
                addToCartMessage.includes("Added")
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : addToCartMessage.includes("login")
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {addToCartMessage}
            </div>
          )}
        </div>

        {/* Size Chart */}
        <div className="size-chart my-10">
          <img
            src="/src/images/size_chart.png"
            alt="size-chart"
            className="w-80 h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
