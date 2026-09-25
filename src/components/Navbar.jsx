import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../CartContext";

function Navbar() {
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Logo - hidden on phones */}
        <Link to="/" className="logo-link">
          <img
            src="/logo.jpg"
            alt="Thrift by Njeri"
            className="navbar-logo"
          />
        </Link>

        {/* Navigation */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/how-to-order">How to Order</Link>
          <Link to="/admin">Admin</Link>
        </nav>

        {/* Shopping Bag */}
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
        </div>

      </div>
    </header>
  );
}

export default Navbar;