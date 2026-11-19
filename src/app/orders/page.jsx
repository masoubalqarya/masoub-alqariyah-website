"use client";

import { isPickup, orderStatusKey } from "@/lib/fulfillment";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { fetchUserOrders } from "@/lib/orders";
import { cn, formatOrderDate, formatSAR, statusColors } from "@/lib/utils";
import { optionSummary } from "@/lib/menuDefaults";
import { useMenu } from "@/hooks/useMenu";
import { priceItem, priceOffer, offerSizeChoices } from "@/lib/offer-pricing";
import { isInStock, isOfferInStock } from "@/lib/catalog";

export default function OrdersPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const router = useRouter();
  const { isFullAccount, loading: authLoading } = useAuth();
  const { addItem, addOfferItems, updateOfferQty } = useCart();
  const [orders, setOrders] = useState(null);
  const [reorderError, setReorderError] = useState("");
  const { menuItems, offers, sizeOptions, extrasOptions, loading: menuLoading } = useMenu();

  useEffect(() => {
    if (authLoading || !isFullAccount) return undefined;
    let cancelled = false;
    fetchUserOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isFullAccount]);

  const handleReorder = (order) => {
    if (menuLoading || order.items?.some((line) => !isInStock(menuItems.find((item) => item.id === line.itemId)))) {
      setReorderError(t.stockCartWarning);
      return;
    }
    setReorderError("");
    const groups = new Map();
    const regular = [];
    for (const line of order.items || []) {
      if (line.offerGroupId) {
        const group = groups.get(line.offerGroupId) || [];
        group.push(line);
        groups.set(line.offerGroupId, group);
      } else {
        const item = menuItems.find((entry) => entry.id === line.itemId);
        const priced = priceItem(item, line, sizeOptions, extrasOptions);
        if (!priced) { setReorderError(t.cartChanged); return; }
        regular.push({ ...item, ...priced, quantity: line.quantity });
      }
    }
    const bundles = [];
    for (const group of groups.values()) {
      const line = group[0];
      const choices = offerSizeChoices(group);
      const offer = offers.find((entry) => entry.id === line.offerId);
      if (!offer || !isOfferInStock(offer, menuItems) || !choices || !priceOffer(offer, menuItems, sizeOptions, choices)) {
        setReorderError(t.offerUnavailable); return;
      }
      bundles.push({ offer, quantity: line.offerQty, choices });
    }
    regular.forEach((item) => addItem(item));
    bundles.forEach(({ offer, quantity, choices }) => {
      const groupId = addOfferItems(offer, menuItems, sizeOptions, choices);
      if (quantity > 1) updateOfferQty(groupId, quantity);
    });
    router.push("/cart");
  };

  if (authLoading) {
    return (
      <p className="px-4 py-20 text-center text-muted-foreground">{t.loadingOrders}</p>
    );
  }

  if (!isFullAccount) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">{t.signInToViewOrders}</p>
        <Link
          href="/account"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          {t.signIn}
        </Link>
      </div>
    );
  }

  if (orders === null) {
    return (
      <p className="px-4 py-20 text-center text-muted-foreground">{t.loadingOrders}</p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="display text-4xl font-black text-primary-dark">{t.myOrders}</h1>
      {reorderError && <p role="alert" className="mt-4 text-destructive">{reorderError}</p>}

      {orders.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.noOrdersYet}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/track?id=${order.id}`}
                    className="display text-lg font-bold hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.orderPlacedOn} {formatOrderDate(order.createdAt)} · {isPickup(order) ? t.pickup : t.driveThrough}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-bold",
                    statusColors[order.status] || statusColors.pending,
                  )}
                >
                  {t[orderStatusKey(order)] || order.status}
                </span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {(order.items || []).slice(0, 3).map((item, idx) => (
                  <li key={idx}>
                    {isAr ? item.nameAr : item.nameEn} × {item.quantity}
                    {optionSummary(item, isAr) ? ` · ${optionSummary(item, isAr)}` : ""}
                  </li>
                ))}
              </ul>
              {order.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm"><strong>{t.orderNotes}:</strong> {order.notes}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-black">{formatSAR(order.total)}</span>
                <button
                  type="button"
                  onClick={() => handleReorder(order)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-accent"
                >
                  <RotateCcw size={14} />
                  {t.reorder}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
