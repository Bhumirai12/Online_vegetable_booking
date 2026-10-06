import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "../../context/CatalogContext";
import { orderApi } from "../../api/orderApi";
import { paymentApi } from "../../api/paymentApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function AdminDashboardPage() {
  const { vegetables, categories, loading } = useCatalog();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderApi.getAllForAdmin(),
      paymentApi.getAllForAdmin(),
    ])
      .then(([orderData, paymentData]) => {
        setOrders(Array.isArray(orderData) ? orderData : []);
        setPayments(Array.isArray(paymentData) ? paymentData : []);
      })
      .finally(() => setDataLoading(false));
  }, []);

  const paidTotal = useMemo(
    () =>
      payments
        .filter((payment) => payment.paymentStatus === "PAID")
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [payments]
  );

  if (loading || dataLoading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <>
      <div className="stats">
        <div className="stat">
          <small>Total Vegetables</small>
          <b>{vegetables.length}</b>
          <em>
            {vegetables.filter((item) => Number(item.stock) > 0).length} in
            stock
          </em>
        </div>

        <div className="stat">
          <small>Orders</small>
          <b>{orders.length}</b>
          <em>Latest orders from backend</em>
        </div>

        <div className="stat">
          <small>Paid Online</small>
          <b>{formatCurrency(paidTotal)}</b>
          <em>Verified PAID payments</em>
        </div>

        <div className="stat">
          <small>Categories</small>
          <b>{categories.length}</b>
          <em>Active catalogue categories</em>
        </div>
      </div>

      <div className="table-card">
        <div className="section-head compact">
          <div>
            <h3>Recent orders</h3>
            <p>Newest orders returned by your admin API.</p>
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
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.customerEmail}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
