import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { MENU_BUILDERS, builderItem, builderStartingPrice } from "./menu-builders.js";
import { priceItem } from "./offer-pricing.js";
import { isInStock } from "./catalog.js";

const [areeka, masoub] = MENU_BUILDERS;
const sizes = [{ id: "cup", priceAdd: 0 }, { id: "large", priceAdd: 12 }];
const base = {
  id: "areekah", nameEn: "Areekah", nameAr: "عريكة", price: 5.15,
  availableSizes: ["large", "cup"], sizePriceAdd: { cup: 0, large: 5.25 },
  cookingOptions: [{ id: "plain", priceAdd: 0 }, { id: "millet", nameAr: "دخن", priceAdd: 1.1, isDefault: true }],
  availableExtras: ["honey"],
};

test("website cards resolve shared admin mappings and never substitute deleted targets or category variants", () => {
  const custom = { ...base, id: "admin-product-id" };
  assert.equal(builderItem(areeka, [base, custom], { areeka: custom.id }), custom);
  assert.equal(builderItem(areeka, [base], { areeka: custom.id }), undefined);
  assert.equal(builderItem(areeka, [base]), base);
  assert.equal(builderItem(areeka, [{ id: "random", nameAr: "العريكة" }]).id, "random");
  assert.equal(builderItem(areeka, [{ id: "a", nameAr: "العريكة" }, { id: "b", nameEn: "Areeka" }]), undefined);
  assert.equal(builderItem(areeka, [{ id: "special", category: "areekah", nameEn: "Areekah special" }]), undefined);
  assert.equal(builderItem(masoub, [base]), undefined);
});

test("starting prices include the cheapest available size and default preparation; stock blocks ordering", () => {
  assert.equal(builderStartingPrice(base, sizes), 6.25);
  assert.equal(builderStartingPrice(base, [sizes[1]]), 11.5);
  assert.equal(builderStartingPrice(base, []), null);
  assert.equal(builderStartingPrice(undefined, sizes), null);
  assert.equal(builderStartingPrice({ ...base, isActive: false }, sizes), null);
  assert.equal(builderStartingPrice({ id: "unsized", price: 5 }, []), 5);
  assert.equal(isInStock(builderItem(areeka, [{ ...base, inStock: false }])), false);
});

test("builder checkout preserves canonical option IDs, names and exact halala totals and rejects stale choices", () => {
  const extras = [{ id: "honey", nameAr: "عسل", price: 2.15 }];
  const selected = { selectedSize: { id: "large" }, selectedCookingOption: { id: "millet" }, selectedExtras: [{ id: "honey" }] };
  const priced = priceItem(base, selected, sizes, extras);
  assert.equal(priced.price, 13.65);
  assert.deepEqual(priced.selectedExtras, [{ id: "honey", nameEn: "", nameAr: "عسل", priceAdd: 2.15 }]);
  assert.equal(priced.selectedSize.priceAdd, 5.25);
  assert.equal(priced.selectedCookingOption.id, "millet");
  assert.equal(priceItem(base, { ...selected, selectedSize: undefined }, sizes, extras), null);
  assert.equal(priceItem(base, selected, sizes, []), null);
  assert.equal(priceItem({ ...base, availableExtras: [] }, selected, sizes, extras), null);
  assert.equal(priceItem({ ...base, cookingOptions: [{ id: "new", priceAdd: 0 }] }, selected, sizes, extras), null);
});

test("mobile and website builder resolution and starting-price implementations stay identical", async (t) => {
  const website = await readFile(new URL("./menu-builders.js", import.meta.url), "utf8");
  let mobile;
  try {
    mobile = await readFile(new URL("../../../masoub-alqarya/src/utils/menu-builders.js", import.meta.url), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    t.skip("Companion mobile checkout unavailable");
    return;
  }
  assert.equal(website.replaceAll("\r\n", "\n"), mobile.replaceAll("\r\n", "\n"));
});
