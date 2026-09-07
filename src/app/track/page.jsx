"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChefHat, Clock, Truck, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { subscribeToOrder } from "@/lib/orders";
import {
  CAR_COLORS,
  LAST_ORDER_KEY,
  cn,
  formatSAR,
  statusColors,
} from "@/lib/utils";
import { optionSummary } from "@/lib/menuDefaults";

const PIPELINE = ["pending", "preparing", "onTheWay", "delivered"];

const PIPELINE_ICONS = {
  pending: Clock,
  preparing: ChefHat,
  onTheWay: Truck,
  delivered: CheckCircle2,
};

function colorLabel(t, key) {
  if (!key) return "";
  const found = CAR_COLORS.find((c) => c.key === key);
  if (!found) return key;
  const k = `color${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  return t[k] || key;
}

function subscribeNoop() {
  return () => {};
}

function getLastOrderId() {
  try {
    return localStorage.getItem(LAST_ORDER_KEY) || "";
  } catch {
    return "";
  }
}

function TrackLive({ orderId }) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    return subscribeToOrder(orderId, setOrder, () => setOrder(null));
  }, [orderId]);

  if (order === undefined) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">{t.trackNotFound}</p>
        <Link href="/menu" className="mt-6 inline-block font-bold text-accent hover:underline">
          {t.backToMenu}
        </Link>
      </div>
    );
  }

  const statusIndex = PIPELINE.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-4xl font-black text-primary-dark">{t.trackOrder}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.orderNumber} #{order.orderNumber}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold",
            statusColors[order.status] || statusColors.pending,
          )}
        >
          {t[order.status] || order.status}
        </span>
      </div>

      {cancelled ? (
        <div className="mt-8 flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800">
          <XCircle size={28} />
          <div>
            <p className="font-bold">{t.cancelled}</p>
          </div>
        </div>
      ) : (
        <ol className="mt-10 space-y-0">
          {PIPELINE.map((status, index) => {
            const Icon = PIPELINE_ICONS[status];
            const done = statusIndex >= index;
            const active = statusIndex === index;
            return (
              <li key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2",
                      done
                        ? "border-primary bg-secondary text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Icon size={22} />
                  </span>
                  {index < PIPELINE.length - 1 ? (
                    <span
                      className={cn(
                        "h-8 w-0.5",
                        statusIndex > index ? "bg-primary" : "bg-border",
                      )}
                    />
                  ) : null}
                </div>
                <p className={cn("pt-3 font-semibold", active && "text-primary")}>
                  {t[status]}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {!cancelled ? (
        <p className="clay-panel mt-8 rounded-3xl p-5 text-sm font-semibold leading-relaxed">
          {t.stayInCar}
        </p>
      ) : null}

      <section className="mt-8 space-y-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{t.plateNumber}</span>
          <span className="font-bold">{order.plateNumber}</span>
        </div>
        {order.carColor ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{t.carColor}</span>
            <span className="font-bold">{colorLabel(t, order.carColor)}</span>
          </div>
        ) : null}
        {order.restaurantName ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{t.restaurant}</span>
            <span className="font-bold">{order.restaurantName}</span>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <h2 className="display text-xl font-bold">{t.items}</h2>
        <ul className="mt-4 space-y-3">
          {(order.items || []).map((item, idx) => (
            <li key={idx} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold">
                  {isAr ? item.nameAr : item.nameEn} × {item.quantity}
                </p>
                {optionSummary(item, isAr) ? (
                  <p className="text-xs text-muted-foreground">{optionSummary(item, isAr)}</p>
                ) : null}
              </div>
              <span className="font-bold">
                {formatSAR(item.subtotal ?? item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-black">
          <span>{t.total}</span>
          <span>{formatSAR(order.total)}</span>
        </div>
      </section>

      <Link
        href="/menu"
        className="mt-8 inline-flex rounded-full border border-border bg-card px-6 py-3 text-sm font-bold"
      >
        {t.backToMenu}
      </Link>
    </div>
  );
}

function TrackPageInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const lastOrderId = useSyncExternalStore(
    subscribeNoop,
    getLastOrderId,
    () => null,
  );
  const waitingForStorage = !paramId && lastOrderId === null;
  const orderId = paramId || lastOrderId || "";

  if (waitingForStorage) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (!orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">{t.trackNeedId}</p>
        <Link href="/account" className="mt-6 inline-block font-bold text-accent hover:underline">
          {t.navAccount}
        </Link>
      </div>
    );
  }

  return <TrackLive key={orderId} orderId={orderId} />;
}

function PageFallback() {
  const { t } = useI18n();
  return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
}

export default function TrackPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TrackPageInner />
    </Suspense>
  );
}
