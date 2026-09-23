import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import HowToOrder from "./pages/HowToOrder";
import Cart from "./pages/Cart";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddProduct from "./pages/admin/AddProduct";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Pages */}
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/about" element={<About />} />

        <Route path="/how-to-order" element={<HowToOrder />} />

        <Route path="/cart" element={<Cart />} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/add-product"
          element={<AddProduct />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;