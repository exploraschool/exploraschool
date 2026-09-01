"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type CartItem,
  createCartItemId,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  addItems: (items: Omit<CartItem, "id">[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<CartItem>) => void;
  clearCart: () => void;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(loadCartFromStorage());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) saveCartToStorage(items);
  }, [items, isReady]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: createCartItemId() }]);
  }, []);

  const addItems = useCallback((newItems: Omit<CartItem, "id">[]) => {
    setItems((prev) => [
      ...prev,
      ...newItems.map((item) => ({ ...item, id: createCartItemId() })),
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<CartItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      addItem,
      addItems,
      removeItem,
      updateItem,
      clearCart,
      isReady,
    }),
    [items, addItem, addItems, removeItem, updateItem, clearCart, isReady],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
