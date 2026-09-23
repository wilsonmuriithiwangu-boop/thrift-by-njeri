import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  Check,
  ListChecks,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../CartContext";

const WHATSAPP_NUMBER = "254742095218";

function Cart() {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectMore, setSelectMore] = useState(false);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.cartQuantity,
    0
  );

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const selectedTotal = selectedCartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.cartQuantity,
    0
  );

  const selectedQuantity = selectedCartItems.reduce(
    (total, item) => total + item.cartQuantity,
    0
  );

  const handleSelectItem = (productId) => {
    if (selectMore) {
      setSelectedItems((current) => {
        if (current.includes(productId)) {
          return current.filter((id) => id !== productId);
        }

        return [...current, productId];
      });

      return;
    }

    setSelectedItems([productId]);
  };

  const handleToggleSelectMore = () => {
    setSelectMore((current) => !current);

    if (!selectMore && selectedItems.length === 0 && cartItems.length > 0) {
      setSelectedItems([cartItems[0].id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);

    setSelectedItems((current) =>
      current.filter((id) => id !== productId)
    );
  };

  const handleProceedToOrder = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select a dress to proceed with your order.");
      return;
    }

    let message = "Hello Thrift by Njeri! 👋\n\n";

    message += "I would like to order the following dress";
    message += selectedCartItems.length > 1 ? "es:\n\n" : ":\n\n";

    selectedCartItems.forEach((item, index) => {
      const price = Number(item.price || 0);
      const itemTotal = price * item.cartQuantity;

      message +=
        index +
        1 +
        ". " +
        item.name +
        "\n" +
        "Quantity: " +
        item.cartQuantity +
        "\n" +
        "Price: KSh " +
        price.toLocaleString() +
        "\n" +
        "Subtotal: KSh " +
        itemTotal.toLocaleString() +
        "\n\n";
    });

    message +=
      "Total: KSh " +
      selectedTotal.toLocaleString() +
      "\n\n";

    message +=
      "Please confirm availability and let me know how I can complete the order. Thank you! ❤️";

    const whatsappLink =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);

    window.open(whatsappLink, "_blank");
  };

  return (
    <>
      <Navbar />

      <main className="page cart-page">
        <section className="cart-header">
          <div>
            <p className="section-label">YOUR SHOPPING BAG</p>

            <h1>Your Cart</h1>

            <p>
              Choose the dress you want to order.
            </p>
          </div>

          <div className="cart-header-icon">
            <ShoppingBag size={30} />
          </div>
        </section>

        {cartItems.length === 0 ? (
          <section className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={42} />
            </div>

            <p className="section-label">NOTHING HERE YET</p>

            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't found your next favourite dress yet.
            </p>

            <Link to="/shop" className="primary-button">
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>
          </section>
        ) : (
          <section className="cart-layout">
            <div className="cart-main">

              <div className="cart-selection-bar">

                <div>
                  <h2>
                    Your Dresses
                  </h2>

                  <p>
                    {totalItems}{" "}
                    {totalItems === 1 ? "item" : "items"} in your cart
                  </p>
                </div>

                <div className="cart-selection-actions">

                  <button
                    type="button"
                    className={
                      selectMore
                        ? "select-more-button active"
                        : "select-more-button"
                    }
                    onClick={handleToggleSelectMore}
                  >
                    <ListChecks size={17} />

                    {selectMore
                      ? "Select One"
                      : "Select More"}
                  </button>

                  {selectMore && (
                    <button
                      type="button"
                      className="select-all-button"
                      onClick={handleSelectAll}
                    >
                      {selectedItems.length === cartItems.length
                        ? "Clear All"
                        : "Select All"}
                    </button>
                  )}

                </div>

              </div>

              <div className="cart-items">

                {cartItems.map((item) => {
                  const price = Number(item.price || 0);
                  const itemTotal = price * item.cartQuantity;
                  const stock = Number(item.quantity || 0);

                  const isSelected = selectedItems.includes(item.id);

                  return (
                    <article
                      className={
                        isSelected
                          ? "cart-item selected"
                          : "cart-item"
                      }
                      key={item.id}
                      onClick={() => handleSelectItem(item.id)}
                    >

                      <div className="cart-select-box">
                        <div
                          className={
                            isSelected
                              ? "cart-checkbox checked"
                              : "cart-checkbox"
                          }
                        >
                          {isSelected && <Check size={15} />}
                        </div>
                      </div>

                      <Link
                        to={"/product/" + item.id}
                        className="cart-item-image"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                          />
                        ) : (
                          <div className="no-image">
                            No Photo
                          </div>
                        )}
                      </Link>

                      <div className="cart-item-details">

                        <div className="cart-item-heading">

                          <div>
                            <p className="product-category">
                              {item.category || "Dresses"}
                            </p>

                            <h3>{item.name}</h3>
                          </div>

                          <button
                            type="button"
                            className="remove-cart-icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemove(item.id);
                            }}
                            aria-label={
                              "Remove " + item.name
                            }
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                        <p className="cart-item-price">
                          KSh {price.toLocaleString()}
                        </p>

                        <div className="cart-item-bottom">

                          <div>
                            <p className="quantity-label">
                              Quantity
                            </p>

                            <div
                              className="cart-item-controls"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.id,
                                    item.cartQuantity - 1
                                  )
                                }
                                disabled={
                                  item.cartQuantity <= 1
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus size={15} />
                              </button>

                              <span>
                                {item.cartQuantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.id,
                                    item.cartQuantity + 1
                                  )
                                }
                                disabled={
                                  item.cartQuantity >= stock
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="cart-item-subtotal">
                            <span>Subtotal</span>

                            <strong>
                              KSh {itemTotal.toLocaleString()}
                            </strong>
                          </div>

                        </div>

                        {stock > 0 && stock <= 2 && (
                          <p className="cart-low-stock">
                            Only {stock} left in stock
                          </p>
                        )}

                      </div>
                    </article>
                  );
                })}

              </div>

              <div className="cart-security-note">
                <ShieldCheck size={20} />

                <div>
                  <strong>
                    Safe & simple ordering
                  </strong>

                  <p>
                    Select the dress you want and confirm your
                    order directly with Thrift by Njeri through
                    WhatsApp.
                  </p>
                </div>
              </div>

            </div>

            <aside className="cart-summary">

              <p className="section-label">
                {selectMore
                  ? "SELECTED ITEMS"
                  : "SELECTED DRESS"}
              </p>

              <h2>
                Order Summary
              </h2>

              <div className="selected-summary-message">
                {selectedCartItems.length === 0 ? (
                  <>
                    <ShoppingBag size={19} />

                    <span>
                      Select a dress to continue.
                    </span>
                  </>
                ) : (
                  <>
                    <Check size={19} />

                    <span>
                      {selectedCartItems.length}{" "}
                      {selectedCartItems.length === 1
                        ? "dress"
                        : "dresses"}{" "}
                      selected
                    </span>
                  </>
                )}
              </div>

              <div className="cart-summary-row">
                <span>Selected Items</span>

                <span>
                  {selectedQuantity}
                </span>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>

                <span>
                  To be confirmed
                </span>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Total</span>

                <strong>
                  KSh {selectedTotal.toLocaleString()}
                </strong>
              </div>

              <button
                type="button"
                className="primary-button cart-checkout-button"
                onClick={handleProceedToOrder}
              >
                <MessageCircle size={19} />
                Proceed to Order
              </button>

              <p className="checkout-note">
                Only the selected dress
                {selectedCartItems.length === 1
                  ? ""
                  : "es"}{" "}
                will be sent to WhatsApp.
              </p>

              <Link
                to="/shop"
                className="continue-shopping"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>

            </aside>
          </section>
        )}
      </main>
    </>
  );
}

export default Cart;