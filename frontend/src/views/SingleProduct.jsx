import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductImageGallery from "../components/ProductImageGallery";
import ProductDetails from "../components/ProductDetails";
import Recommendation from "../sections/Recommendation";
import { cartApi } from "../services/cartApi";
import { useAuth } from "../App";

const SingleProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/product/${slug}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data) {
          throw new Error("Product not found");
        }

        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        // Instead of throwing error, set product to null to show "Product not found"
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Update stock when size and color are selected
  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const variant = product.variants?.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      const stock = variant ? variant.stock : 0;
      setCurrentStock(stock);
    } else {
      setCurrentStock(0);
    }
  }, [product, selectedSize, selectedColor]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setQuantity(1);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!user) {
      setAddToCartMessage("Please login to add items to cart");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (!selectedSize) {
      setAddToCartMessage("Please select a size first");
      setTimeout(() => setAddToCartMessage(""), 3000);
      return;
    }

    if (!selectedColor) {
      setAddToCartMessage("Please select a color first");
      setTimeout(() => setAddToCartMessage(""), 3000);
      return;
    }

    setAddingToCart(true);
    setAddToCartMessage("");

    try {
      const response = await cartApi.addToCart(
        product.id,
        selectedSize,
        selectedColor,
        quantity
      );

      if (response.success) {
        setAddToCartMessage(`Added ${quantity} item(s) to cart!`);

        // Reset quantity to 1 after successful add
        setQuantity(1);

        // Refresh cart count in header
        if (window.refreshCartCount) {
          window.refreshCartCount();
        }

        setTimeout(() => setAddToCartMessage(""), 3000);
      } else {
        setAddToCartMessage(response.message || "Failed to add item to cart");
        setTimeout(() => setAddToCartMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);

      // Check if it's an authentication error
      if (
        error.message.includes("Authentication required") ||
        error.message.includes("401")
      ) {
        setAddToCartMessage("Please login to add items to cart");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setAddToCartMessage(error.message || "Failed to add item to cart");
        setTimeout(() => setAddToCartMessage(""), 3000);
      }
    } finally {
      setAddingToCart(false);
    }
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

  // Get unique colors and sizes from variants
  const availableColors = [
    ...new Set(product.variants?.map((v) => v.color) || []),
  ];
  const availableSizes = [
    ...new Set(product.variants?.map((v) => v.size) || []),
  ];

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
          selectedColor={selectedColor}
          quantity={quantity}
          currentStock={currentStock}
          availableColors={availableColors}
          availableSizes={availableSizes}
          addingToCart={addingToCart}
          addToCartMessage={addToCartMessage}
          user={user}
          handleSizeClick={handleSizeClick}
          handleColorClick={handleColorClick}
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
