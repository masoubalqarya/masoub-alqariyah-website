import { priceItem } from "./offer-pricing.js";

export const MENU_BUILDERS = [
  { id: "areeka", titleKey: "buildYourAreeka", productId: "areekah", names: ["areeka", "areekah", "عريكة", "العريكة"] },
  { id: "masoub", titleKey: "buildYourMasoub", productId: "masoub", names: ["masoub", "معصوب", "المعصوب"] },
];

// Match only a known base product, never an arbitrary product in its category.
export function builderItem(builder, items, configured = {}) {
  const configuredId = configured?.[builder.id];
  if (configuredId) return items.find((item) => item.id === configuredId);
  const standard = items.find((item) => item.id === builder.productId);
  if (standard) return standard;
  const matches = items.filter((item) => [item.nameEn, item.nameAr].some((name) =>
    typeof name === "string" && builder.names.includes(name.trim().toLowerCase())));
  return matches.length === 1 ? matches[0] : undefined;
}

// Use the same halala rounding and option validation as authoritative checkout.
export function builderStartingPrice(item, sizes) {
  if (!item) return null;
  const cooking = item.cookingOptions?.find((option) => option.isDefault) || item.cookingOptions?.[0];
  const selected = cooking ? { selectedCookingOption: { id: cooking.id } } : {};
  const choices = item.availableSizes?.length ? item.availableSizes : [null];
  const prices = choices.map((id) => priceItem(item, { ...selected, ...(id && { selectedSize: { id } }) }, sizes)?.price)
    .filter((price) => Number.isFinite(price));
  return prices.length ? Math.min(...prices) : null;
}
