import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";

export default function CustomerLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="shop-app">
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <Outlet context={{ openCart: () => setCartOpen(true) }} />
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
