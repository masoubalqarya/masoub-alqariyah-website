"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import { formatSAR } from "@/lib/utils";

export default function CartBar() {
  const { t } = useI18n();
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <Link
        href="/cart"
        className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg shadow-primary/25"
      >
        <span className="text-sm font-semibold">
          {t.viewCart} · {itemCount} {itemCount === 1 ? t.item : t.items}
        </span>
        <span className="text-sm font-black">{formatSAR(total)}</span>
      </Link>
    </div>
  );
}
