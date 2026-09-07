import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as SAR currency.
 * @param {number} amount
 * @returns {string}
 */
export function formatSAR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "0.00 ر.س";
  return `${n.toFixed(2)} ر.س`;
}

/**
 * Generate a 5-digit order number string.
 * @returns {string}
 */
export function generateOrderNumber() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * @param {import('firebase/firestore').Timestamp | Date | null | undefined} value
 * @returns {string}
 */
export function formatOrderDate(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export const LAST_ORDER_KEY = "maq_last_order_id";
export const SAVED_CAR_KEY = "maq_saved_car";
export const SAVED_RESTAURANT_KEY = "maq_saved_restaurant";
export const CART_STORAGE_KEY = "maq_cart_v1";

export const CAR_COLORS = [
  { key: "black", hex: "#222222" },
  { key: "white", hex: "#FFFFFF" },
  { key: "silver", hex: "#C0C0C0" },
  { key: "gray", hex: "#808080" },
  { key: "red", hex: "#CC0000" },
  { key: "blue", hex: "#0044CC" },
  { key: "brown", hex: "#8B4513" },
  { key: "green", hex: "#228B22" },
  { key: "gold", hex: "#DAA520" },
  { key: "beige", hex: "#F5F5DC" },
];

export const statusColors = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  preparing: "bg-sky-100 text-sky-800 border-sky-300",
  onTheWay: "bg-orange-100 text-orange-800 border-orange-300",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};
