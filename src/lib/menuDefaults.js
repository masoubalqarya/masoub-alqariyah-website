/** True when the customer must open the item screen (size and/or cooking). */
export function itemHasCustomOptions(item) {
  return (
    (item?.availableSizes?.length ?? 0) > 0 ||
    (item?.cookingOptions?.length ?? 0) > 0
  );
}

export function sizePriceAddFor(item, sizeId, sizeOptions = []) {
  if (!sizeId) return 0;
  const perItem = item?.sizePriceAdd?.[sizeId];
  if (perItem != null && perItem !== "") return Number(perItem);
  return sizeOptions.find((sz) => sz.id === sizeId)?.priceAdd || 0;
}

/** Cheapest attached size (lowest sizePriceAdd), not catalog order. */
export function cheapestSizeId(item, sizeOptions = []) {
  const ids = item?.availableSizes || [];
  if (!ids.length) return null;
  let bestId = ids[0];
  let bestAdd = Infinity;
  ids.forEach((id) => {
    const add = sizePriceAddFor(item, id, sizeOptions);
    if (add < bestAdd) {
      bestAdd = add;
      bestId = id;
    }
  });
  return bestId;
}

export function defaultCookingOption(item) {
  const opts = item?.cookingOptions || [];
  if (!opts.length) return null;
  return opts.find((o) => o.isDefault) || opts[0];
}

export function defaultSizeOption(item, sizeOptions = []) {
  const id = cheapestSizeId(item, sizeOptions);
  if (!id) return null;
  return sizeOptions.find((sz) => sz.id === id) || null;
}

export function optionSummary(item, isAr) {
  const parts = [];
  if (item?.selectedSize) {
    parts.push(isAr ? item.selectedSize.nameAr : item.selectedSize.nameEn);
  }
  if (item?.selectedCookingOption) {
    parts.push(
      isAr
        ? item.selectedCookingOption.nameAr
        : item.selectedCookingOption.nameEn,
    );
  }
  (item?.selectedExtras || []).forEach((ext) => {
    parts.push(isAr ? ext.nameAr : ext.nameEn);
  });
  return parts.filter(Boolean).join(" · ");
}

export function docWithId(d) {
  const data = d.data() || {};
  return { ...data, id: data.id || d.id };
}
