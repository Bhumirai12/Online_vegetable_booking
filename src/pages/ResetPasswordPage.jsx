import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useToast } from "../context/ToastContext";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await authApi.resetPassword(form.otp, form.newPassword);
      showToast("Password reset successfully");
      navigate("/login");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">OTP VERIFICATION</span>
        <h1>Reset password</h1>
        <p>Enter the OTP sent by your backend and choose a new password.</p>

        <div className="field">
          <label>OTP</label>
          <input
            name="otp"
            required
            inputMode="numeric"
            value={form.otp}
            onChange={update}
          />
        </div>

        <div className="field">
          <label>New password</label>
          <input
            name="newPassword"
            type="password"
            minLength="8"
            required
            value={form.newPassword}
            onChange={update}
          />
        </div>

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="auth-links center">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </main>
  );
}
