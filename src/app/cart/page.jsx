"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import { useRestaurants } from "@/hooks/useRestaurants";
import { cn, formatSAR } from "@/lib/utils";
import { optionSummary } from "@/lib/menuDefaults";
import MenuImage from "@/components/MenuImage";

export default function CartPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const router = useRouter();
  const {
    items,
    restaurant,
    setRestaurant,
    updateQuantity,
    updateOfferQty,
    removeItem,
    removeOfferGroup,
    total,
    hydrated,
  } = useCart();
  const { activeRestaurants, loading: restLoading } = useRestaurants();

  const displayItems = useMemo(() => {
    const offerMap = {};
    items
      .filter((i) => i.offerGroupId)
      .forEach((item) => {
        if (!offerMap[item.offerGroupId]) {
          offerMap[item.offerGroupId] = {
            type: "offer",
            offerGroupId: item.offerGroupId,
            titleEn: item.offerTitleEn,
            titleAr: item.offerTitleAr,
            offerQty: item.offerQty ?? 1,
            constituentItems: [],
            totalPrice: 0,
          };
        }
        offerMap[item.offerGroupId].constituentItems.push(item);
        offerMap[item.offerGroupId].totalPrice += item.price * item.quantity;
      });
    return [
      ...Object.values(offerMap),
      ...items.filter((i) => !i.offerGroupId).map((i) => ({ type: "item", ...i })),
    ];
  }, [items]);

  const restaurantOk =
    restaurant && activeRestaurants.some((r) => r.id === restaurant.id);
  const canCheckout = hydrated && items.length > 0 && Boolean(restaurantOk);

  if (!hydrated) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <ShoppingBag size={28} />
        </div>
        <h1 className="display mt-6 text-3xl font-black">{t.emptyCart}</h1>
        <Link
          href="/menu"
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          {t.emptyCartCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="display text-4xl font-black text-primary-dark">{t.cart}</h1>

      <div className="mt-8 space-y-4">
        {displayItems.map((entry) => {
          if (entry.type === "offer") {
            return (
              <article
                key={entry.offerGroupId}
                className="rounded-3xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-primary" />
                    <h2 className="display font-bold">
                      {isAr ? entry.titleAr : entry.titleEn}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOfferGroup(entry.offerGroupId)}
                    className="text-destructive"
                    aria-label={t.remove}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {entry.constituentItems.map((ci) => (
                    <li key={ci.cartId}>
                      · {isAr ? ci.nameAr : ci.nameEn}
                      {ci.baseQty > 1 ? ` ×${ci.baseQty}` : ""}
                      {optionSummary(ci, isAr) ? ` (${optionSummary(ci, isAr)})` : ""}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-bold">{formatSAR(entry.totalPrice)}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                      onClick={() =>
                        updateOfferQty(entry.offerGroupId, entry.offerQty - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-5 text-center text-sm font-bold">
                      {entry.offerQty}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                      onClick={() =>
                        updateOfferQty(entry.offerGroupId, entry.offerQty + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          }

          const item = entry;
          return (
            <article
              key={item.cartId}
              className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-sm"
            >
              <MenuImage
                src={item.image}
                alt={isAr ? item.nameAr : item.nameEn}
                className="h-20 w-20 shrink-0 rounded-2xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold">{isAr ? item.nameAr : item.nameEn}</h2>
                    {optionSummary(item, isAr) ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {optionSummary(item, isAr)}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.cartId)}
                    className="text-destructive"
                    aria-label={t.remove}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-bold">
                    {formatSAR(item.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-5 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="display text-2xl font-black">{t.selectRestaurant}</h2>
        {restLoading ? (
          <p className="mt-4 text-muted-foreground">{t.loading}</p>
        ) : activeRestaurants.length === 0 ? (
          <p className="mt-4 text-muted-foreground">{t.noActiveRestaurants}</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {activeRestaurants.map((r) => {
              const selected = restaurant?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    setRestaurant({
                      id: r.id,
                      nameEn: r.nameEn,
                      nameAr: r.nameAr,
                      address: r.address,
                      phone: r.phone,
                      logoImage: r.logoImage,
                      isActive: r.isActive,
                    })
                  }
                  className={cn(
                    "flex items-center gap-4 rounded-3xl border p-4 text-start",
                    selected
                      ? "border-primary bg-secondary/60 ring-2 ring-primary/20"
                      : "border-border bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2",
                      selected ? "border-primary" : "border-border",
                    )}
                  >
                    {selected ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </span>
                  <MenuImage
                    src={r.logoImage}
                    alt={isAr ? r.nameAr : r.nameEn}
                    className="h-12 w-12 rounded-2xl"
                  />
                  <span>
                    <span className="block font-bold">
                      {isAr ? r.nameAr : r.nameEn}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {r.address}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-10 flex items-center justify-between rounded-3xl bg-secondary px-5 py-4">
        <span className="font-semibold">{t.total}</span>
        <span className="text-lg font-black">{formatSAR(total)}</span>
      </div>

      <button
        type="button"
        disabled={!canCheckout}
        onClick={() => router.push("/checkout")}
        className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.continueToCheckout}
      </button>
    </div>
  );
}
