import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      <Navbar />

      <main className="page">
        <section className="shop-header">
          <p className="section-label">OUR COLLECTION</p>

          <h1>Shop Cute Dresses</h1>

          <p>
            Browse our available pieces and find something that matches your
            style.
          </p>
        </section>

        <section className="products-section shop-products">
          {loading ? (
            <p className="loading-message">Loading dresses...</p>
          ) : products.length === 0 ? (
            <p className="loading-message">
              No dresses are available at the moment.
            </p>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Shop;
