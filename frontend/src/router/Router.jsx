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
