"use client";

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

export default function OrdersPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const router = useRouter();
  const { isFullAccount, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState(null);

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
    (order.items || []).forEach((line) => {
      addItem({
        id: line.itemId,
        nameEn: line.nameEn,
        nameAr: line.nameAr,
        price: line.price,
        quantity: line.quantity || 1,
        selectedSize: line.selectedSize,
        selectedCookingOption: line.selectedCookingOption,
        selectedExtras: line.selectedExtras,
      });
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
                    {t.orderPlacedOn} {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-bold",
                    statusColors[order.status] || statusColors.pending,
                  )}
                >
                  {t[order.status] || order.status}
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
