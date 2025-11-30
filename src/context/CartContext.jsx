// Global Cart Context
// Manages cart and saves to localStorage

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart to localStorage on every update
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  function addToCart(product) {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  }

  // Update quantity
  function updateQty(id, qty) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  // Remove item
  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  // ⭐ NEW: Clear cart after order placed
  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeItem,
        clearCart, // <-- IMPORTANT EXPORT
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart
export function useCart() {
  return useContext(CartContext);
}
