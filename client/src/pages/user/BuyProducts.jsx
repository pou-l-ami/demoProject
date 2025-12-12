// client/src/pages/user/BuyProducts.jsx
import React, { useEffect, useState } from "react";
import { Button, Spinner } from "reactstrap";
import axios from "axios";
import "../../styles/BuyProducts.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API_URL = `${BACKEND_URL}/api`; // for products & cart

const BuyProducts = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null); // { user, items: [...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // fetch products + cart from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsRes, cartRes] = await Promise.all([
          axios.get(`${API_URL}/products`, { withCredentials: true }),
          axios.get(`${API_URL}/cart`, { withCredentials: true }),
        ]);

        setProducts(productsRes.data.data || []);
        setCart(cartRes.data.data || null);
      } catch (err) {
        console.error("BuyProducts fetch error:", err);
        setError("Failed to load products/cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const res = await axios.post(
        `${API_URL}/cart/add`,
        { productId, qty: 1 },
        { withCredentials: true }
      );

      setCart(res.data.data || res.data); // updated cart from backend
    } catch (err) {
      console.error("addToCart error:", err);
      setError("Failed to add item to cart.");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const res = await axios.post(
        `${API_URL}/cart/remove`,
        { productId },
        { withCredentials: true }
      );

      setCart(res.data.data || res.data);
    } catch (err) {
      console.error("removeFromCart error:", err);
      setError("Failed to remove item from cart.");
    }
  };

  // 👉 create a Booking (using your Booking schema) then go to My Bookings
  const proceedCheckout = async () => {
    const items = cart?.items || [];
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setError("");

      const totalAmount = items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.qty,
        0
      );

      const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

      // Build booking payload to match BookingSchema
      const bookingPayload = {
        eventName: `Product Order (${items.length} items)`,
        venueName: "Online Purchase",
        date: new Date().toISOString(),
        guests: totalQty,
        totalAmount,
        status: "pending",
        paymentStatus: "unpaid",
      };

      await axios.post(
        `${BACKEND_URL}/api/v1/booking`,
        bookingPayload,
        { withCredentials: true }
      );

      // After successful booking creation, go to My Bookings
      navigate("/user/bookings");
    } catch (err) {
      console.error("checkout / createBooking error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to create booking from cart. Please try again.";
      setError(msg);
    }
  };

  if (loading) {
    return (
      <div className="buy-products-page loading-state">
        <Spinner />{" "}
        <span style={{ marginLeft: "8px" }}>Loading products...</span>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.qty,
    0
  );

  return (
    <div className="buy-products-page">
      {/* LEFT: products */}
      <div className="products-section">
        <h2>Buy / Rent Products</h2>
        <p>Select items from the categories below and add them to your cart.</p>

        {error && <p className="error-text">{error}</p>}

        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              {product.photo && (
                <img
                  src={`${BACKEND_URL}${product.photo}`}
                  alt={product.name}
                  className="product-image"
                />
              )}

              <h4 className="product-name">{product.name}</h4>
              <p className="product-category">{product.category}</p>
              <p className="product-price">₹ {product.price}</p>

              <Button
                className="btn primary__btn"
                onClick={() => handleAddToCart(product._id)}
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: cart */}
      <div className="cart-section">
        <h3>Your Cart</h3>
        {items.length === 0 ? (
          <p>No items in cart yet.</p>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item._id || item.product._id} className="cart-item">
                  <div>
                    <strong>{item.product?.name}</strong>
                    <div className="cart-item-meta">
                      <span>Category: {item.product?.category}</span>
                      <span>Qty: {item.qty}</span>
                    </div>
                  </div>

                  <div className="cart-item-price">
                    ₹ {(item.product?.price || 0) * item.qty}
                    <Button
                      size="sm"
                      className="btn secondary__btn remove-btn"
                      onClick={() => handleRemoveFromCart(item.product._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-total">
              <span>Total Amount:</span>
              <strong>₹ {totalAmount}</strong>
            </div>

            <Button
              className="btn secondary__btn"
              block
              onClick={proceedCheckout}
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BuyProducts;
