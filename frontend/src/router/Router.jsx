import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import App from "../App";
import ErrorPage from "../views/ErrorPage";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import Home from "../views/Home";
import About from "../views/About";
import Shop from "../views/Shop";
import Cart from "../views/Cart";
import Profile from "../views/Profile";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route index element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

export default router;
