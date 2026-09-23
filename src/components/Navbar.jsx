import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../CartContext";
import logo from "../assets/logo.jpg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link
          to="/"
          className="logo-link"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={logo}
            alt="Thrift by Njeri"
            className="navbar-logo"
          />
        </Link>

        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link to="/shop" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>

          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>

          <Link
            to="/how-to-order"
            onClick={() => setMenuOpen(false)}
          >
            How to Order
          </Link>

          <Link to="/admin" onClick={() => setMenuOpen(false)}>
            Admin
          </Link>
        </nav>

        <div className="navbar-actions">
          <Link
            to="/cart"
            className="bag-button"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <ShoppingBag size={20} />

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;