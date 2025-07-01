import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Header = () => {
  return (
    <header className="p-4">
      <div className="flex justify-around items-center">
        <img className="w-30" src="/src/images/bias_logo.png" alt="logo" />
        <div className="flex gap-10 font-bold">
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
