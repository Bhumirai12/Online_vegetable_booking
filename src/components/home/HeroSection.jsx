import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HeroSection() {
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  const goToProducts = () => {
    if (!isAuthenticated || !isCustomer) {
      navigate("/login", { state: { from: "/vegetables" } });
      return;
    }

    navigate("/vegetables");
  };

  const goToCategories = () => {
    if (!isAuthenticated || !isCustomer) {
      navigate("/login", { state: { from: "/categories" } });
      return;
    }

    navigate("/categories");
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-card">
          <div className="hero-copy">
            <span className="kicker">
              <i /> Fresh vegetables, everyday
            </span>

            <h1>
              Fresh produce for your <span>everyday kitchen.</span>
            </h1>

            <p>
              Fresh from the farm, straight to your doorstep. Shop healthy,
              handpicked vegetables and bring freshness to every meal.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={goToProducts}>
                {isAuthenticated && isCustomer
                  ? "Shop Vegetables"
                  : "Login to Shop"}
              </button>

              <button className="btn btn-soft" onClick={goToCategories}>
                Browse Categories
              </button>
            </div>
          </div>

          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1484848560771-c55afee65e0f?auto=format&fit=crop&q=85&w=1400"
              alt="Fresh vegetables at a market"
            />

            <div className="hero-float">
              <span className="check">✓</span>
              <span>
                <b>Fresh Quality</b>
                <small>Handpicked vegetables for your kitchen</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
