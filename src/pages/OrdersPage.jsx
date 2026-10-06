import { useEffect, useState } from "react";
import { orderApi } from "../api/orderApi";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancel = async (orderId) => {
    try {
      await orderApi.cancelMyOrder(orderId);
      showToast("Order cancelled");
      await loadOrders();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <main className="page-shell">
      <div className="container">
        <div className="page-title">
          <h1>My Orders</h1>
          <p>Your order history from the backend.</p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : !orders.length ? (
          <EmptyState
            title="No orders yet"
            message="Your placed orders will appear here."
          />
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.orderId}>
                <div className="order-card-head">
                  <div>
                    <span className="eyebrow">ORDER #{order.orderId}</span>
                    <h3>{formatCurrency(order.totalAmount)}</h3>
                    <small>{formatDate(order.orderDate)}</small>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="order-items">
                  {order.items?.map((item) => (
                    <div key={item.orderItemId}>
                      <span>
                        {item.vegetableName} × {item.quantity}
                      </span>
                      <b>{formatCurrency(item.total)}</b>
                    </div>
                  ))}
                </div>

                <div className="order-address">
                  <b>Delivery:</b>{" "}
                  {[
                    order.deliveryAddress,
                    order.city,
                    order.state,
                    order.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>

                {order.status === "PLACED" && (
                  <button
                    className="btn btn-danger-soft"
                    onClick={() => cancel(order.orderId)}
                  >
                    Cancel Order
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
