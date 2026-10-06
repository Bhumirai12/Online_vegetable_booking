import { useEffect, useState } from "react";
import { paymentApi } from "../../api/paymentApi";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    paymentApi
      .getAllForAdmin()
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch((error) => showToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading payments..." />;
  }

  return (
    <div className="table-card">
      <div className="section-head compact">
        <div>
          <h3>Payments</h3>
          <p>COD and Razorpay payment records from your backend.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Payment</th>
              <th>Order</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Razorpay Payment</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.paymentId}>
                <td>#{payment.paymentId}</td>
                <td>#{payment.orderId}</td>
                <td>{payment.paymentMethod}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>
                  <StatusBadge status={payment.paymentStatus} />
                </td>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{payment.razorpayPaymentId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
