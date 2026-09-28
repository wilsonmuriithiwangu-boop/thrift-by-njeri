import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

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
        console.error(
          "Error loading featured products:",
          error
        );
      }
    };

    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const snapshot = await getDocs(reviewsQuery);

        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(reviewsData);

        if (reviewsData.length > 0) {
          const total = reviewsData.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          );

          setAverageRating(
            total / reviewsData.length
          );
        }
      } catch (error) {
        console.error(
          "Error loading reviews:",
          error
        );
      }
    };

    loadReviews();
  }, []);

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (selectedRating === 0) {
      setReviewMessage(
        "Please select a star rating."
      );
      return;
    }

    if (!reviewText.trim()) {
      setReviewMessage(
        "Please write a short review."
      );
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    try {
      await addDoc(collection(db, "reviews"), {
        name:
          reviewName.trim() || "Anonymous",
        rating: selectedRating,
        review: reviewText.trim(),
        createdAt: serverTimestamp(),
      });

      setReviewName("");
      setReviewText("");
      setSelectedRating(0);
      setHoverRating(0);

      setReviewMessage(
        "Thank you for your review! ❤️"
      );

      const reviewsQuery = query(
        collection(db, "reviews"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const snapshot = await getDocs(
        reviewsQuery
      );

      const reviewsData = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      setReviews(reviewsData);

      if (reviewsData.length > 0) {
        const total = reviewsData.reduce(
          (sum, review) =>
            sum + Number(review.rating || 0),
          0
        );

        setAverageRating(
          total / reviewsData.length
        );
      }
    } catch (error) {
      console.error(
        "Error submitting review:",
        error
      );

      setReviewMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="hero-content">

            <div className="collection-label">
              THRIFT BY NJERI COLLECTION
            </div>

            <p className="hero-small">
              <Sparkles size={16} />
              CURATED THRIFT FASHION
            </p>

            <h1>
              Find your next{" "}
              <span>favourite look.</span>
            </h1>

            <h2 className="hero-tagline">
              Style that feels like you
            </h2>

            <p className="hero-description">
              Discover stylish, affordable thrift
              pieces carefully selected for you.
              Look good, feel confident and make
              every outfit count.
            </p>

            <div className="hero-buttons">
              <Link
                to="/shop"
                className="primary-button"
              >
                Shop Dresses
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/how-to-order"
                className="secondary-button"
              >
                How to Order
              </Link>
            </div>

          </div>

          <div className="hero-image"></div>
        </section>

        <section className="features-section">

          <div className="feature">
            <Sparkles size={24} />

            <div>
              <h3>Carefully Selected</h3>
              <p>
                Unique pieces chosen with you
                in mind.
              </p>
            </div>
          </div>

          <div className="feature">
            <Heart size={24} />

            <div>
              <h3>Affordable Style</h3>
              <p>
                Look amazing without breaking
                the bank.
              </p>
            </div>
          </div>

          <div className="feature">
            <MessageCircle size={24} />

            <div>
              <h3>Easy Ordering</h3>
              <p>
                Choose your piece and talk to us
                on WhatsApp.
              </p>
            </div>
          </div>

        </section>

        <section className="products-section">

          <div className="section-heading">

            <div>
              <p className="section-label">
                SHOP THE LOOK
              </p>

              <h2>New Arrivals</h2>
            </div>

            <Link
              to="/shop"
              className="view-all"
            >
              View All
              <ArrowRight size={17} />
            </Link>

          </div>

          {featuredProducts.length === 0 ? (
            <p className="loading-message">
              No dresses available yet.
            </p>
          ) : (
            <div className="new-arrivals-images">

              {featuredProducts.map(
                (product) => (
                  <div
                    className="new-arrival-image"
                    key={product.id}
                  >
                    <img
                      src={product.imageUrl}
                      alt={
                        product.name ||
                        "New dress"
                      }
                    />
                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* CUSTOMER REVIEWS */}

        <section className="reviews-section">

          <div className="reviews-heading">

            <p className="section-label">
              CUSTOMER LOVE
            </p>

            <h2>
              What our customers say
            </h2>

            <p>
              Your experience matters to us.
              Leave a rating and tell us
              what you think.
            </p>

          </div>

          <div className="reviews-rating-summary">

            <div className="average-rating">
              <strong>
                {reviews.length > 0
                  ? averageRating.toFixed(1)
                  : "0.0"}
              </strong>

              <div className="average-stars">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <Star
                      key={star}
                      size={22}
                      fill={
                        star <=
                        Math.round(
                          averageRating
                        )
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )
                )}
              </div>

              <span>
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
              </span>
            </div>

          </div>

          <form
            className="review-form"
            onSubmit={handleSubmitReview}
          >

            <h3>
              Rate your experience
            </h3>

            <div className="review-stars-input">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    className="rating-star-button"
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                    onClick={() =>
                      setSelectedRating(star)
                    }
                    aria-label={
                      "Rate " +
                      star +
                      " stars"
                    }
                  >
                    <Star
                      size={32}
                      fill={
                        star <=
                        (hoverRating ||
                          selectedRating)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                )
              )}

            </div>

            <input
              type="text"
              placeholder="Your name (optional)"
              value={reviewName}
              onChange={(event) =>
                setReviewName(
                  event.target.value
                )
              }
              maxLength={50}
            />

            <textarea
              placeholder="Write a short review..."
              value={reviewText}
              onChange={(event) =>
                setReviewText(
                  event.target.value
                )
              }
              maxLength={300}
              rows={4}
            />

            <button
              type="submit"
              className="primary-button"
              disabled={submittingReview}
            >
              {submittingReview
                ? "Submitting..."
                : "Submit Review"}
            </button>

            {reviewMessage && (
              <p className="review-message">
                {reviewMessage}
              </p>
            )}

          </form>

          {reviews.length > 0 && (
            <div className="reviews-list">

              {reviews
                .slice(0, 6)
                .map((review) => (
                  <article
                    className="review-card"
                    key={review.id}
                  >

                    <div className="review-card-top">

                      <strong>
                        {review.name ||
                          "Anonymous"}
                      </strong>

                      <div className="review-card-stars">

                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <Star
                              key={star}
                              size={16}
                              fill={
                                star <=
                                Number(
                                  review.rating
                                )
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          )
                        )}

                      </div>

                    </div>

                    <p>
                      {review.review}
                    </p>

                  </article>
                ))}

            </div>
          )}

        </section>

        <section className="cta-section">

          <div>

            <p className="section-label">
              THRIFT BY NJERI
            </p>

            <h2>
              Something cute is waiting
              for you.
            </h2>

            <p>
              Browse our collection and find
              a piece that fits your style.
            </p>

          </div>

          <Link
            to="/shop"
            className="primary-button"
          >
            Explore Collection
            <ArrowRight size={18} />
          </Link>

        </section>
      </main>

      <footer className="footer">

        <div>
          <h3>THRIFT BY NJERI</h3>

          <p>
            Affordable. Stylish. Yours.
          </p>
        </div>

        <p>
          © {new Date().getFullYear()} Thrift
          by Njeri
        </p>

      </footer>
    </>
  );
}

export default Home;