"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChefHat,
  Flame,
  Leaf,
  Maximize2,
  Minus,
  Plus,
  PlusCircle,
  ShoppingBag,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { formatSAR, cn } from "@/lib/utils";
import { cheapestSizeId, sizePriceAddFor } from "@/lib/menuDefaults";
import MenuImage from "@/components/MenuImage";

function ItemEditor({ itemId }) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const router = useRouter();
  const { menuItems, extrasOptions, sizeOptions, allergiesOptions, loading } =
    useMenu();
  const { addItem } = useCart();

  const item = menuItems.find((i) => i.id === itemId);

  const [quantity, setQuantity] = useState(1);
  const [selectedExtraIds, setSelectedExtraIds] = useState([]);
  const [cookingOverride, setCookingOverride] = useState(null);
  const [sizeOverride, setSizeOverride] = useState(null);

  const availableSizes = useMemo(
    () =>
      sizeOptions.filter((sz) => (item?.availableSizes ?? []).includes(sz.id)),
    [sizeOptions, item],
  );

  const defaultCooking = item?.cookingOptions?.length
    ? item.cookingOptions.find((o) => o.isDefault) || item.cookingOptions[0]
    : null;
  const selectedCookingId = cookingOverride ?? defaultCooking?.id ?? null;
  const selectedSizeId = sizeOverride ?? cheapestSizeId(item, sizeOptions);

  if (loading) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (!item) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.noData}</p>;
  }

  const extrasList = extrasOptions.filter((extra) =>
    (item.availableExtras || []).includes(extra.id),
  );

  const extrasTotal = selectedExtraIds.reduce((sum, extId) => {
    const ext = extrasOptions.find((e) => e.id === extId);
    return sum + (ext ? Number(ext.price) || 0 : 0);
  }, 0);

  const cookingOption = (item.cookingOptions || []).find(
    (o) => o.id === selectedCookingId,
  );
  const cookingAdd = cookingOption?.priceAdd || 0;
  const sizeAdd = sizePriceAddFor(item, selectedSizeId, sizeOptions);
  const sizeOption = availableSizes.find((sz) => sz.id === selectedSizeId);

  const displayCalories =
    availableSizes.length > 0 &&
    selectedSizeId &&
    item.sizeCalories?.[selectedSizeId] != null
      ? item.sizeCalories[selectedSizeId]
      : (item.calories ?? null);

  const unitPrice = (item.price || 0) + extrasTotal + cookingAdd + sizeAdd;
  const totalPrice = unitPrice * quantity;

  const displayedAllergies = (() => {
    const ids = new Set(
      (item.allergies || []).filter((v) => typeof v === "string"),
    );
    selectedExtraIds.forEach((extId) => {
      const extra = extrasOptions.find((e) => e.id === extId);
      (extra?.allergyIds || []).forEach((id) => ids.add(id));
    });
    return [...ids]
      .map((id) => allergiesOptions.find((a) => a.id === id))
      .filter(Boolean);
  })();

  const toggleExtra = (extId) => {
    setSelectedExtraIds((prev) =>
      prev.includes(extId) ? prev.filter((e) => e !== extId) : [...prev, extId],
    );
  };

  const handleAdd = () => {
    const extrasInfo = selectedExtraIds
      .map((extId) => extrasOptions.find((e) => e.id === extId))
      .filter(Boolean)
      .map((ext) => ({
        nameEn: ext.nameEn,
        nameAr: ext.nameAr,
        priceAdd: ext.price,
      }));

    addItem({
      id: item.id,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      price: unitPrice,
      quantity,
      image: item.image,
      ...(sizeOption && {
        selectedSize: {
          nameEn: sizeOption.nameEn,
          nameAr: sizeOption.nameAr,
          priceAdd: sizeAdd,
        },
      }),
      ...(cookingOption && {
        selectedCookingOption: {
          nameEn: cookingOption.nameEn,
          nameAr: cookingOption.nameAr,
          priceAdd: cookingOption.priceAdd,
        },
      }),
      ...(extrasInfo.length > 0 && { selectedExtras: extrasInfo }),
    });
    router.push("/menu");
  };

  const name = isAr ? item.nameAr : item.nameEn;
  const description = isAr ? item.descriptionAr : item.descriptionEn;

  return (
    <div className="mx-auto max-w-3xl pb-32">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary sm:rounded-b-3xl">
        <MenuImage src={item.image} alt={name} className="h-full w-full" />
        {displayCalories != null ? (
          <div className="absolute bottom-4 end-4 flex items-center gap-1.5 rounded-full bg-primary-dark/75 px-3 py-1.5 text-primary-foreground">
            <Flame size={14} />
            <span className="text-sm font-bold">{displayCalories}</span>
            <span className="text-xs opacity-80">{t.caloriesLabel}</span>
          </div>
        ) : null}
      </div>

      <div className="px-4 py-6 sm:px-6">
        <Link href="/menu" className="text-sm font-semibold text-accent hover:underline">
          {t.backToMenu}
        </Link>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h1 className="display text-3xl font-black text-primary-dark">{name}</h1>
          <p className="shrink-0 text-lg font-bold text-primary">{formatSAR(item.price)}</p>
        </div>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}

        {item.ingredients?.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Leaf size={16} /> {t.ingredients}
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                >
                  {isAr ? ing.nameAr : ing.nameEn}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {availableSizes.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Maximize2 size={16} /> {t.size}
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => {
                const active = selectedSizeId === sz.id;
                const add = sizePriceAddFor(item, sz.id, sizeOptions);
                const kcal = item.sizeCalories?.[sz.id];
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setSizeOverride(sz.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {isAr ? sz.nameAr : sz.nameEn}
                    {add > 0 ? (
                      <span className={cn("text-xs", active ? "opacity-90" : "text-muted-foreground")}>
                        +{formatSAR(add)}
                      </span>
                    ) : null}
                    {kcal != null ? (
                      <span className="inline-flex items-center gap-0.5 text-xs">
                        <Flame size={11} />
                        {kcal}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {item.cookingOptions?.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ChefHat size={16} /> {t.cookingStyle}
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.cookingOptions.map((opt) => {
                const active = selectedCookingId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCookingOverride(opt.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {isAr ? opt.nameAr : opt.nameEn}
                    {opt.priceAdd > 0 ? (
                      <span className={cn("text-xs", active ? "opacity-90" : "text-muted-foreground")}>
                        +{formatSAR(opt.priceAdd)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {extrasList.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <PlusCircle size={16} /> {t.extras}
            </h2>
            <div className="divide-y divide-border rounded-3xl border border-border bg-card">
              {extrasList.map((extra) => {
                const selected = selectedExtraIds.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-start"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border-2",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {selected ? <Check size={12} /> : null}
                    </span>
                    <span className="flex-1 text-sm font-semibold">
                      {isAr ? extra.nameAr : extra.nameEn}
                    </span>
                    {extra.calories != null && extra.calories !== "" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame size={12} />
                        {extra.calories}
                      </span>
                    ) : null}
                    <span className="text-sm text-muted-foreground">
                      +{formatSAR(extra.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {displayedAllergies.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle size={16} /> {t.allergies}
            </h2>
            <div className="flex flex-wrap gap-2">
              {displayedAllergies.map((alg) => (
                <span
                  key={alg.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-900"
                >
                  <AlertTriangle size={12} />
                  {isAr ? alg.nameAr : alg.nameEn}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label={t.quantity}
            >
              <Minus size={16} />
            </button>
            <span className="min-w-6 text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="flex-1 text-lg font-black">{formatSAR(totalPrice)}</p>
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
            aria-label={t.addToCart}
          >
            <ShoppingBag size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemPageInner() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");
  return <ItemEditor key={itemId || "none"} itemId={itemId} />;
}

function PageFallback() {
  const { t } = useI18n();
  return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
}

export default function ItemPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ItemPageInner />
    </Suspense>
  );
}
