import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const quantity = Number(product.quantity) || 0;
  const price = Number(product.price) || 0;

  const isSoldOut = quantity === 0;
  const isLowStock = quantity > 0 && quantity <= 2;

  return (
    <article className="product-card">
      <Link
        to={"/product/" + product.id}
        className="product-image-wrapper"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
          />
        ) : (
          <div className="product-image-placeholder">
            No Photo
          </div>
        )}

        {!isSoldOut && (
          <span className="new-badge">
            NEW
          </span>
        )}

        {isSoldOut && (
          <span className="sold-badge">
            SOLD OUT
          </span>
        )}
      </Link>

      <div className="product-info">
        <p className="product-category">
          {product.category || "Dresses"}
        </p>

        <h3>{product.name}</h3>

        <div className="product-price">
          KSh {price.toLocaleString()}
        </div>

        {!isSoldOut ? (
          <p
            className={
              isLowStock
                ? "stock low-stock"
                : "stock"
            }
          >
            {isLowStock
              ? "Only " + quantity + " left"
              : quantity + " available"}
          </p>
        ) : (
          <p className="stock sold-text">
            Currently unavailable
          </p>
        )}

        <Link
          to={"/product/" + product.id}
          className="details-button"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;