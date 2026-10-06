import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatters";
import { getVegetableImage } from "../../utils/images";

export default function ProductCard({ vegetable }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const {
    addItem,
    setQuantity,
    getCartItemByVegetableId,
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const cartItem = getCartItemByVegetableId(vegetable.vegetableId);
  const outOfStock = Number(vegetable.stock) <= 0;

  const add = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isCustomer) {
      showToast("Admin accounts cannot use the customer cart", "error");
      return;
    }

    try {
      setBusy(true);
      await addItem(vegetable.vegetableId, 1);
      showToast(`${vegetable.name} added to cart`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const changeQuantity = async (nextQuantity) => {
    if (nextQuantity > Number(vegetable.stock)) {
      showToast("Requested quantity is not available", "error");
      return;
    }

    try {
      setBusy(true);
      await setQuantity(cartItem.cartItemId, nextQuantity);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-media">
        <img
          src={getVegetableImage(vegetable)}
          alt={vegetable.name}
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=900";
          }}
        />
        {/* <span className={`fresh-tag ${outOfStock ? "out" : ""}`}>
          {outOfStock ? "Out of stock" : "Fresh stock"}
        </span> */}
      </div>

      <div className="product-body">
        <span className="product-cat">
          {vegetable.category || "Vegetable"}
        </span>
        <h3>{vegetable.name}</h3>
        <p className="product-description">
          {vegetable.description || "Fresh vegetable available to order."}
        </p>
        <span className="weight">{vegetable.unit} </span>

        <div className="product-bottom">
          <div className="price">
            <strong>{formatCurrency(vegetable.price)}</strong>
            <small>Current price</small>
          </div>

          {cartItem ? (
            <div className="stepper">
              <button
                disabled={busy}
                onClick={() => changeQuantity(cartItem.quantity - 1)}
              >
                −
              </button>
              <span>{cartItem.quantity}</span>
              <button
                disabled={
                  busy || cartItem.quantity >= Number(vegetable.stock)
                }
                onClick={() => changeQuantity(cartItem.quantity + 1)}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="add"
              disabled={busy || outOfStock}
              onClick={add}
            >
              {outOfStock ? "SOLD" : "ADD"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
