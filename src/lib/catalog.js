export const isInStock = (item) => !!item && item.inStock !== false && item.isActive !== false;

export function isOfferInStock(offer, menuItems) {
  return !!offer && offer.isActive !== false && offer.inStock !== false &&
    !!offer.items?.length && offer.items.every((line) =>
      isInStock(menuItems.find((item) => item.id === line.menuItemId)));
}

export function sortFeatured(items) {
  return [...items].sort((a, b) => {
    const featured = Number(b.isFeatured === true) - Number(a.isFeatured === true);
    if (featured) return featured;
    if (a.isFeatured === true) {
      const rank = (item) => Number.isFinite(item.featuredRank) ? item.featuredRank : 0;
      return rank(a) - rank(b);
    }
    return 0;
  });
}
