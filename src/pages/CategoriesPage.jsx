import LoadingSpinner from "../components/common/LoadingSpinner";
import CategoryGrid from "../components/home/CategoryGrid";
import { useCatalog } from "../context/CatalogContext";

export default function CategoriesPage() {
  const { categories, loading, catalogError } = useCatalog();

  return (
    <main className="page-shell">
      <div className="container">
        <div className="page-title">
          <h1>Shop by Category</h1>
          <p>Choose a category to see matching fresh vegetables.</p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading categories..." />
        ) : catalogError ? (
          <div className="error-panel">{catalogError}</div>
        ) : categories.length ? (
          <CategoryGrid />
        ) : (
          <div className="empty-inline">No categories available.</div>
        )}
      </div>
    </main>
  );
}
