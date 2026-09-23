import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import logo from "../assets/logo.jpg";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

function Home() {
const [featuredProducts, setFeaturedProducts] = useState([]);

useEffect(() => {
const loadFeaturedProducts = async () => {
try {
const productsQuery = query(
collection(db, "products"),
orderBy("createdAt", "desc"),
limit(3)
);

    const snapshot = await getDocs(productsQuery);

    const productsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setFeaturedProducts(productsData);
  } catch (error) {
    console.error("Error loading featured products:", error);
  }
};

loadFeaturedProducts();

}, []);

return (
<>
<Navbar />

  <main>
    <section className="hero">
      <div className="hero-content">
        <p className="hero-small">
          <Sparkles size={16} />
          CURATED THRIFT FASHION
        </p>

        <h1>
          Find your next
          <span> favourite look.</span>
        </h1>

        <p className="hero-description">
          Discover stylish, affordable thrift pieces carefully selected
          for you. Look good, feel confident and make every outfit count.
        </p>

        <div className="hero-buttons">
          <Link to="/shop" className="primary-button">
            Shop Dresses
            <ArrowRight size={18} />
          </Link>

          <Link to="/how-to-order" className="secondary-button">
            How to Order
          </Link>
        </div>
      </div>

      <div className="hero-image">
        <img
          src={logo}
          alt="Thrift by Njeri"
          className="hero-logo"
        />

        <div className="hero-card">
          <Heart size={18} fill="currentColor" />
          <span>Style that feels like you.</span>
        </div>
      </div>
    </section>

    <section className="features-section">
      <div className="feature">
        <Sparkles size={24} />
        <div>
          <h3>Carefully Selected</h3>
          <p>Unique pieces chosen with you in mind.</p>
        </div>
      </div>

      <div className="feature">
        <Heart size={24} />
        <div>
          <h3>Affordable Style</h3>
          <p>Look amazing without breaking the bank.</p>
        </div>
      </div>

      <div className="feature">
        <MessageCircle size={24} />
        <div>
          <h3>Easy Ordering</h3>
          <p>Choose your piece and talk to us on WhatsApp.</p>
        </div>
      </div>
    </section>

    <section className="products-section">
      <div className="section-heading">
        <div>
          <p className="section-label">SHOP THE LOOK</p>
          <h2>New Arrivals</h2>
        </div>

        <Link to="/shop" className="view-all">
          View All <ArrowRight size={17} />
        </Link>
      </div>

      {featuredProducts.length === 0 ? (
        <p className="loading-message">
          No dresses available yet.
        </p>
      ) : (
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>

    <section className="cta-section">
      <div>
        <p className="section-label">THRIFT BY NJERI</p>
        <h2>Something cute is waiting for you.</h2>
        <p>
          Browse our collection and find a piece that fits your style.
        </p>
      </div>

      <Link to="/shop" className="primary-button">
        Explore Collection
        <ArrowRight size={18} />
      </Link>
    </section>
  </main>

  <footer className="footer">
    <div>
      <h3>THRIFT BY NJERI</h3>
      <p>Affordable. Stylish. Yours.</p>
    </div>

    <p>© {new Date().getFullYear()} Thrift by Njeri</p>
  </footer>
</>

);
}

export default Home;