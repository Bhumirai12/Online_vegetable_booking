import ProductCard from "./ProductCard";
import EmptyState from "../common/EmptyState";

export default function ProductGrid({ vegetables }) {
  if (!vegetables.length) {
    return (
      <EmptyState
        title="No vegetables found"
        message="Try another search or category."
      />
    );
  }

  return (
    <div className="products">
      {vegetables.map((vegetable) => (
        <ProductCard
          key={vegetable.vegetableId}
          vegetable={vegetable}
        />
      ))}
    </div>
  );
}
