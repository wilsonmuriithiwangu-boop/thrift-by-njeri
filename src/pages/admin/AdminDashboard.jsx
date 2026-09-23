import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
Plus,
ArrowLeft,
Pencil,
Trash2,
Package,
ShoppingBag,
AlertCircle,
CheckCircle,
LogOut,
RefreshCw,
} from "lucide-react";
import {
collection,
deleteDoc,
doc,
getDocs,
updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import Navbar from "../../components/Navbar";
import { db, auth } from "../../firebase";

function AdminDashboard() {
const navigate = useNavigate();

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

const loadProducts = async () => {
setLoading(true);

try {
  const snapshot = await getDocs(collection(db, "products"));

  const productsData = snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...productDoc.data(),
  }));

  productsData.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });

  setProducts(productsData);
} catch (error) {
  console.error("Error loading products:", error);
  alert("Could not load products.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
loadProducts();
}, []);

const handleEdit = async (product) => {
const newName = window.prompt(
"Enter the dress name:",
product.name || ""
);

if (newName === null) return;

const newPrice = window.prompt(
  "Enter the price:",
  product.price || ""
);

if (newPrice === null) return;

const newQuantity = window.prompt(
  "Enter the quantity:",
  product.quantity ?? ""
);

if (newQuantity === null) return;

try {
  await updateDoc(doc(db, "products", product.id), {
    name: newName.trim(),
    price: Number(newPrice),
    quantity: Number(newQuantity),
  });

  alert("Dress updated successfully.");
  loadProducts();
} catch (error) {
  console.error("Error updating product:", error);
  alert("Could not update the dress.");
}

};

const handleDelete = async (product) => {
const confirmed = window.confirm(
'Are you sure you want to delete "' +
product.name +
'"? This cannot be undone.'
);

if (!confirmed) return;

try {
  await deleteDoc(doc(db, "products", product.id));

  alert("Dress deleted successfully.");
  loadProducts();
} catch (error) {
  console.error("Error deleting product:", error);
  alert("Could not delete the dress.");
}

};

const handleMarkSold = async (product) => {
if (Number(product.quantity) === 0) {
return;
}

const confirmed = window.confirm(
  'Mark "' + product.name + '" as sold out?'
);

if (!confirmed) return;

try {
  await updateDoc(doc(db, "products", product.id), {
    previousQuantity: Number(product.quantity),
    quantity: 0,
  });

  loadProducts();
} catch (error) {
  console.error("Error marking product as sold:", error);
  alert("Could not update the dress.");
}

};

const handleMarkAvailable = async (product) => {
const restoredQuantity =
Number(product.previousQuantity) > 0
? Number(product.previousQuantity)
: 1;

try {
  await updateDoc(doc(db, "products", product.id), {
    quantity: restoredQuantity,
  });

  loadProducts();
} catch (error) {
  console.error("Error restoring product:", error);
  alert("Could not make the dress available.");
}

};

const handleLogout = async () => {
try {
await signOut(auth);
navigate("/admin");
} catch (error) {
console.error("Logout error:", error);
alert("Could not log out.");
}
};

const totalProducts = products.length;

const totalStock = products.reduce(
(total, product) =>
total + Number(product.quantity || 0),
0
);

const soldOutProducts = products.filter(
(product) => Number(product.quantity || 0) === 0
).length;

const availableProducts = products.filter(
(product) => Number(product.quantity || 0) > 0
).length;

const lowStockProducts = products.filter((product) => {
const quantity = Number(product.quantity || 0);
return quantity > 0 && quantity <= 2;
}).length;

return (
<>
<Navbar />

  <main className="admin-page">
    <div className="admin-container">

      <section className="admin-header">
        <div>
          <p className="section-label">THRIFT BY NJERI</p>

          <h1>Store Dashboard</h1>

          <p>
            Manage your dresses, stock and availability from
            one place.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadProducts}
            title="Refresh products"
          >
            <RefreshCw size={18} />
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </section>

      <section className="admin-stats">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Package size={22} />
          </div>

          <div>
            <p>Total Dresses</p>
            <strong>{totalProducts}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShoppingBag size={22} />
          </div>

          <div>
            <p>Total Stock</p>
            <strong>{totalStock}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <CheckCircle size={22} />
          </div>

          <div>
            <p>Available</p>
            <strong>{availableProducts}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon warning">
            <AlertCircle size={22} />
          </div>

          <div>
            <p>Low Stock</p>
            <strong>{lowStockProducts}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon danger">
            <Package size={22} />
          </div>

          <div>
            <p>Sold Out</p>
            <strong>{soldOutProducts}</strong>
          </div>
        </div>

      </section>

      <section className="admin-products-section">

        <div className="admin-products-header">
          <div>
            <p className="section-label">INVENTORY</p>
            <h2>Your Dresses</h2>
          </div>

          <Link
            to="/admin/add-product"
            className="primary-button admin-add-button"
          >
            <Plus size={18} />
            Add New Dress
          </Link>
        </div>

        {loading ? (
          <div className="admin-loading">
            <RefreshCw size={22} />
            <p>Loading your inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <ShoppingBag size={35} />
            </div>

            <h3>No dresses yet</h3>

            <p>
              Add your first dress to start building your
              collection.
            </p>

            <Link
              to="/admin/add-product"
              className="primary-button"
            >
              <Plus size={18} />
              Add First Dress
            </Link>
          </div>
        ) : (
          <div className="admin-products-grid">

            {products.map((product) => {
              const quantity = Number(product.quantity || 0);

              const isSoldOut = quantity === 0;
              const isLowStock =
                quantity > 0 && quantity <= 2;

              return (
                <article
                  className="admin-product-card"
                  key={product.id}
                >

                  <div className="admin-product-image">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                      />
                    ) : (
                      <div className="admin-no-image">
                        No Photo
                      </div>
                    )}

                    <span
                      className={
                        isSoldOut
                          ? "admin-status sold"
                          : isLowStock
                          ? "admin-status low"
                          : "admin-status available"
                      }
                    >
                      {isSoldOut
                        ? "SOLD OUT"
                        : isLowStock
                        ? "LOW STOCK"
                        : "AVAILABLE"}
                    </span>
                  </div>

                  <div className="admin-product-content">

                    <p className="product-category">
                      {product.category || "Dresses"}
                    </p>

                    <h3>{product.name}</h3>

                    <div className="admin-product-price">
                      KSh{" "}
                      {Number(
                        product.price || 0
                      ).toLocaleString()}
                    </div>

                    <div className="admin-stock-row">
                      <span>Stock</span>

                      <strong
                        className={
                          isSoldOut
                            ? "stock-danger"
                            : isLowStock
                            ? "stock-warning"
                            : ""
                        }
                      >
                        {quantity}
                      </strong>
                    </div>

                    <div className="admin-product-actions">

                      <button
                        type="button"
                        className="admin-action edit"
                        onClick={() =>
                          handleEdit(product)
                        }
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      {!isSoldOut ? (
                        <button
                          type="button"
                          className="admin-action sold"
                          onClick={() =>
                            handleMarkSold(product)
                          }
                        >
                          Mark Sold
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-action available"
                          onClick={() =>
                            handleMarkAvailable(product)
                          }
                        >
                          Available
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-action delete"
                        onClick={() =>
                          handleDelete(product)
                        }
                        aria-label={
                          "Delete " + product.name
                        }
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>
                </article>
              );
            })}

          </div>
        )}
      </section>

      <div className="admin-back">
        <Link to="/">
          <ArrowLeft size={16} />
          Back to Store
        </Link>
      </div>

    </div>
  </main>
</>

);
}

export default AdminDashboard;