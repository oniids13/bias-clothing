import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

// Material UI Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay for shop

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all products on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both active and inactive products
      const [activeResponse, inactiveResponse] = await Promise.all([
        fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/product/active`
        ),
        fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/product/inactive`
        ),
      ]);

      const [activeData, inactiveData] = await Promise.all([
        activeResponse.json(),
        inactiveResponse.json(),
      ]);

      const activeProducts = activeData.success ? activeData.data : [];
      const inactiveProducts = inactiveData.success ? inactiveData.data : [];

      // Mark products with their status for filtering
      const markedActiveProducts = activeProducts.map((product) => ({
        ...product,
        status: "active",
      }));
      const markedInactiveProducts = inactiveProducts.map((product) => ({
        ...product,
        status: "inactive",
      }));

      const combinedProducts = [
        ...markedActiveProducts,
        ...markedInactiveProducts,
      ];
      setAllProducts(combinedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (products) => {
    let filtered = [...products];

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearchTerm(searchTerm); // Immediately set the debounced term
  };

  const getUniqueCategories = () => {
    const categories = allProducts.map((product) => product.category);
    return [...new Set(categories)];
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterCategory("");
  };

  // Get filtered products for each section
  const activeProducts = filterProducts(
    allProducts.filter((product) => product.status === "active")
  );
  const inactiveProducts = filterProducts(
    allProducts.filter((product) => product.status === "inactive")
  );

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

  if (error) {
    return (
      <div className="container mx-auto px-5 py-8">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllProducts}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Component for rendering a product section
  const ProductSection = ({ title, products, showDivider = true }) => (
    <div className={`container mx-auto px-5 ${showDivider ? "py-8" : "pb-8"}`}>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        {title}
        {(debouncedSearchTerm || filterCategory) && (
          <span className="text-lg font-normal text-gray-600 ml-2">
            ({products.length} {products.length === 1 ? "result" : "results"})
          </span>
        )}
      </h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          {debouncedSearchTerm || filterCategory ? (
            <div>
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">
                No products found in this section
              </p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              No products available in this section at this time.
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Search and Filter Section */}
      <div className="container mx-auto px-5 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Shop</h1>
          <p className="text-gray-600">
            Discover our amazing collection of products
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FilterListIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(debouncedSearchTerm || filterCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Products Section */}
      <ProductSection title="All Products" products={activeProducts} />

      {/* Inactive Products Section */}
      <ProductSection
        title="Out of Stock"
        products={inactiveProducts}
        showDivider={false}
      />
    </div>
  );
};

export default Shop;
