import { useNavigate } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import Benefits from "../components/home/Benefits";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductGrid from "../components/home/ProductGrid";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";

const previewVegetables = [
  {
    name: "Fresh Tomato",
    category: "Everyday Essentials",
    description: "Fresh and juicy tomatoes for everyday cooking.",
    imageUrl:
      "https://images.unsplash.com/photo-1752753957362-8edea1c3df7b?auto=format&fit=crop&q=82&w=900",
  },
  {
    name: "Potato",
    category: "Root Vegetables",
    description: "Fresh potatoes perfect for daily meals.",
    imageUrl:
      "https://images.unsplash.com/photo-1566055803687-0665ef48df90?auto=format&fit=crop&q=82&w=900",
  },
  {
    name: "Orange Carrot",
    category: "Root Vegetables",
    description: "Crunchy fresh carrots packed with natural goodness.",
    imageUrl:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&q=82&w=900",
  },
  {
    name: "Broccoli",
    category: "Green Vegetables",
    description: "Fresh green broccoli for healthy meals.",
    imageUrl:
      "https://images.unsplash.com/photo-1685504445355-0e7bdf90d415?auto=format&fit=crop&q=82&w=900",
  },
  {
    name: "Fresh Spinach",
    category: "Leafy Greens",
    description: "Fresh leafy spinach for nutritious everyday dishes.",
    imageUrl:
      "https://images.unsplash.com/photo-1784043436675-dbe53cbcec88?auto=format&fit=crop&q=82&w=900",
  },
];

function PublicVegetablePreview() {
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <h2>Fresh vegetables</h2>
            <p>Explore a few fresh picks before you start shopping.</p>
          </div>

          <button className="text-btn" onClick={() => navigate("/login")}>
            Show all →
          </button>
        </div>

        <div className="products">
          {previewVegetables.map((vegetable) => (
            <article className="product" key={vegetable.name}>
              <div className="product-media">
                <img src={vegetable.imageUrl} alt={vegetable.name} />
                <span className="fresh-tag">Fresh Stock</span>
              </div>

              <div className="product-body">
                <span className="product-cat">{vegetable.category}</span>
                <h3>{vegetable.name}</h3>
                <span className="weight">{vegetable.description}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { isAuthenticated, isCustomer } = useAuth();
  const { categories, vegetables, loading, catalogError } = useCatalog();
  const navigate = useNavigate();

  const showLivePreview = isAuthenticated && isCustomer;

  return (
    <main>
      <HeroSection />
      <Benefits />

      {!showLivePreview ? (
        <PublicVegetablePreview />
      ) : loading ? (
        <div className="container">
          <LoadingSpinner label="Loading fresh catalogue..." />
        </div>
      ) : catalogError ? (
        <section className="section">
          <div className="container error-panel">{catalogError}</div>
        </section>
      ) : (
        <>
          <section className="section">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Shop by category</h2>
                  <p>Your basket, your choice, your freshness.</p>
                </div>

                <button
                  className="text-btn"
                  onClick={() => navigate("/categories")}
                >
                  View all →
                </button>
              </div>

              {categories.length ? (
                <CategoryGrid items={categories.slice(0, 6)} />
              ) : (
                <div className="empty-inline">No categories available.</div>
              )}
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Fresh vegetables</h2>
                  <p>Explore fresh picks for every taste and every meal.</p>
                </div>

                <button
                  className="text-btn"
                  onClick={() => navigate("/vegetables")}
                >
                  Show all →
                </button>
              </div>

              <ProductGrid vegetables={vegetables.slice(0, 5)} />
            </div>
          </section>
        </>
      )}

      <div className="container market-banner">
        <div className="market-copy">
          <span>Fresh from the market</span>
          <h2>Fresh vegetables for a healthier everyday life.</h2>
          <p>
            Discover fresh and quality vegetables for your daily kitchen.
            Browse your favourites, add them to your cart and enjoy a simple
            and convenient shopping experience.
          </p>
        </div>

        <div className="market-img">
          <img
            src="https://images.unsplash.com/photo-1484848560771-c55afee65e0f?auto=format&fit=crop&q=80&w=1000"
            alt="Fresh vegetable market"
          />
        </div>
      </div>
    </main>
  );
}
