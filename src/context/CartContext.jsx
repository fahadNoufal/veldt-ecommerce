import { createContext, useContext, useState, useCallback } from 'react';
import { getCart } from '../api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartAnimating, setCartAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 600);
  }, []);

  /** Fetch real count from server and set it */
  const refreshCart = useCallback(async () => {
    try {
      const items = await getCart();
      setCartCount(items.length);
    } catch {/* ignore */ }
  }, []);

  /** Add a relative delta (+1 / -1 / -N) */
  const adjustCart = useCallback((delta) => {
    setCartCount(c => Math.max(0, c + delta));
  }, []);

  /** Set an absolute count (e.g. after order placed = 0) */
  const setCount = useCallback((n) => {
    setCartCount(Math.max(0, n));
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, adjustCart, setCount, cartAnimating, triggerAnimation }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
