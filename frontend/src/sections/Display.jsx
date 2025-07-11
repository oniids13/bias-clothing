import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Display = ({ title, endpoint }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(
        `http://localhost:3000/api/product/${endpoint}`
      );
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-5 py-8">
      <h1 className="text-3xl font-bold text-center mb-4 py-5">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {title === "Featured Tees" && (
        <div className="flex justify-center py-10">
          <Link to="/shop">
            <button className="bg-black text-white px-4 py-2 rounded-md">
              View All
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Display;
