import { useState } from "react";
import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="p-10 relative">
      <div className="flex justify-between items-center">
        <img className="w-30" src="/src/images/bias_logo.png" alt="logo" />

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex gap-10 font-bold">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Shop</Link>
        </div>

        {/* Desktop Cart - Hidden on mobile */}
        <div className="hidden md:block">
          <Link to="/cart">
            <ShoppingCartIcon />
          </Link>
        </div>

        {/* Hamburger Menu Button - Visible on mobile */}
        <button
          onClick={toggleMenu}
          className="md:hidden z-50 relative"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Small Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-4 bg-white shadow-lg border rounded-lg md:hidden z-40 w-48">
          <nav className="flex flex-col p-3 space-y-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="font-bold hover:text-gray-600 transition-colors py-2 px-3 rounded hover:bg-gray-100"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="font-bold hover:text-gray-600 transition-colors py-2 px-3 rounded hover:bg-gray-100"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className="font-bold hover:text-gray-600 transition-colors py-2 px-3 rounded hover:bg-gray-100"
            >
              Shop
            </Link>
            <hr className="my-1" />
            <Link
              to="/cart"
              onClick={closeMenu}
              className="font-bold hover:text-gray-600 transition-colors flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100"
            >
              <ShoppingCartIcon fontSize="small" />
              Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
