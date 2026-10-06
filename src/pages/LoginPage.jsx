import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await login(form);
      showToast("Login successful");

      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate(location.state?.from || "/", { replace: true });
      }
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
            <h1>Welcome back</h1>
          </div>
        </div>

        <p>Login using the same credentials handled by your Spring Boot API.</p>

        <div className="field">
          <label>Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={update}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={update}
            placeholder="••••••••"
          />
        </div>

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            New here? <Link to="/register">Create account</Link>
          </span>
        </div>
      </form>
    </main>
  );
}
