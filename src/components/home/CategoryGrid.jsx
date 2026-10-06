import { useNavigate } from "react-router-dom";
import { useCatalog } from "../../context/CatalogContext";
import { getVegetableImage } from "../../utils/images";

export default function CategoryGrid({ items }) {
  const {
    categories,
    vegetables,
    activeCategoryId,
    setActiveCategoryId,
    setSearchQuery,
  } = useCatalog();
  const navigate = useNavigate();
  const categoryList = items || categories;

  const chooseCategory = (categoryId) => {
    setSearchQuery("");
    setActiveCategoryId(categoryId);
    navigate("/vegetables");
  };

  return (
    <div className="category-grid">
      {categoryList.map((category) => {
        const firstVegetable = vegetables.find(
          (vegetable) => vegetable.category === category.name
        );

        return (
          <button
            key={category.categoryId}
            className={`category-card ${
              Number(activeCategoryId) === Number(category.categoryId)
                ? "active"
                : ""
            }`}
            onClick={() => chooseCategory(category.categoryId)}
          >
            <div className="category-img">
              <img
                src={getVegetableImage(firstVegetable)}
                alt={category.name}
              />
            </div>

            <div className="category-copy">
              <b>{category.name}</b>
              <small>
                {category.description || "Browse fresh vegetables"}
              </small>
            </div>
          </button>
        );
      })}
    </div>
  );
}
