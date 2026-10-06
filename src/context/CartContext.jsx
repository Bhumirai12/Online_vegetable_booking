import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cartApi } from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setItems([]);
      return;
    }

    setCartLoading(true);

    try {
      const data = await cartApi.getCart();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      // Current backend returns "Cart not found" for a customer who has
      // never added an item. On the frontend that is simply an empty cart.
      if (error.status === 404) {
        setItems([]);
      } else {
        throw error;
      }
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    refreshCart().catch(() => setItems([]));
  }, [refreshCart]);

  const addItem = async (vegetableId, quantity = 1) => {
    await cartApi.addItem(vegetableId, quantity);
    await refreshCart();
  };

  const setQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await cartApi.removeItem(cartItemId);
    } else {
      await cartApi.updateItem(cartItemId, quantity);
    }
    await refreshCart();
  };

  const removeItem = async (cartItemId) => {
    await cartApi.removeItem(cartItemId);
    await refreshCart();
  };

  const clearCart = async () => {
    if (!items.length) return;
    await cartApi.clear();
    setItems([]);
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const getCartItemByVegetableId = (vegetableId) =>
    items.find(
      (item) => Number(item.vegetableId) === Number(vegetableId)
    );

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        cartLoading,
        refreshCart,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        getCartItemByVegetableId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
