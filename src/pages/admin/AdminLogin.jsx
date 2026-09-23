import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import Navbar from "../../components/Navbar";
import { auth } from "../../firebase";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="admin-login">
        <div className="admin-box">
          <div className="admin-icon">
            <LockKeyhole size={25} />
          </div>

          <p className="section-label">THRIFT BY NJERI</p>

          <h1>Admin Login</h1>

          <p className="admin-description">
            Manage dresses, prices, stock and new arrivals from your dashboard.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="primary-button admin-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <Link to="/" className="back-home">
            ← Back to website
          </Link>
        </div>
      </main>
    </>
  );
}

export default AdminLogin;