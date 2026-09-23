import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../CartContext";
import logo from "../assets/logo.jpg";

function Navbar() {
const [menuOpen, setMenuOpen] = useState(false);
const { cartCount } = useCart();

const closeMenu = () => {
setMenuOpen(false);
};

return (
<header className="navbar">
<div className="navbar-inner">
<Link to="/" className="logo-link" onClick={closeMenu} >
<img src={logo} alt="Thrift by Njeri" className="navbar-logo" />
</Link>

    <nav
      className={
        menuOpen
          ? "nav-links active"
          : "nav-links"
      }
    >
      <Link to="/" onClick={closeMenu}>
        Home
      </Link>

      <Link to="/shop" onClick={closeMenu}>
        Shop
      </Link>

      <Link to="/about" onClick={closeMenu}>
        About
      </Link>

      <Link
        to="/how-to-order"
        onClick={closeMenu}
      >
        How to Order
      </Link>

      <Link to="/admin" onClick={closeMenu}>
        Admin
      </Link>
    </nav>

    <div className="navbar-actions">
      <Link
        to="/cart"
        className="bag-button"
        aria-label={
          "Shopping cart with " +
          cartCount +
          " items"
        }
        onClick={closeMenu}
      >
        <ShoppingBag size={20} />

        {cartCount > 0 && (
          <span className="cart-count">
            {cartCount}
          </span>
        )}
      </Link>

      <button
        type="button"
        className="menu-button"
        onClick={() =>
          setMenuOpen((current) => !current)
        }
        aria-label={
          menuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={menuOpen}
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