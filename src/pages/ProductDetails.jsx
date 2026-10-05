import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  Minus,
  Plus,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../CartContext";
import "../App.css";

const WHATSAPP_NUMBER = "254742095218";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageFullScreen, setImageFullScreen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("front");

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

  const frontImage = product.imageUrl || "";
  const backImage = product.backImageUrl || "";

  const currentImage =
    selectedImage === "back" && backImage
      ? backImage
      : frontImage;

  const orderTotal = price * orderQuantity;

  const handleDecreaseQuantity = () => {
    setOrderQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const handleIncreaseQuantity = () => {
    setOrderQuantity((current) =>
      Math.min(quantity, current + 1)
    );
  };

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

  const handleWhatsAppOrder = () => {
  if (isSoldOut) {
    alert("Sorry, this dress is sold out.");
    return;
  }

  const dressImage = currentImage || product.imageUrl;

  const message =
    "Hello Thrift by Njeri! 👋\n\n" +
    "I'd like to order:\n" +
    product.name +
    "\n" +
    "Quantity: " +
    orderQuantity +
    "\n" +
    "Total: KSh " +
    orderTotal.toLocaleString() +
    "\n\n" +
    "Dress photo:\n" +
    dressImage +
    "\n\n" +
    "Please confirm availability. ❤️";

  const whatsappLink =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.location.href = whatsappLink;
};

  return (
    <>
      {imageFullScreen && currentImage && (
        <div
          className="fullscreen-image-viewer"
          onClick={() =>
            setImageFullScreen(false)
          }
        >
          <button
            type="button"
            className="fullscreen-close"
            onClick={() =>
              setImageFullScreen(false)
            }
            aria-label="Close image"
          >
            <X size={24} />
          </button>

          <img
            src={currentImage}
            alt={
              selectedImage === "back"
                ? `${product.name} back`
                : `${product.name} front`
            }
            onClick={(event) =>
              event.stopPropagation()
            }
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

            <div className="product-gallery">

              <div
                className="product-details-image"
                onClick={() =>
                  currentImage &&
                  setImageFullScreen(true)
                }
              >
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={
                      selectedImage === "back"
                        ? `${product.name} back`
                        : `${product.name} front`
                    }
                  />
                ) : (
                  <div className="product-image-placeholder">
                    No Photo
                  </div>
                )}
              </div>

              {frontImage && backImage && (
                <div className="product-thumbnails">

                  <button
                    type="button"
                    className={
                      selectedImage === "front"
                        ? "product-thumbnail active"
                        : "product-thumbnail"
                    }
                    onClick={() =>
                      setSelectedImage("front")
                    }
                    aria-label="View front photo"
                  >
                    <img
                      src={frontImage}
                      alt="Front of dress"
                    />

                    <span>Front</span>
                  </button>

                  <button
                    type="button"
                    className={
                      selectedImage === "back"
                        ? "product-thumbnail active"
                        : "product-thumbnail"
                    }
                    onClick={() =>
                      setSelectedImage("back")
                    }
                    aria-label="View back photo"
                  >
                    <img
                      src={backImage}
                      alt="Back of dress"
                    />

                    <span>Back</span>
                  </button>

                </div>
              )}

              {currentImage && (
                <p className="image-view-hint">
                  Click the photo to view it fullscreen.
                </p>
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
                <>
                  <div className="order-quantity-section">

                    <p className="quantity-label">
                      Quantity
                    </p>

                    <div className="order-quantity-controls">

                      <button
                        type="button"
                        onClick={
                          handleDecreaseQuantity
                        }
                        disabled={
                          orderQuantity <= 1
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={17} />
                      </button>

                      <span>
                        {orderQuantity}
                      </span>

                      <button
                        type="button"
                        onClick={
                          handleIncreaseQuantity
                        }
                        disabled={
                          orderQuantity >= quantity
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={17} />
                      </button>

                    </div>

                    <p className="order-total-preview">
                      Total:{" "}
                      <strong>
                        KSh{" "}
                        {orderTotal.toLocaleString()}
                      </strong>
                    </p>

                  </div>

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

                    <button
                      type="button"
                      className="whatsapp-button"
                      onClick={handleWhatsAppOrder}
                    >
                      <MessageCircle size={18} />
                      I'm Interested
                    </button>

                  </div>
                </>
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