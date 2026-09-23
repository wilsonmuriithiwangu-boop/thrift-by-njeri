import Navbar from "../components/Navbar";

function HowToOrder() {
  return (
    <>
      <Navbar />

      <main className="page">
        <section className="simple-page">
          <p className="section-label">EASY SHOPPING</p>

          <h1>How to Order</h1>

          <div className="order-steps">
            <div className="order-step">
              <span>01</span>

              <div>
                <h3>Choose your piece</h3>

                <p>
                  Browse the available dresses and select the one you love.
                </p>
              </div>
            </div>

            <div className="order-step">
              <span>02</span>

              <div>
                <h3>Click "I'm Interested"</h3>

                <p>
                  The button will open WhatsApp with the product information
                  already included.
                </p>
              </div>
            </div>

            <div className="order-step">
              <span>03</span>

              <div>
                <h3>Confirm your order</h3>

                <p>
                  We'll confirm availability, payment and delivery or pickup
                  details with you.
                </p>
              </div>
            </div>

            <div className="order-step">
              <span>04</span>

              <div>
                <h3>Enjoy your new look</h3>

                <p>
                  Your new favourite piece is on its way to you. 💕
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default HowToOrder;