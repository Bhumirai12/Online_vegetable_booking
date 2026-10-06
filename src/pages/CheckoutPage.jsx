import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { paymentApi } from "../api/paymentApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/formatters";
import { openRazorpayCheckout } from "../utils/razorpay";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deliveryAddress: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: user?.phone || "",
  });

  const canCheckout = useMemo(() => items.length > 0, [items]);

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const findNewestOrder = async () => {
    const orders = await orderApi.getMyOrders();
    if (!Array.isArray(orders) || !orders.length) {
      throw new Error("Order was created but its id could not be loaded");
    }
    return orders[0];
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!canCheckout) {
      showToast("Your cart is empty", "error");
      return;
    }

    setLoading(true);

    try {
      // Current backend returns only a success string here.
      await orderApi.placeOrder(form);

      // Backend returns orders latest-first, so this gives the order just made.
      const order = await findNewestOrder();

      const payment = await paymentApi.create(
        order.orderId,
        paymentMethod
      );

      if (paymentMethod === "ONLINE") {
        const razorpayResult = await openRazorpayCheckout({
          payment,
          customer: user,
        });

        await paymentApi.verify({
          razorpayOrderId: razorpayResult.razorpay_order_id,
          razorpayPaymentId: razorpayResult.razorpay_payment_id,
          razorpaySignature: razorpayResult.razorpay_signature,
        });

        showToast("Payment verified successfully");
      } else {
        showToast("Order placed with Cash on Delivery");
      }

      await refreshCart();
      navigate("/orders", { replace: true });
    } catch (error) {
      showToast(error.message, "error");
      await refreshCart().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="container">
        <div className="page-title">
          <button className="back" onClick={() => navigate("/")}>
            ← Continue shopping
          </button>
          <h1>Checkout</h1>
          <p>Delivery details and payment method.</p>
        </div>

        <div className="checkout-grid">
          <form className="panel" onSubmit={submit}>
            <h3>Delivery address</h3>

            <div className="field">
              <label>Full Address</label>
              <textarea
                name="deliveryAddress"
                required
                rows="3"
                value={form.deliveryAddress}
                onChange={update}
                placeholder="House number, street, area"
              />
            </div>

            <div className="two">
              <div className="field">
                <label>City</label>
                <input
                  name="city"
                  required
                  value={form.city}
                  onChange={update}
                />
              </div>

              <div className="field">
                <label>State</label>
                <input
                  name="state"
                  required
                  value={form.state}
                  onChange={update}
                />
              </div>
            </div>

            <div className="two">
              <div className="field">
                <label>Pincode</label>
                <input
                  name="pincode"
                  required
                  pattern="[0-9]{6}"
                  value={form.pincode}
                  onChange={update}
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  name="phoneNumber"
                  required
                  pattern="[0-9]{10}"
                  value={form.phoneNumber}
                  onChange={update}
                />
              </div>
            </div>

            <h3 className="checkout-payment-title">Payment method</h3>

            <label className="pay-option">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span>
                <b>Cash on Delivery</b>
                <small>Pay when the order arrives.</small>
              </span>
            </label>

            <label className="pay-option">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />
              <span>
                <b>Online Payment</b>
                <small>Razorpay checkout + backend signature verification.</small>
              </span>
            </label>

            <button
              className="btn btn-primary full checkout-button"
              disabled={loading || !items.length}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          <aside className="panel order-summary">
            <h3>Order summary</h3>
            {items.map((item) => (
              <div className="summary-line" key={item.cartItemId}>
                <span>
                  {item.vegetableName} × {item.quantity}
                </span>
                <b>{formatCurrency(item.total)}</b>
              </div>
            ))}
            <div className="summary-line">
              <span>Delivery</span>
              <b>Included</b>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
