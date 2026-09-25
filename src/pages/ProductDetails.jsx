import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
ArrowLeft,
MessageCircle,
ShoppingBag,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../CartContext";

const WHATSAPP_NUMBER = "254742095218";

function ProductDetails() {
const { id } = useParams();

const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [addedToCart, setAddedToCart] = useState(false);
const [imageFullScreen, setImageFullScreen] = useState(false);

const { addToCart } = useCart();

useEffect(() => {
const loadProduct = async () => {
try {
const productRef = doc(db, "products", id);
const productSnapshot = await getDoc(productRef);

    if (productSnapshot.exists()) {
      setProduct({
        id: productSnapshot.id,
        ...productSnapshot.data(),
      });
    } else {
      setProduct(null);
    }
  } catch (error) {
    console.error("Error loading product:", error);
    setProduct(null);
  } finally {
    setLoading(false);
  }
};

loadProduct();

}, [id]);

if (loading) {
return (
<>
<Navbar />

    <main className="page">
      <div className="loading-message">
        Loading dress...
      </div>
    </main>
  </>
);

}

if (!product) {
return (
<>
<Navbar />

    <main className="page">
      <section className="product-not-found">
        <h1>Product not found</h1>

        <p>
          Sorry, this dress could not be found.
        </p>

        <Link
          to="/shop"
          className="details-button"
        >
          Back to Shop
        </Link>
      </section>
    </main>
  </>
);

}

const quantity = Number(product.quantity) || 0;
const price = Number(product.price) || 0;

const isSoldOut = quantity === 0;

const whatsappMessage = encodeURIComponent(
"Hello Thrift by Njeri, I'm interested in the " +
product.name +
" priced at KSh " +
price.toLocaleString() +
". Is it still available?"
);

const whatsappLink =
"https://wa.me/" +
WHATSAPP_NUMBER +
"?text=" +
whatsappMessage;

const handleAddToCart = () => {
if (isSoldOut) {
alert("Sorry, this dress is sold out.");
return;
}

addToCart(product);
setAddedToCart(true);

setTimeout(() => {
  setAddedToCart(false);
}, 2000);

};

return (
<>
{imageFullScreen && (
  <div
    className="fullscreen-image-viewer"
    onClick={() => setImageFullScreen(false)}
  >
    <button
      type="button"
      className="fullscreen-close"
      onClick={() => setImageFullScreen(false)}
      aria-label="Close image"
    >
      ×
    </button>

    <img
      src={product.imageUrl}
      alt={product.name}
      onClick={(event) => event.stopPropagation()}
    />
  </div>
)}
<Navbar />

  <main className="page">
    <section className="product-details">
      <Link
        to="/shop"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Back to Shop
      </Link>

      <div className="product-details-grid">
        <div
          className="product-details-image"
          onClick={() => setImageFullScreen(true)}
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
        </div>

        <div className="product-details-info">
          <p className="section-label">
            {product.category || "DRESSES"}
          </p>

          <h1>{product.name}</h1>

          <div className="product-details-price">
            KSh {price.toLocaleString()}
          </div>

          <p className="product-details-description">
            {product.description}
          </p>

          {isSoldOut ? (
            <p className="stock sold-text">
              Currently unavailable
            </p>
          ) : (
            <p className="stock">
              {quantity <= 2
                ? "Only " + quantity + " left"
                : quantity + " available"}
            </p>
          )}

          {!isSoldOut && (
            <div className="product-action-buttons">
              <button
                type="button"
                className="primary-button add-to-cart-button"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} />

                {addedToCart
                  ? "Added to Cart ✓"
                  : "Add to Cart"}
              </button>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-button"
              >
                <MessageCircle size={18} />
                I'm Interested
              </a>
            </div>
          )}

          {isSoldOut && (
            <Link
              to="/shop"
              className="details-button"
            >
              Browse Other Dresses
            </Link>
          )}
        </div>
      </div>
    </section>
  </main>
</>

);
}

export default ProductDetails;