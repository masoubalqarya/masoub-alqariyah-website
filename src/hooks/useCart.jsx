"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cheapestSizeId,
  defaultCookingOption,
  sizePriceAddFor,
} from "@/lib/menuDefaults";
import { CART_STORAGE_KEY, SAVED_RESTAURANT_KEY } from "@/lib/utils";

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

  const addOfferItems = useCallback((offer, menuItems, sizeOptions = []) => {
    setItems((current) => {
      const existing = current.filter((i) => i.offerGroupId === offer.id);
      if (existing.length > 0) {
        const newOfferQty = (existing[0].offerQty ?? 1) + 1;
        return current.map((i) =>
          i.offerGroupId === offer.id
            ? { ...i, offerQty: newOfferQty, quantity: i.baseQty * newOfferQty }
            : i,
        );
      }

      const lineUnit = (menuItem) => {
        if (!menuItem) return 0;
        const sizeId = cheapestSizeId(menuItem, sizeOptions);
        const cooking = defaultCookingOption(menuItem);
        return (
          (menuItem.price ?? 0) +
          sizePriceAddFor(menuItem, sizeId, sizeOptions) +
          (cooking?.priceAdd || 0)
        );
      };

      const actualTotal = (offer.items || []).reduce((sum, offerItem) => {
        const menuItem = menuItems.find((m) => m.id === offerItem.menuItemId);
        return sum + lineUnit(menuItem) * offerItem.qty;
      }, 0);
      const ratio = actualTotal > 0 ? offer.offerPrice / actualTotal : 1;
      const timestamp = Date.now();

      const newItems = (offer.items || []).map((offerItem, i) => {
        const menuItem = menuItems.find((m) => m.id === offerItem.menuItemId);
        const sizeId = cheapestSizeId(menuItem, sizeOptions);
        const sizeOption = sizeOptions.find((sz) => sz.id === sizeId);
        const sizeAdd = sizePriceAddFor(menuItem, sizeId, sizeOptions);
        const cooking = defaultCookingOption(menuItem);
        const unit = lineUnit(menuItem);
        return {
          cartId: `${timestamp}_${i}`,
          id: offerItem.menuItemId,
          nameEn: offerItem.nameEn,
          nameAr: offerItem.nameAr,
          image: menuItem?.image ?? offer.image,
          price: parseFloat((unit * ratio).toFixed(2)),
          baseQty: offerItem.qty,
          quantity: offerItem.qty,
          offerQty: 1,
          offerId: offer.id,
          offerGroupId: offer.id,
          offerTitleEn: offer.titleEn,
          offerTitleAr: offer.titleAr,
          ...(sizeOption && {
            selectedSize: {
              nameEn: sizeOption.nameEn,
              nameAr: sizeOption.nameAr,
              priceAdd: sizeAdd,
            },
          }),
          ...(cooking && {
            selectedCookingOption: {
              nameEn: cooking.nameEn,
              nameAr: cooking.nameAr,
              priceAdd: cooking.priceAdd,
            },
          }),
        };
      });
      return [...current, ...newItems];
    });
  }, []);

  const updateOfferQty = useCallback((offerGroupId, newOfferQty) => {
    setItems((current) => {
      if (newOfferQty <= 0) {
        return current.filter((i) => i.offerGroupId !== offerGroupId);
      }
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
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
