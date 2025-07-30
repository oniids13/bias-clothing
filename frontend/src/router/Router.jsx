import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "../App";
import ErrorPage from "../views/ErrorPage";
import ProtectedRoute, {
  AdminProtectedRoute,
} from "../components/ProtectedRoute";

// Pages
import Home from "../views/Home";
import About from "../views/About";
import Shop from "../views/Shop";
import Cart from "../views/Cart";
import Profile from "../views/Profile";
import Login from "../views/Login";
import Register from "../views/Register";
import SingleProduct from "../views/SingleProduct";
import Checkout from "../views/Checkout";

// Admin module
import Admin from "../admin module/Admin";
import Dashboard from "../admin module/Dashboard";
import ProductManagement from "../admin module/ProductManagement";
import InventoryManagement from "../admin module/InventoryManagement";
import OrderManagement from "../admin module/OrderManagement";
import SalesAnalytics from "../admin module/SalesAnalytics";
import CustomerManagement from "../admin module/CustomerManagement";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route index element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/product/:slug" element={<SingleProduct />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminProtectedRoute>
            <OrderManagement />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/test"
        element={
          <AdminProtectedRoute>
            <div>Test Route Working</div>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/customer"
        element={
          <AdminProtectedRoute>
            <CustomerManagement />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminProtectedRoute>
            <SalesAnalytics />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminProtectedRoute>
            <InventoryManagement />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <Dashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminProtectedRoute>
            <ProductManagement />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        }
      />
    </Route>
  )
);

export default router;
