"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { priceOffer } from "@/lib/offer-pricing";
import { CART_STORAGE_KEY, SAVED_RESTAURANT_KEY } from "@/lib/utils";
import { isOfferInStock } from "@/lib/catalog";

const CartContext = createContext(null);

function sameLine(a, b) {
  return (
    !a.offerGroupId &&
    !b.offerGroupId &&
    a.id === b.id &&
    JSON.stringify(a.selectedCookingOption) ===
      JSON.stringify(b.selectedCookingOption) &&
    JSON.stringify(a.selectedExtras) === JSON.stringify(b.selectedExtras) &&
    JSON.stringify(a.selectedSize) === JSON.stringify(b.selectedSize)
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurantState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const rest = localStorage.getItem(SAVED_RESTAURANT_KEY);
      if (rest) setRestaurantState(JSON.parse(rest));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const setRestaurant = useCallback((next) => {
    setRestaurantState(next);
    if (next) {
      localStorage.setItem(SAVED_RESTAURANT_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(SAVED_RESTAURANT_KEY);
    }
  }, []);

  const addItem = useCallback((item) => {
    setItems((current) => {
      const existingIndex = current.findIndex((i) => sameLine(i, item));
      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      return [
        ...current,
        {
          ...item,
          cartId: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((current) => current.filter((i) => i.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId, quantity) => {
    setItems((current) => {
      if (quantity <= 0) return current.filter((i) => i.cartId !== cartId);
      return current.map((i) => (i.cartId === cartId ? { ...i, quantity } : i));
    });
  }, []);

  const addOfferItems = useCallback((offer, menuItems, sizeOptions = [], selectedSizes = {}) => {
    const pricing = priceOffer(offer, menuItems, sizeOptions, selectedSizes);
    if (!pricing || !isOfferInStock(offer, menuItems)) return false;
    const offerGroupId = `${offer.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newItems = pricing.lines.map((line, index) => ({
      ...line,
      cartId: `${offerGroupId}_${index}`,
      quantity: line.baseQty,
      offerQty: 1,
      offerId: offer.id,
      offerGroupId,
      offerTitleEn: offer.titleEn,
      offerTitleAr: offer.titleAr,
    }));
    setItems((current) => [...current, ...newItems]);
    return offerGroupId;
  }, []);

  const updateOfferQty = useCallback((offerGroupId, newOfferQty) => {
    setItems((current) => {
      if (newOfferQty <= 0) {
        return current.filter((i) => i.offerGroupId !== offerGroupId);
      }
      if (!Number.isInteger(newOfferQty) || current.some((i) => i.offerGroupId === offerGroupId && i.baseQty * newOfferQty > 999)) return current;
      return current.map((i) =>
        i.offerGroupId === offerGroupId
          ? { ...i, offerQty: newOfferQty, quantity: i.baseQty * newOfferQty }
          : i,
      );
    });
  }, []);

  const removeOfferGroup = useCallback((offerGroupId) => {
    setItems((current) => current.filter((i) => i.offerGroupId !== offerGroupId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100;

  const value = useMemo(
    () => ({
      items,
      restaurant,
      setRestaurant,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      addOfferItems,
      updateOfferQty,
      removeOfferGroup,
      clearCart,
      itemCount,
      total,
    }),
    [
      items,
      restaurant,
      setRestaurant,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      addOfferItems,
      updateOfferQty,
      removeOfferGroup,
      clearCart,
      itemCount,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
