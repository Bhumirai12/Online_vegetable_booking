import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiLogOut,
  FiPackage,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";

export default function Navbar({ onOpenCart }) {
  const { user, isAuthenticated, isCustomer, logout } = useAuth();
  const { count } = useCart();
  const { searchQuery, setSearchQuery, setActiveCategoryId } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    setActiveCategoryId(null);

    if (isAuthenticated && isCustomer && location.pathname !== "/vegetables") {
      navigate("/vegetables");
    }
  };

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `navlink${isActive ? " active" : ""}`;

  return (
    <>
      <header className="header">
        <div className="container header-main">
          <Link to="/" className="logo" aria-label="FreshBasket home">
            <span className="logo-mark">F</span>
            <span className="logo-copy">
              <b>FreshBasket</b>
              <small>Online Vegetable Store</small>
            </span>
          </Link>

          <label className="search">
            <FiSearch />
            <input
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search vegetables, category..."
              disabled={!isAuthenticated || !isCustomer}
            />
          </label>

          <div className="header-actions">
            {!isAuthenticated ? (
              <Link className="hbtn" to="/login">
                <FiUser />
                <span className="login-label">Login</span>
              </Link>
            ) : (
              <div className="account-menu-wrap">
                <button
                  className="hbtn"
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  <FiUser />
                  <span className="login-label">
                    {user?.fullName?.split(" ")[0] || "Account"}
                  </span>
                </button>

                {accountOpen && (
                  <div className="account-menu">
                    {isCustomer && (
                      <>
                        <Link to="/profile" onClick={() => setAccountOpen(false)}>
                          <FiUser /> Profile
                        </Link>
                        <Link to="/orders" onClick={() => setAccountOpen(false)}>
                          <FiPackage /> My Orders
                        </Link>
                      </>
                    )}

                    {user?.role === "ADMIN" && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)}>
                        <FiPackage /> Admin Panel
                      </Link>
                    )}

                    <button onClick={handleLogout}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {isCustomer && (
              <button className="hbtn primary" onClick={onOpenCart}>
                <FiShoppingCart />
                Cart <span className="cart-badge">{count}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="navbar">
        <div className="container nav-inner">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>

          <NavLink
            to="/vegetables"
            className={navClass}
            onClick={() => setActiveCategoryId(null)}
          >
            Vegetables
          </NavLink>

          <NavLink to="/categories" className={navClass}>
            Categories
          </NavLink>

          {isCustomer && (
            <NavLink to="/orders" className={navClass}>
              My Orders
            </NavLink>
          )}
        </div>
      </nav>
    </>
  );
}
