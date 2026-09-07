"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LAST_ORDER_KEY } from "@/lib/utils";
import { subscribeToOrder } from "@/lib/orders";

const ACTIVE = ["pending", "preparing", "onTheWay"];

export default function PendingOrderBanner() {
  const { t } = useI18n();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem(LAST_ORDER_KEY);
    if (!id) return undefined;
    return subscribeToOrder(id, (next) => {
      if (next && ACTIVE.includes(next.status)) setOrder(next);
      else setOrder(null);
    });
  }, []);

  if (!order) return null;

  const statusLabel =
    order.status === "pending"
      ? t.pending
      : order.status === "preparing"
        ? t.preparing
        : t.onTheWay;

  return (
    <Link
      href={`/track?id=${order.id}`}
      className="block border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900"
    >
      {t.lastOrder}
      {order.orderNumber ? ` #${order.orderNumber}` : ""} — {statusLabel} · {t.trackOrder}
    </Link>
  );
}
