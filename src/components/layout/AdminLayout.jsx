import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiShoppingBag,
  FiPackage,
  FiCreditCard,
  FiLogOut,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/categories", label: "Categories", icon: FiLayers },
  { to: "/admin/vegetables", label: "Vegetables", icon: FiShoppingBag },
  { to: "/admin/orders", label: "Orders", icon: FiPackage },
  { to: "/admin/payments", label: "Payments", icon: FiCreditCard },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-logo">
          FreshBasket
          <small>ADMIN PANEL</small>
        </div>

        <nav className="admin-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="admin-secondary" onClick={() => navigate("/")}>
          <FiArrowLeft /> Storefront
        </button>
        <button
          className="admin-secondary"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <FiLogOut /> Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div>
            <small>ADMINISTRATION</small>
            <h2>FreshBasket</h2>
          </div>
          <span>{user?.fullName || user?.email}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
