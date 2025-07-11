import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { name, price, imageUrl, slug } = product;

  // Format price to display with proper currency
  const formatPrice = (price) => {
    return `₱${price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Link
      to={`/product/${slug}`}
      className="inline-block no-underline text-inherit focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 focus:rounded-2xl"
    >
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden max-w-sm md:max-w-md lg:max-w-sm h-auto md:h-40 border-5 border-gray-50 cursor-pointer hover:-translate-y-1 group">
        <div className="relative w-full md:w-40 h-44 md:h-full flex-shrink-0 overflow-hidden bg-gray-50">
          <img
            src={imageUrl[0]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="flex-1 px-4 py-4 md:px-5 md:py-6 flex flex-col justify-center gap-2">
          <h3
            className="text-sm md:text-base font-semibold text-gray-800 m-0 leading-tight overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {name}
          </h3>
          <div className="text-base md:text-lg font-bold text-red-600 m-0">
            {formatPrice(price)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
