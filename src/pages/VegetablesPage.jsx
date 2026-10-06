import LoadingSpinner from "../components/common/LoadingSpinner";
import ProductGrid from "../components/home/ProductGrid";
import { useCatalog } from "../context/CatalogContext";

export default function VegetablesPage() {
  const {
    categories,
    filteredVegetables,
    loading,
    catalogError,
    activeCategoryId,
    setActiveCategoryId,
  } = useCatalog();

  return (
    <main className="page-shell">
      <div className="container">
        <div className="page-title">
          <h1>Fresh Vegetables</h1>
          <p>Browse fresh vegetables with live price and stock information.</p>
        </div>

        <div className="catalog-filters" aria-label="Vegetable categories">
          <button
            className={`filter-chip ${!activeCategoryId ? "active" : ""}`}
            onClick={() => setActiveCategoryId(null)}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.categoryId}
              className={`filter-chip ${
                Number(activeCategoryId) === Number(category.categoryId)
                  ? "active"
                  : ""
              }`}
              onClick={() => setActiveCategoryId(category.categoryId)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading vegetables..." />
        ) : catalogError ? (
          <div className="error-panel">{catalogError}</div>
        ) : (
          <ProductGrid vegetables={filteredVegetables} />
        )}
      </div>
    </main>
  );
}
