import { apiFetch } from "./httpClient";

// Admin API service for fetching admin dashboard data
export const adminApi = {
  // Get complete admin dashboard statistics with growth data
  getCompleteAdminStats: async () => {
    try {
      const data = await apiFetch(`/admin/stats`, { method: "GET" });

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
      const data = await apiFetch(`/admin/analytics`, { method: "GET" });

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
      const data = await apiFetch(`/admin/stats`, { method: "GET" });

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
      const data = await apiFetch(`/admin/users/count`, { method: "GET" });

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
      const data = await apiFetch(`/admin/products/count`, { method: "GET" });

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

      const data = await apiFetch(`/admin/products?${queryParams}`, {
        method: "GET",
      });

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

      const data = await apiFetch(`/order/admin/stats?${queryParams}`, {
        method: "GET",
      });

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
      const data = await apiFetch(`/admin/activity?limit=${limit}`, {
        method: "GET",
      });

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
      const data = await apiFetch(`/order/stock/low?threshold=${threshold}`, {
        method: "GET",
      });

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

      const data = await apiFetch(`/admin/users?${queryParams}`, {
        method: "GET",
      });

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

      const data = await apiFetch(`/order/admin/all?${queryParams}`, {
        method: "GET",
      });

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
      const data = await apiFetch(`/order/${orderId}/status`, {
        method: "PUT",
        body: { status, adminNotes },
      });

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
      const data = await apiFetch(`/order/${orderId}`, { method: "DELETE" });

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
      const data = await apiFetch(`/admin/products`, {
        method: "POST",
        body: productData,
      });

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
      const data = await apiFetch(`/admin/products/${productId}`, {
        method: "GET",
      });

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
      const data = await apiFetch(`/admin/products/${productId}`, {
        method: "PUT",
        body: productData,
      });

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
      const data = await apiFetch(`/admin/products/${productId}`, {
        method: "DELETE",
      });

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

      const response = await fetch(`/api/admin/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData, // Don't set Content-Type header, let browser set it
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
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

      const response = await fetch(`/api/admin/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
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

  // Get inventory data for inventory management
  getInventoryData: async () => {
    try {
      const data = await apiFetch(`/admin/inventory`, { method: "GET" });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      return {
        success: false,
        message: error.message,
        data: {
          products: [],
          stats: {
            totalProducts: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            totalValue: 0,
            averageStockLevel: 0,
          },
        },
      };
    }
  },

  // Update variant stock level
  updateVariantStock: async (variantId, stock, notes = "") => {
    try {
      const data = await apiFetch(`/admin/inventory/variant/${variantId}`, {
        method: "PUT",
        body: { stock, notes },
      });

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error("Error updating stock:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Get inventory analytics
  getInventoryAnalytics: async () => {
    try {
      const data = await apiFetch(`/admin/inventory/analytics`, {
        method: "GET",
      });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching inventory analytics:", error);
      return {
        success: false,
        message: error.message,
        data: {
          lowStockProducts: [],
          outOfStockProducts: [],
          stockDistribution: [],
          categoryStockLevels: [],
        },
      };
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (period = "monthly", { month, year } = {}) => {
    try {
      const params = new URLSearchParams({ period });
      if (month) params.append("month", String(month));
      if (year) params.append("year", String(year));

      const data = await apiFetch(
        `/admin/sales/analytics?${params.toString()}`,
        { method: "GET" }
      );

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      return {
        success: false,
        message: error.message,
        data: {
          period,
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          dailySales: [],
          topProducts: [],
          topCategories: [],
          topCustomers: [],
          topLocations: [],
        },
      };
    }
  },

  // Customer Management
  getAllCustomers: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append("page", options.page);
      if (options.limit) queryParams.append("limit", options.limit);
      if (options.search) queryParams.append("search", options.search);

      const data = await apiFetch(`/admin/customers?${queryParams}`, {
        method: "GET",
      });

      return {
        success: true,
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: null,
      };
    }
  },

  getCustomerDetails: async (customerId) => {
    try {
      const data = await apiFetch(`/admin/customers/${customerId}`, {
        method: "GET",
      });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  },

  deleteCustomer: async (customerId) => {
    try {
      const data = await apiFetch(`/admin/customers/${customerId}`, {
        method: "DELETE",
      });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error deleting customer:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  getCustomerStats: async () => {
    try {
      const data = await apiFetch(`/admin/customers/stats`, { method: "GET" });

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      return {
        success: false,
        message: error.message,
        data: {
          totalCustomers: 0,
          newCustomers: 0,
          returningCustomers: 0,
          totalRevenue: 0,
        },
      };
    }
  },
};
