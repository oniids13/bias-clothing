import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductImageGallery from "../components/ProductImageGallery";

const SingleProduct = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/product/${slug}`
        );
        const data = await response.json();
        setProduct(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <div>
          <ProductImageGallery
            images={product.imageUrl}
            productName={product.name}
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-red-600 mb-4">
            ₱
            {product.price.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </p>
          {product.description && (
            <p className="text-gray-600 mb-6">{product.description}</p>
          )}
          <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
