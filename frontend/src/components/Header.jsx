import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="flex justify-between items-center">
        <img src="/src/images/bias_logo.png" alt="logo" />
        <div>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Shop</Link>
        </div>
        <div>
          <Link to="/cart">
            <ShoppingCartIcon />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
