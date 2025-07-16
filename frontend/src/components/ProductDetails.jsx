import React from "react";

const ProductDetails = ({
  product,
  selectedSize,
  quantity,
  handleSizeClick,
  handleQuantityChange,
  handleAddToCart,
}) => {
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
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <p>Size: {selectedSize}</p>
          <div className="grid grid-cols-7 w-fit">
            <button
              onClick={() => product.isActive && handleSizeClick("XS")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "XS"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              XS
            </button>
            <button
              onClick={() => product.isActive && handleSizeClick("S")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium -ml-px ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "S"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              S
            </button>
            <button
              onClick={() => product.isActive && handleSizeClick("M")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium -ml-px ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "M"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              M
            </button>
            <button
              onClick={() => product.isActive && handleSizeClick("L")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium -ml-px ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "L"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              L
            </button>
            <button
              onClick={() => product.isActive && handleSizeClick("XL")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium -mt-px ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "XL"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              XL
            </button>
            <button
              onClick={() => product.isActive && handleSizeClick("XXL")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-sm font-medium -ml-px -mt-px ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "XXL"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              XXL
            </button>
            <button
              onClick={() => product.isActive && handleSizeClick("XXXL")}
              disabled={!product.isActive}
              className={`w-12 h-12 border border-gray-300 transition-colors duration-200 flex items-center justify-center text-xs font-medium -ml-px -mt-px ${
                !product.isActive
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedSize === "XXXL"
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
            >
              XXXL
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center">
              <span
                className={`text-sm font-medium mr-3 ${
                  product.isActive ? "text-gray-700" : "text-gray-400"
                }`}
              >
                Quantity:
              </span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => product.isActive && handleQuantityChange(-1)}
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-200 ${
                    !product.isActive
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  disabled={!product.isActive || quantity <= 1}
                >
                  -
                </button>
                <span
                  className={`w-12 h-10 flex items-center justify-center border-x border-gray-300 font-medium ${
                    product.isActive
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => product.isActive && handleQuantityChange(1)}
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-200 ${
                    !product.isActive
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  disabled={!product.isActive}
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={product.isActive ? handleAddToCart : undefined}
              disabled={!product.isActive}
              className={`px-6 py-2 rounded font-medium transition-colors duration-200 ${
                product.isActive
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.isActive ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
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
