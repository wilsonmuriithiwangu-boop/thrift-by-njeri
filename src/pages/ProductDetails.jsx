import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  Minus,
  Plus,
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

  // Quantity selected by the CUSTOMER
  const [orderQuantity, setOrderQuantity] = useState(1);

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
      "Please confirm availability. ❤️";

    const whatsappLink =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);

    window.open(
      whatsappLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Share the actual dress photo
  const handleSharePhoto = async () => {
    if (!product.imageUrl) {
      alert("This dress does not have a photo to share.");
      return;
    }

    try {
      const response = await fetch(product.imageUrl);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `${product.name}.jpg`,
        {
          type: blob.type || "image/jpeg",
        }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: product.name,
          text:
            "Thrift by Njeri - " +
            product.name,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: product.name,
          text:
            "Thrift by Njeri - " +
            product.name,
          url: product.imageUrl,
        });
      } else {
        window.open(
          product.imageUrl,
          "_blank"
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(
          "Error sharing dress photo:",
          error
        );

        window.open(
          product.imageUrl,
          "_blank"
        );
      }
    }
  };

  return (
    <>
      {imageFullScreen && (
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
            ×
          </button>

          <img
            src={product.imageUrl}
            alt={product.name}
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

            {/* PRODUCT IMAGE */}

            <div
              className="product-details-image"
              onClick={() =>
                product.imageUrl &&
                setImageFullScreen(true)
              }
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

            {/* PRODUCT INFORMATION */}

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
                    ? "Only " +
                      quantity +
                      " left"
                    : quantity +
                      " available"}
                </p>
              )}

              {!isSoldOut && (
                <>
                  {/* CUSTOMER QUANTITY */}

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
                          orderQuantity >=
                          quantity
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

                  {/* ACTION BUTTONS */}

                  <div className="product-action-buttons">

                    <button
                      type="button"
                      className="primary-button add-to-cart-button"
                      onClick={
                        handleAddToCart
                      }
                    >
                      <ShoppingBag size={18} />

                      {addedToCart
                        ? "Added to Cart ✓"
                        : "Add to Cart"}
                    </button>

                    <button
                      type="button"
                      className="whatsapp-button"
                      onClick={
                        handleWhatsAppOrder
                      }
                    >
                      <MessageCircle size={18} />
                      I'm Interested
                    </button>

                  </div>

                  {/* PHOTO SHARING */}

                  {product.imageUrl && (
                    <button
                      type="button"
                      className="share-photo-button"
                      onClick={
                        handleSharePhoto
                      }
                    >
                      📷 Share Dress Photo
                    </button>
                  )}

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