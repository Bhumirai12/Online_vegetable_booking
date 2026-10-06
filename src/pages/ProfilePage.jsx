import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProfilePage() {
  const {
    user,
    refreshProfile,
    updateStoredUser,
    logout,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: user?.fullName || "",
      phone: user?.phone || "",
    }));
  }, [user?.fullName, user?.phone]);

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const response = await authApi.updateProfile(user.userId, payload);
      updateStoredUser(response);
      setForm((current) => ({ ...current, password: "" }));
      showToast("Profile updated");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently?")) return;

    try {
      await authApi.deleteAccount(user.userId);
      logout();
      navigate("/");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <main className="page-shell">
      <div className="container narrow-page">
        <div className="page-title">
          <h1>My Profile</h1>
          <p>Manage the fields supported by your UpdateProfileRequest.</p>
        </div>

        <form className="panel" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input value={user?.email || ""} disabled />
          </div>

          <div className="field">
            <label>Full name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={update}
            />
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={update}
            />
          </div>

          <div className="field">
            <label>New password (optional)</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="btn btn-danger-soft profile-delete"
            onClick={deleteAccount}
          >
            Delete Account
          </button>
        </form>
      </div>
    </main>
  );
}
