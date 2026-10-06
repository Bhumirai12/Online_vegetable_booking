import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register(form);
      showToast("Account created. Please login.");
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
        <div className="auth-brand">
          <span className="logo-mark">F</span>
          <div>
            <small>FRESHBASKET</small>
            <h1>Create account</h1>
          </div>
        </div>

        <div className="field">
          <label>Full name</label>
          <input
            name="fullName"
            required
            value={form.fullName}
            onChange={update}
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={update}
          />
        </div>

        <div className="field">
          <label>Phone</label>
          <input
            name="phone"
            required
            value={form.phone}
            onChange={update}
            placeholder="10-digit mobile number"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            name="password"
            type="password"
            minLength="6"
            required
            value={form.password}
            onChange={update}
          />
        </div>

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div className="auth-links center">
          <span>
            Already registered? <Link to="/login">Login</Link>
          </span>
        </div>
      </form>
    </main>
  );
}
