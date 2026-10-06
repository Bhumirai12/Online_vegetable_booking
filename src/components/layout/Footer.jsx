import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">FreshBasket</div>
          <p>
            Fresh vegetables for your everyday kitchen. Shop quality produce
            easily and enjoy a simple, convenient grocery shopping experience.
          </p>
        </div>

        <div>
          <b>Shop</b>
          <Link to="/categories">Categories</Link>
          <Link to="/vegetables">Fresh Vegetables</Link>
        </div>

        <div>
          <b>My Account</b>
          <Link to="/login">Login</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div>
          <b>Why FreshBasket?</b>
          <p>
            Fresh quality vegetables, easy ordering, secure payments and
            convenient shopping for your daily needs.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 FreshBasket. All rights reserved.</span>
        <span>Fresh • Simple • Convenient</span>
      </div>
    </footer>
  );
}
