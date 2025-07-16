import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

const Recommendation = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Number of products to show per view on different screen sizes
  const getProductsPerView = () => {
    if (window.innerWidth >= 1024) return 4; // Desktop
    if (window.innerWidth >= 768) return 3; // Tablet
    return 2; // Mobile
  };

  const [productsPerView, setProductsPerView] = useState(getProductsPerView());

  useEffect(() => {
    const handleResize = () => {
      setProductsPerView(getProductsPerView());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/product/active"
        );
        const data = await response.json();
        // Limit to 8 products for recommendations (they're already active from the endpoint)
        const recommendedProducts = data.slice(0, 8);
        setProducts(recommendedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + productsPerView >= products.length ? 0 : prev + productsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.max(0, products.length - productsPerView)
        : Math.max(0, prev - productsPerView)
    );
  };

  const canGoNext = currentIndex + productsPerView < products.length;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          You might also like
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-64 h-40 bg-gray-200 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          You might also like
        </h2>
        <p className="text-gray-600">No recommended products available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        You might also like
      </h2>

      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-4"
            style={{
              transform: `translateX(-${
                currentIndex * (100 / productsPerView)
              }%)`,
              width: `${(products.length / productsPerView) * 100}%`,
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="flex-shrink-0"
                style={{ width: `${100 / products.length}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {canGoPrev && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Previous products"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {canGoNext && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Next products"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
