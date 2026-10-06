import { useNavigate } from "react-router-dom";
import { FiX, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatters";
import { getVegetableImage } from "../../utils/images";
import EmptyState from "../common/EmptyState";

export default function CartDrawer({ open, onClose }) {
  const { isAuthenticated } = useAuth();
  const {
    items,
    total,
    setQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { vegetables } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const change = async (item, quantity) => {
    const vegetable = vegetables.find(
      (entry) => Number(entry.vegetableId) === Number(item.vegetableId)
    );

    if (vegetable && quantity > Number(vegetable.stock)) {
      showToast("Requested quantity is not available", "error");
      return;
    }

    try {
      await setQuantity(item.cartItemId, quantity);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const remove = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const checkout = () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login");
      return;
    }

    if (!items.length) {
      showToast("Your cart is empty", "error");
      return;
    }

    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <button
        aria-label="Close cart"
        className={`drawer-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`cart-drawer ${open ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <small>FRESHBASKET</small>
            <h3>Your cart</h3>
          </div>
          <button className="xbtn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="drawer-body">
          {!items.length ? (
            <EmptyState
              title="Your cart is empty"
              message="Add fresh vegetables to continue."
            />
          ) : (
            items.map((item) => {
              const vegetable = vegetables.find(
                (entry) =>
                  Number(entry.vegetableId) === Number(item.vegetableId)
              );

              return (
                <div className="cart-row" key={item.cartItemId}>
                  <img
                    src={getVegetableImage(vegetable)}
                    alt={item.vegetableName}
                  />

                  <div className="cart-row-copy">
                    <h4>{item.vegetableName}</h4>
                    <small>{formatCurrency(item.price)} each</small>
                    <strong>{formatCurrency(item.total)}</strong>

                    <button
                      className="remove-link"
                      onClick={() => remove(item.cartItemId)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>

                  <div className="stepper vertical-safe">
                    <button
                      onClick={() => change(item, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => change(item, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="drawer-foot">
          {items.length > 0 && (
            <button
              className="text-btn clear-cart"
              onClick={() =>
                clearCart().catch((error) =>
                  showToast(error.message, "error")
                )
              }
            >
              Clear cart
            </button>
          )}
          <div className="total-line">
            <b>Total</b>
            <b>{formatCurrency(total)}</b>
          </div>
          <button className="btn btn-primary full" onClick={checkout}>
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </>
  );
}
