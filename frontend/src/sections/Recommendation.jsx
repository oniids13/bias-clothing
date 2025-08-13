import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";

const Recommendation = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth >= 1280
      ? 3
      : window.innerWidth >= 1024
      ? 3
      : window.innerWidth >= 768
      ? 2
      : 2
  );

  // Track breakpoint for responsive carousel
  useEffect(() => {
    const handleResize = () => {
      const perPage =
        window.innerWidth >= 1280
          ? 3
          : window.innerWidth >= 1024
          ? 3
          : window.innerWidth >= 768
          ? 2
          : 2;
      setItemsPerPage(perPage);
      setCurrentPage(0);
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

  // Build pages for responsive carousel
  const pages = useMemo(() => {
    const chunkSize = itemsPerPage;
    const pages = [];
    for (let i = 0; i < products.length; i += chunkSize) {
      pages.push(products.slice(i, i + chunkSize));
    }
    return pages;
  }, [products, itemsPerPage]);

  const totalPages = pages.length;
  const canSlide = totalPages > 1;

  const next = () =>
    setCurrentPage((p) => (totalPages ? (p + 1) % totalPages : 0));
  const prev = () =>
    setCurrentPage((p) => (totalPages ? (p - 1 + totalPages) % totalPages : 0));

  // Dynamic grid classes based on itemsPerPage
  const getGridClass = () => {
    switch (itemsPerPage) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        You might also like
      </h2>

      <div className="relative max-w-7xl mx-auto">
        {/* Responsive manual carousel with arrows on all breakpoints */}
        <div className="overflow-hidden mx-12">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentPage * 100}%)`,
            }}
          >
            {pages.map((page, pageIdx) => (
              <div key={`page-${pageIdx}`} className="w-full flex-shrink-0">
                <div className={`grid ${getGridClass()} gap-8 px-6`}>
                  {page.map((p, idx) => (
                    <div
                      key={p.id || `${pageIdx}-${idx}`}
                      className="flex justify-center"
                    >
                      <div className="w-full max-w-xs">
                        <ProductCard product={p} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {canSlide && (
          <>
            <button
              aria-label="Previous"
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl z-10 border"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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
              aria-label="Next"
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl z-10 border"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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
