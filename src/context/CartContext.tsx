import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('barbershop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('barbershop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock_qty <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock_qty, existing.qty + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: newQty } : item
        );
      }
      return [...prev, { product, qty: Math.min(product.stock_qty, quantity) }];
    });

    window.dispatchEvent(
      new CustomEvent('app_toast', {
        detail: { message: `Added "${product.name}" to cart.`, type: 'success' },
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const cappedQty = Math.min(item.product.stock_qty, Math.max(1, qty));
            return { ...item, qty: cappedQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
