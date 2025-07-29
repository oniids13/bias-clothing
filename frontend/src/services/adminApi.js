const API_BASE_URL = "http://localhost:3000/api";

// Admin API service for fetching admin dashboard data
export const adminApi = {
  // Get complete admin dashboard statistics with growth data
  getCompleteAdminStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin statistics");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching complete admin stats:", error);
      return {
        success: false,
        message: error.message,
        data: {
          users: { total: 0, growthPercentage: 0 },
          products: { total: 0, growthPercentage: 0 },
          orders: {
            totalOrders: 0,
            totalRevenue: 0,
            growthPercentage: 0,
            revenueGrowthPercentage: 0,
          },
        },
      };
    }
  },

  // Get dashboard analytics for charts
  getDashboardAnalytics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard analytics");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      return {
        success: false,
        message: error.message,
        data: {
          revenueTrend: { labels: [], data: [] },
          orderStatusDistribution: { labels: [], data: [] },
          userGrowth: { labels: [], data: [] },
          salesByCategory: { labels: [], data: [] },
        },
      };
    }
  },

  // Get admin dashboard statistics
  getAdminStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin statistics");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Get total number of registered users (excluding admins)
  getTotalUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/count`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user count");
      }

      return {
        success: true,
        count: data.count,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching user count:", error);
      return {
        success: false,
        message: error.message,
        count: 0,
      };
    }
  },

  // Get total number of products
  getTotalProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/count`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch product count");
      }

      return {
        success: true,
        count: data.count,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching product count:", error);
      return {
        success: false,
        message: error.message,
        count: 0,
      };
    }
  },

  // Get all products for admin with pagination and filtering
  getAllProductsForAdmin: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append("page", options.page);
      if (options.limit) queryParams.append("limit", options.limit);
      if (options.category) queryParams.append("category", options.category);
      if (options.isActive !== undefined)
        queryParams.append("isActive", options.isActive);
      if (options.search) queryParams.append("search", options.search);

      const response = await fetch(
        `${API_BASE_URL}/admin/products?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      return {
        success: true,
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching products for admin:", error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  },

  // Get order statistics (total orders and sales)
  getOrderStats: async (dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.startDate)
        queryParams.append("startDate", dateRange.startDate);
      if (dateRange.endDate) queryParams.append("endDate", dateRange.endDate);

      const response = await fetch(
        `${API_BASE_URL}/order/admin/stats?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order statistics");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching order stats:", error);
      return {
        success: false,
        message: error.message,
        data: {
          totalOrders: 0,
          totalRevenue: 0,
          statusCounts: {},
          recentOrders: [],
        },
      };
    }
  },

  // Get recent activity for admin dashboard
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/activity?limit=${limit}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch recent activity");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  },

  // Get low stock items
  getLowStockItems: async (threshold = 5) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/order/admin/low-stock?threshold=${threshold}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch low stock items");
      }

      return {
        success: true,
        data: data.data,
        threshold: data.threshold,
      };
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  },

  // Get all users (admin function)
  getAllUsers: async (options = {}) => {
    try {
      const { page = 1, limit = 20, role, search } = options;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (role) queryParams.append("role", role);
      if (search) queryParams.append("search", search);

      const response = await fetch(
        `${API_BASE_URL}/admin/users?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      return {
        success: true,
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: null,
      };
    }
  },

  // Get all orders (admin function)
  getAllOrders: async (options = {}) => {
    try {
      const { page = 1, limit = 20, status, search } = options;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append("status", status);
      if (search) queryParams.append("search", search);

      const response = await fetch(
        `${API_BASE_URL}/order/admin/orders?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      return {
        success: true,
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: null,
      };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, adminNotes = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, adminNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Delete/Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error canceling order:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // New Product CRUD Functions

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Get single product for editing
  getProductById: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/products/${productId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch product");
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  },

  // Update an existing product
  updateProduct: async (productId, productData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Upload image to Cloudinary
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("images", imageFile);

      const response = await fetch(`${API_BASE_URL}/admin/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData, // Don't set Content-Type header, let browser set it
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Upload multiple images to Cloudinary
  uploadImages: async (imageFiles) => {
    try {
      const formData = new FormData();

      // Add all files to the form data
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${API_BASE_URL}/admin/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload images");
      }

      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : [data.data], // Ensure array format
        message: data.message,
      };
    } catch (error) {
      console.error("Error uploading images:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },
};
