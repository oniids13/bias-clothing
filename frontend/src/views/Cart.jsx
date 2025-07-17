import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { cartApi } from "../services/cartApi";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCartTotal();
      if (response.success) {
        setCartData(response);
      } else {
        setError(response.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    try {
      const response = await cartApi.updateCartItem(cartItemId, newQuantity);
      if (response.success) {
        // Refresh cart data
        await fetchCart();
        // Refresh header cart count
        if (window.refreshCartCount) {
          window.refreshCartCount();
        }
      } else {
        setError(response.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      setError("Failed to update item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    try {
      const response = await cartApi.removeFromCart(cartItemId);
      if (response.success) {
        // Refresh cart data
        await fetchCart();
        // Refresh header cart count
        if (window.refreshCartCount) {
          window.refreshCartCount();
        }
      } else {
        setError(response.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      setError("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page (to be implemented)
    navigate("/checkout");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600 mb-4">
          You need to be logged in to view your cart.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={fetchCart}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    availableItems = [],
    unavailableItems = [],
    subtotal = 0,
  } = cartData || {};

  if (availableItems.length === 0 && unavailableItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-4">
          Add some items to your cart to get started.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-center mb-8">Shopping Cart</h1>

      {/* Available Items */}
      {availableItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            {/* Cart Items */}
            {availableItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 items-center"
              >
                {/* Product Info */}
                <div className="col-span-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.imageUrl[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.size} • {item.color}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-600 hover:text-red-800 mt-1"
                        disabled={updatingItems.has(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-center">
                  ₱{item.product.price.toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={
                        updatingItems.has(item.id) || item.quantity <= 1
                      }
                      className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">
                      {updatingItems.has(item.id) ? "..." : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        updatingItems.has(item.id) ||
                        item.quantity >= item.currentStock
                      }
                      className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  {item.currentStock < 10 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {item.currentStock} left
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="col-span-2 text-center font-medium">
                  ₱{(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal and Checkout */}
          <div className="mt-6 flex justify-end">
            <div className="w-80">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Subtotal</span>
                <span className="text-lg font-bold">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Stock Items */}
      {unavailableItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Out of Stock Items
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-red-200 bg-red-100 font-semibold">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* Out of Stock Items */}
            {unavailableItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-red-200 last:border-b-0 items-center opacity-60"
              >
                {/* Product Info */}
                <div className="col-span-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.imageUrl[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded grayscale"
                    />
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.size} • {item.color}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-600 hover:text-red-800 mt-1"
                        disabled={updatingItems.has(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-center">
                  ₱{item.product.price.toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 bg-gray-200 rounded text-sm">
                    {item.quantity}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                    Out of Stock
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> These items are currently out of stock and
              cannot be purchased. They will be automatically removed from your
              cart when stock becomes available again or you can remove them
              manually.
            </p>
          </div>
        </div>
      )}

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Cart;
