import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Display = ({ title, endpoint }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:3000/api/product/${endpoint}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          // Handle new structured response format
          setProducts(data.data || []);
        } else {
          // Handle error response
          setError(data.message || "Failed to fetch products");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [endpoint]);

  if (loading) {
    return (
      <div className="container mx-auto px-5 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          {title}
        </h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-5 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          {title}
        </h1>
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        {title}
      </h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">No products available at this time.</p>
        </div>
      )}

      {title === "Featured Tees" && products.length > 0 && (
        <div className="flex justify-center py-10">
          <Link to="/shop">
            <button className="bg-black text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
              View All
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Display;
