import { useEffect, useState } from "react";
import { orderApi } from "../../api/orderApi";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

function allowedNextStatuses(status) {
  if (status === "PLACED") return ["CONFIRMED", "CANCELLED"];
  if (status === "CONFIRMED") return ["DELIVERED", "CANCELLED"];
  return [];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getAllForAdmin();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId, status) => {
    if (!status) return;

    try {
      await orderApi.updateStatus(orderId, status);
      showToast("Order status updated");
      await load();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading admin orders..." />;
  }

  return (
    <div className="table-card">
      <div className="section-head compact">
        <div>
          <h3>Orders</h3>
          <p>Status transitions follow your OrderService business logic.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Change status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const options = allowedNextStatuses(order.status);

              return (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.customerEmail}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    {options.length ? (
                      <select
                        defaultValue=""
                        onChange={(event) =>
                          updateStatus(order.orderId, event.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {options.map((status) => (
                          <option value={status} key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="muted-text">Final state</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
