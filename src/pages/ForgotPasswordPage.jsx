import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useToast } from "../context/ToastContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      showToast("OTP sent to your email");
      navigate("/reset-password");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">PASSWORD RECOVERY</span>
        <h1>Forgot password</h1>
        <p>Your backend will generate and email the OTP.</p>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <div className="auth-links center">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </main>
  );
}
