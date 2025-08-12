import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

const Recommendation = () => {
  const [products, setProducts] = useState([]);
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
      // Reset to first slide when screen size changes
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/product/active`
        );
        const data = await response.json();

        if (response.ok && data.success && data.data) {
          // Handle new structured response format
          // Limit to 8 products for recommendations (they're already active from the endpoint)
          const recommendedProducts = data.data.slice(0, 8);
          setProducts(recommendedProducts);
        } else {
          console.error("Failed to fetch products:", data.message);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
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

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        You might also like
      </h2>

      <div className="relative px-8">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${
                (currentIndex * 100) / productsPerView
              }%)`,
              width: `${(products.length * 100) / productsPerView}%`,
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / products.length}%` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {products.length > productsPerView && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 ${
                !canGoPrev
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              aria-label="Previous products"
              disabled={!canGoPrev}
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

            <button
              onClick={nextSlide}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 ${
                !canGoNext
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              aria-label="Next products"
              disabled={!canGoNext}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
