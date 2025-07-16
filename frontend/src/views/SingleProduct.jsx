import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductImageGallery from "../components/ProductImageGallery";
import ProductDetails from "../components/ProductDetails";
import Recommendation from "../sections/Recommendation";

const SingleProduct = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/product/${slug}`
        );
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    // Add to cart logic here
    console.log("Adding to cart:", {
      product: product.name,
      size: selectedSize,
      quantity,
    });
  };

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
            isOutOfStock={!product.isActive}
          />
        </div>

        {/* Product Details */}
        <ProductDetails
          product={product}
          selectedSize={selectedSize}
          quantity={quantity}
          handleSizeClick={handleSizeClick}
          handleQuantityChange={handleQuantityChange}
          handleAddToCart={handleAddToCart}
        />
      </div>
      {/* Recommendation */}
      <Recommendation />
    </div>
  );
};

export default SingleProduct;
