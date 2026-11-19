export const isInStock = (item) => !!item && item.inStock !== false && item.isActive !== false;

export function isOfferInStock(offer, menuItems) {
  return !!offer && offer.isActive !== false && offer.inStock !== false &&
    !!offer.items?.length && offer.items.every((line) =>
      isInStock(menuItems.find((item) => item.id === line.menuItemId)));
}
