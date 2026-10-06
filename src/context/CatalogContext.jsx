import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { categoryApi } from "../api/categoryApi";
import { vegetableApi } from "../api/vegetableApi";
import { useAuth } from "./AuthContext";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const refreshCatalog = useCallback(async () => {
    if (!isAuthenticated) {
      setCategories([]);
      setVegetables([]);
      setCatalogError("");
      return;
    }

    setLoading(true);
    setCatalogError("");

    try {
      const [categoryData, vegetableData] = await Promise.all([
        categoryApi.getAll(),
        vegetableApi.getAll(),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setVegetables(Array.isArray(vegetableData) ? vegetableData : []);
    } catch (error) {
      setCatalogError(error.message || "Unable to load catalogue");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog, user?.role]);

  const filteredVegetables = useMemo(() => {
    let list = [...vegetables];

    if (activeCategoryId) {
      const category = categories.find(
        (item) => Number(item.categoryId) === Number(activeCategoryId)
      );

      if (category) {
        list = list.filter(
          (vegetable) => vegetable.category === category.name
        );
      }
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((vegetable) =>
        [vegetable.name, vegetable.description, vegetable.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      );
    }

    return list;
  }, [vegetables, categories, activeCategoryId, searchQuery]);

  const value = {
    categories,
    vegetables,
    filteredVegetables,
    loading,
    catalogError,
    searchQuery,
    setSearchQuery,
    activeCategoryId,
    setActiveCategoryId,
    refreshCatalog,
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return context;
}
